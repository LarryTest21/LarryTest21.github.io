<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUpdated } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "jquery";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const route = useRoute();
const post = ref<any>({});
const isLoading = ref(false);
const latestPosts = ref<any>({});
const blogPost = ref([]) as any;

const postSlug = ref(route.params.blogSlug) as any;
console.log(postSlug.value);
const colRef = firebase.firestore().collection("blogposts");
const blogPosts = ref([]) as any;

const postTitle = ref();
const postAuthor = ref();
const postDate = ref();
const postContent = ref();
const coverImage = ref();

const newArray = ref([]);

async function fetchData() {
  isLoading.value = true;
  colRef

    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        const check = post.data();
        console.log(check);
        blogPosts.value.push(check);
        console.log(blogPosts.value);
      })
    )
    .then(() => {
      newArray.value = blogPosts.value.filter(
        (item) => item.postID === postSlug.value
      );

      console.log(newArray.value);
      blogPost.value = newArray.value;
      console.log(blogPost.value);
      console.log(blogPost.value[0].postAuthor);

      postTitle.value = blogPost.value[0].postTitle;
      postAuthor.value = blogPost.value[0].postAuthor;
      postDate.value = moment(
        new Date(blogPost.value[0].postDate.toDate())
      ).format("MMM, DD\xa0\xa0\xa0HH:mm");
      postContent.value = blogPost.value[0].postContent;
      coverImage.value = blogPost.value[0].coverImage;
    })
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      isLoading.value = false;
    });
}
fetchData();

async function fetchDataSideBar() {}

watch(
  () => route.params.blogSlug,
  () => {
    route.params.blogSlug = route.params.blogSlug;
    /*  getPost(); */
    fetchData();
  }
);
</script>

<template>
  <div v-if="!isLoading" class="posts-wrapper">
    <div class="blogpost-wrapper">
      <div class="post-title">
        {{ postTitle }}
        <div class="cover-image">
          <img :src="coverImage" alt="" />
        </div>
      </div>
      <div class="post-date">{{ postDate }}</div>
      <div class="post-author">{{ postAuthor }}</div>

      <div class="post-content" v-html="postContent"></div>
    </div>
  </div>
  <div class="side-container">
    <div class="side-wrapper">
      <ul v-if="!isLoading" class="blog-posts-ul" v-for="latest in blogPosts">
        <div class="posts-card">
          <a
            ><router-link
              :to="/blog/ + latest.postID"
              key="latest.id"
              class="posts-permalink"
            >
            </router-link
          ></a>
          <img class="posts-featuredimage" :src="latest.coverImage" />
          <div class="posts-text">
            <div class="posts-title">{{ latest.postTitle }}</div>
            <div class="posts-date">
              <p>{{ moment(latest.postDate).fromNow() + " " + "ago" }}</p>
            </div>
            <div class="posts-author">
              {{ latest.postAuthor }}
            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.posts-wrapper {
  position: relative;
  height: calc(100% - 70px);
  padding-top: 70px;
  width: 100%;
  padding-left: 40px;

  .blogpost-wrapper {
    right: 0;
    left: 0;
    margin: auto;
    margin-top: 30px;
    width: 60%;
    .post-title {
      font-family: Roboto Condensed;
      display: flex;
      width: 100%;
      justify-content: space-between;
      font-size: 5rem;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0;
    }

    .post-date {
      font-family: Nunito;
      font-weight: 900;
      font-size: 1.2rem;
      margin-top: 10px;
    }
    .post-author {
      font-family: Nunito;
      font-weight: 900;
      font-size: 1rem;
    }
    .post-content {
      display: flex;
      font-family: Roboto;
      font-weight: 900;
      font-size: 1.3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 30px;

      :deep(p:has(img)) {
        margin: 10px 0;
        align-self: center;
        width: 300px;
      }
      :deep(p:has(+ img)) {
        background-color: red;
      }
      :deep(img) {
        position: relative;
        transition: scale 0.2s ease-in-out;
        z-index: 3;
        transform-origin: 2rem;
      }

      :deep(img):hover {
        position: relative;
        transform-origin: 2rem;
        scale: 1.1;
      }

      :deep(figcaption) {
        margin: 10px 0 30px 0;
      }
      :deep(img) {
        background-color: red;
        border-radius: 20px;
        box-shadow: 10px 10px 10px 2px rgba(black, 0.4);
      }

      :deep(blockquote) {
        background: rgba(0, 0, 0, 0.1);
        background-size: 400% 400%;
        border-radius: 20px;
        transition: all 0.3s ease-in-out;
        will-change: scale;
        margin: 30px 0;
      }
      :deep(blockquote):hover {
        scale: 105%;
      }
      :deep(blockquote > p) {
        quotes: string;
        font-size: 2.5rem;
        font-style: italic;
        font-weight: 700;
        padding: 10px;
      }
      :deep(blockquote > p)::before {
        content: open-quote;
      }
      :deep(blockquote > p)::after {
        content: close-quote;
      }
      :deep(p:has(> .fr-img-caption)) {
        width: 50%;
        .fr-img-caption {
          width: 100%;
          span {
            width: 100%, img {
              height: 100%;
              margin: 30px 0;
            }
          }
        }
      }
    }
  }
}

.side-container {
  position: absolute;
  height: 100%;
  top: 0;
  right: 0;
  .side-wrapper::before {
    position: absolute;
    content: "";
    height: 100%;
    left: 20px;
    width: 10px;
    background-color: var(--color-text);
    border-radius: 20px;
  }
  .side-wrapper {
    position: sticky;
    .blog-posts-ul {
      display: flex;

      .posts-card {
        height: 100px;
        width: 280px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin: 15px 0;

        a {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        img {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 10px;
        }
        .posts-text {
          line-height: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;

          .posts-title {
            font-size: 1rem;
            font-weight: 600;
          }
          .posts-date {
            font-size: 0.8rem;
          }
          .posts-author {
            font-size: 0.7rem;
          }
        }
      }
    }
  }
}
</style>
