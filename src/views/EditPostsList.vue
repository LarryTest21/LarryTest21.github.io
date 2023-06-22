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

// const isLoading = useLoaderState();

const blogPostsRefreshArray = ref([]) as any;
const differencePosts = ref();
const Logo = new URL("../assets/logos/logo.svg", import.meta.url).href;

const showBlogPostsRefresh = ref(false);
const blogPosts = ref([]) as any;

const colRef = firebase.firestore().collection("blogposts");
const intervalID = ref() as any;
const blogPostsRefreshed = ref(false);
const transitionList = ref() as any;

const deletePost = async (postID, post) => {
  blogPosts.value.splice(post, 1);

  await deleteDoc(doc(db, "blogposts", postID.postID.toString()));
  console.log(postID.postID);
};

const refreshPostRequest = () => {
  transitionList.value = "fadePosts";
  console.log("posts refreshing");

  colRef
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
const initialPostRequest = () => {
  clearInterval(intervalID.value);
  blogPostsRefreshed.value = true;
  colRef

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
      intervalID.value = setInterval(refreshPostRequest, 2000);
    });
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    initialPostRequest();
  }
});
const options = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
} as Object;

onMounted(() => {});

onUnmounted(() => {
  clearInterval(intervalID.value);
});
const buttonClear = () => {
  clearInterval(intervalID.value);
};
</script>

<template>
  <div class="editposts-wrapper">
    <div class="edit-posts-inner">
      <input type="button" @click="buttonClear" value="hello" />
      <div class="newpost-wrapper">
        <input
          class="create-new-post"
          type="button"
          @click="$router.push('/createpost/newPost')"
          value="+ Create Post"
        />
      </div>
      <ul class="posts-wrapper">
        <TransitionGroup :name="transitionList">
          <ul
            class="blog-posts-ul-original"
            v-for="(post, value, index) in blogPosts"
            :key="index"
            v-if="blogPostsRefreshed"
          >
            <div class="posts">
              <div class="cover-image">
                <img :src="post.coverImage || Logo" alt="" />
              </div>
              <div class="blogposts-meta">
                <p class="postTitle">{{ post.postTitle }}</p>
                <p class="postUploadTime">
                  Post Uploaded First:
                 {{ moment(new Date(+post.postID)).format("MM/DD, YYYY, HH:mm:ss")  }}
                </p>

                <p class="postLastUpload">
                  Post Last Updated
                  {{
                    moment(new Date(post.lastUpload.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postUploadTime">
                  Post Release Date:
                  {{
                    moment(new Date(post.postDate.toDate())).format(
                      "MM/DD, YYYY, HH:mm:ss"
                    )
                  }}
                </p>
                <p class="postAuthor">{{ post.postAuthor }}</p>
                <!-- <p class="postDate">
                {{
                  post.postDate.toDate().toLocaleTimeString("en-us", options) || undefined
                }}
              </p> -->
              </div>
            </div>
            <div class="functions">
              <input
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
              />
            </div>
          </ul>
        </TransitionGroup>

        <TransitionGroup :name="transitionList">
          <ul
            v-if="showBlogPostsRefresh"
            class="blog-posts-ul"
            v-for="post in blogPostsRefreshArray"
            :key="post"
          >
            <div class="posts">
              <div class="cover-image">
                <img :src="post.coverImage || Logo" alt="" />
              </div>
              <div class="blogposts-meta">
                <p class="postTitle">{{ post.postTitle }}</p>
                <p class="postUploadTime">
                  Post Uploaded:
                  {{ new Date(post.uploadTime).toLocaleTimeString("en-US") }}
                </p>
                <p class="postAuthor">{{ post.postAuthor }}</p>
                <!-- <p class="postDate">
                {{
                  post.postDate.toDate().toLocaleTimeString("en-us", options) || undefined
                }}
              </p> -->
              </div>
            </div>
            <div class="functions">
              <input class="edit" type="button" name="edit" value="Edit" />
              <input
                class="delete"
                type="button"
                name="delete"
                value="Delete"
              />
            </div>
          </ul>
        </TransitionGroup>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input[type="button"] {
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
  padding-top: 70px;
  .edit-posts-inner {
    position: relative;
    height: calc(100% - 70px);
    left: 0;
    right: 0;
    margin: auto;
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
    gap: 15px;
    .newpost-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      input[type="button"]:hover {
        color: var(--color-nav-bg) !important;
        background-color: green;
      }
      .create-new-post {
        position: relative;
      }
    }
    .posts-wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      list-style: none;
      display: flex;
      flex-direction: column-reverse;
      justify-content: center;
      align-items: center;
      gap: 10px;

      .blog-posts-new {
        display: flex;
        padding: 20px;
        width: 100%;
        height: 100%;
        background-color: var(--color-nav-bg);
        border-radius: 20px;
        justify-content: flex-start;
        box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, 0.3);
        color: var(--color-nav-txt);
        font-family: Roboto COndensed;
        font-weight: 600;
      }
      .blog-posts-ul-original,
      .blog-posts-ul {
        display: flex;
        padding: 20px;
        width: 100%;
        height: 100%;
        background-color: var(--color-nav-bg);
        border-radius: 20px;
        justify-content: flex-start;
        box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, 0.3);
        color: var(--color-nav-txt);
        font-family: Roboto COndensed;
        font-weight: 600;

        .posts {
          position: relative;
          display: flex;
          gap: 30px;
          height: 100%;
          width: 100%;
          .cover-image {
            img {
              position: relative;
              width: 77px;
              height: 100%;
              border-radius: 10px;
            }
          }
          .blogposts-meta {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            width: 300px;
            flex-direction: column;

            .postTitle {
              font-size: 1.5rem;
            }
          }
        }
        .functions {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          vertical-align: center;
          gap: 30px;

          .delete {
            background-color: red !important;
            color: var(--color-nav-bg) !important;
          }
          .delete:hover {
            background-color: rgb(122, 2, 2) !important;
            color: var(--color-nav-bg) !important;
          }
        }
      }
    }
  }
}

.fadePosts-enter-active,
.fadePosts-leave-active {
  transition: transform 0.3s ease-in-out;
  transform: translateY(0px);
}
.fadePosts-enter-from,
.fadePosts-leave-to {
  transform: translateY(-300px);
}
</style>
