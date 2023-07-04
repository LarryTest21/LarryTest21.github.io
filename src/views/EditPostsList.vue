<script setup lang="ts">
import { ref, watch, computed, toRaw, onUnmounted, onMounted } from "vue";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";
import { useLoaderState } from "@/store/isloading";
import differenceBy from "lodash/differenceBy";
import $ from "jquery";
import { doc, deleteDoc } from "firebase/firestore";
import moment from "moment";

const isLoading = useLoaderState();
const { changeStateFalse } = isLoading;

const blogPostsRefreshArray = ref([]) as any;
const newsPostsRefreshArray = ref([]) as any;
const newsPostsRefreshed = ref([]) as any;
const differencePosts = ref();
const newsDifferencePosts = ref();
const Logo = new URL("../assets/logos/logo.svg", import.meta.url).href;

const showBlogPostsRefresh = ref(false);
const blogPosts = ref([]) as any;
const newsPosts = ref([]) as any;

const postKind = ref();

const blogRef = firebase.firestore().collection("blogposts");
const newsRef = firebase.firestore().collection("news");

const intervalID = ref() as any;
const blogPostsRefreshed = ref(false);
const transitionList = ref() as any;

const showNews = ref(false);
const showBlog = ref(false);

watch(showNews, () => {
  console.log(showNews.value);
  if (showNews) {
    postKind.value = "news";
  } else {
    postKind.value = "blogposts";
  }
});

const showNewsButton = () => {
  clearInterval(intervalID.value);

  intervalID.value = setInterval(refreshNewsPostRequest, 2000);
  showNews.value = true;
  showBlog.value = false;
};

const showBlogButton = () => {
  clearInterval(intervalID.value);

  intervalID.value = setInterval(refreshBlogPostRequest, 2000);
  showNews.value = false;
  showBlog.value = true;
};

const deletePost = async (postID, post) => {
  if ((postKind.value = "blogposts")) {
    blogPosts.value.splice(post, 1);
  }
  if ((postKind.value = "news")) {
    newsPosts.value.splice(post, 1);
  }

  await deleteDoc(doc(db, postKind.value, postID.postID.toString()));
  console.log(postID.postID);
};

const initialNewsPostRequest = async () => {
  newsPostsRefreshed.value = true;

  await newsRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        const check = post.data();
        newsPosts.value.push(check);
      })
    )
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      changeStateFalse();
    });
};

const initialBlogPostRequest =async ()  => {
  blogPostsRefreshed.value = true;

  await blogRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        const check = post.data();
        blogPosts.value.push(check);
      })
    )
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      changeStateFalse();
    });
};
const refreshNewsPostRequest = () => {
  transitionList.value = "fadePosts";
  console.log("posts refreshing");

  newsRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        newsPostsRefreshed.value = true;
        var check2 = post.data();
        newsPostsRefreshArray.value.push(check2);

        newsDifferencePosts.value = differenceBy(
          newsPostsRefreshArray.value,
          newsPosts.value,
          "postID"
        );

        if (newsDifferencePosts.value.length !== 0) {
          newsPosts.value.push(newsDifferencePosts.value[0]);
          newsPostsRefreshArray.value = [];
          check2 = [];
        } else {
          newsPostsRefreshArray.value = [];
        }
      })
    )
    .then(() => {
      if (newsDifferencePosts.value !== undefined) {

        if (newsDifferencePosts.value.length !== 0) {
          newsPostsRefreshArray.value = [];
          showBlogPostsRefresh.value = false;
        }
      } else {
        console.log("no new posts");
      }
    });
};

const refreshBlogPostRequest = () => {
  transitionList.value = "fadePosts";
  console.log("posts refreshing");
  blogRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        blogPostsRefreshed.value = true;
        var check2 = post.data();
        blogPostsRefreshArray.value.push(check2);

        differencePosts.value = differenceBy(
          blogPostsRefreshArray.value,
          blogPosts.value,
          "postID"
        );

        if (differencePosts.value.length !== 0) {
          blogPosts.value.push(differencePosts.value[0]);
          blogPostsRefreshArray.value = [];
          check2 = [];
        } else {
          blogPostsRefreshArray.value = [];
        }
      })
    )
    .then(() => {
      if (differencePosts.value !== undefined) {
        if (differencePosts.value.length !== 0) {
          blogPostsRefreshArray.value = [];
          showBlogPostsRefresh.value = false;
        }
      } else {
        console.log("no new posts");
      }
    });
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
  }
});

onMounted(() => {
  initialBlogPostRequest();
  initialNewsPostRequest();
});

onUnmounted(() => {
  clearInterval(intervalID.value);
});
</script>

<template>
  <div class="editposts-wrapper">
    <div class="edit-posts-inner">
      <div class="buttons">
        <div class="news-blog">
          <input type="button" @click="showNewsButton" value="News" />
          <input type="button" @click="showBlogButton" value="Blog" />
        </div>
        <div class="newpost-wrapper">
          <input
            class="create-new-post"
            type="button"
            @click="$router.push('/createpost/newPost')"
            value="+ Create Post"
          />
        </div>
      </div>

      <div class="posts-wrapper">
        <TransitionGroup name="fade">
          <div
            class="blog posts-card"
            v-for="(post, value, index) in blogPosts"
            :key="value"
            v-show="blogPostsRefreshed && showBlog"
          >
            <div class="posts" :key="value">
              <div class="cover-image" :key="value">
                <img :src="post.coverImage || Logo" alt="" :key="value" />
              </div>
              <div class="blogposts-meta" :key="value">
                <p class="postTitle" :key="value">{{ post.postTitle }}</p>
                <p class="postUploadTime" :key="value">
                  Post Uploaded First:
                  {{
                    moment(new Date(+post.postID)).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>

                <p class="postLastUpload" :key="value">
                  Post Last Updated
                  {{
                    moment(new Date(post.lastUpload.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postUploadTime" :key="value">
                  Post Release Date:
                  {{
                    moment(new Date(post.postDate.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postAuthor" :key="value">{{ post.postAuthor }}</p>
              </div>
            </div>
            <div class="functions" :key="value">
              <input
                :key="value"
                class="edit"
                type="button"
                name="edit"
                value="Edit"
                @click="$router.push('/createpost/' + post.postID)"
              />
              <input
                :key="value"
                class="delete"
                type="button"
                name="delete"
                value="Delete"
                @click="deletePost(post, value)"
              />
            </div>
          </div>
        </TransitionGroup>
        <TransitionGroup name="fade">
          <div
            class="news posts-card"
            v-for="(post, value) in newsPosts"
            :key="value"
            v-show="newsPostsRefreshed && showNews"
          >
            <div class="posts" :key="value">
              <div class="cover-image" :key="value">
                <img :src="post.coverImage || Logo" alt="" :key="value" />
              </div>
              <div class="blogposts-meta" :key="value">
                <p class="postTitle" :key="value">{{ post.postTitle }}</p>
                <p class="postUploadTime" :key="value">
                  Post Uploaded First:
                  {{
                    moment(new Date(+post.postID)).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>

                <p class="postLastUpload" :key="value">
                  Post Last Updated
                  {{
                    moment(new Date(post.lastUpload.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postUploadTime" :key="value">
                  Post Release Date:
                  {{
                    moment(new Date(post.postDate.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postAuthor" :key="value">{{ post.postAuthor }}</p>
              </div>
            </div>

            <div class="functions" :key="value">
              <input
                :key="value"
                class="edit"
                type="button"
                name="edit"
                value="Edit"
                @click="$router.push('/createpost/' + post.postID)"
              />
              <input
                class="delete"
                type="button"
                name="delete"
                value="Delete"
                @click="deletePost(post, value)"
                :key="value"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type="button"] {
  position: relative;
  font-family: Chango;
  font-size: 1.5rem;
  border-radius: 18px;
  cursor: pointer;
  padding: 10px;
  color: var(--color-nav-txt);
  border-style: none;
  box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
  background-color: var(--color-nav-bg);
  transition: all 0.3s ease-in-out;
}
input[type="button"]:hover {
  color: var(--color-nav-bg);
  background-color: var(--color-nav-txt);
}
input[type="button"]:active {
  box-shadow: -1px -1px 1px 0.5px rgba(0, 0, 0, 0.3);
}
.editposts-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
  font-family: Roboto Condensed;
  font-size: 1rem;
  .edit-posts-inner {
    position: relative;
    left: 0;
    right: 0;
    top: 70px;
    margin: auto;
    padding: 30px;
    width: 70%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .buttons {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: space-around;
      gap: 30px;
      .news-blog {
        display: flex;
        gap: 30px;
      }
      .newpost-wrapper {
        position: relative;
        input[type="button"]:hover {
          color: var(--color-nav-bg) !important;
          background-color: green;
        }
        .create-new-post {
          position: relative;
        }
      }
    }

    .posts-wrapper {
      position: relative;
      min-height: 100%;
      width: 70%;
      display: flex;
      flex-direction: column;
      padding: 30px;
      gap: 30px;

      .posts-card {
        position: relative;
        display: flex;
        width: 80%;
        height: 180px;
        background-color: var(--color-nav-bg);
        border-radius: 20px;
        justify-content: flex-start;
        box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, 0.3);
        color: var(--color-nav-txt);
        font-family: Roboto COndensed;
        font-weight: 600;
        padding: 30px;
        gap: 30px;

        .posts {
          position: relative;
          display: flex;
          gap: 30px;
          height: 100%;
          width: 100%;
          .cover-image {
            transition: opacity 0.5s linear;

            width: 100%;
            img {
              transition: opacity 0.5s linear;

              position: relative;
              width: 100%;
              height: 100%;
              border-radius: 10px;
            }
          }
          .blogposts-meta {
            width: 100%;
            transition: opacity 0.5s linear;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            flex-direction: column;

            .postTitle {
              transition: opacity 0.5s linear;

              font-size: 1.5rem;
            }
          }
        }
        .functions {
          transition: opacity 0.5s linear;
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          vertical-align: center;
          gap: 30px;

          .delete {
            transition: opacity 0.5s linear;

            background-color: red !important;
            color: var(--color-nav-bg) !important;
          }
          .delete:hover {
            transition: opacity 0.5s linear;

            background-color: rgb(122, 2, 2) !important;
            color: var(--color-nav-bg) !important;
          }
        }
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
