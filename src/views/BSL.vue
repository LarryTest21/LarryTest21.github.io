<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import { onMounted } from "vue";
import moment from "moment";
import Cosmic from "cosmicjs";

/* const postsUrl = "http://localhost/wordpress/wp-json/wp/v2/posts";*/
const api = Cosmic();
const posts = ref([] as any);

const isLoading = ref(false);
const errorCaught = ref(false);

const bucket = api.bucket({
  slug: "c27229f0-9018-11ed-b853-65fa50acc7e7",
  read_key: "VLZQGABHjrhQj4iMYuvEXEfPRHZPnWt5CACFaIJB68PeteSwVX",
});

async function fetchData() {
  isLoading.value = true;

  const data = await bucket.objects
    .find({
      type: "posts",
    })
    .props("slug,title,content,metadata")
    .limit(9);

  posts.value = data.objects;
}

async function finishedFetch() {
  await fetchData().then(() => {
    isLoading.value = false;
  });
}
/* 
var queryOptions = {
  _embed: true,
};

const getPosts = () => {
  isLoading.value = true;

  axios
    .get(postsUrl, { params: queryOptions })
    .then((response) => {
      posts.value = response.data;
      console.log(posts.value);
      isLoading.value = false;
    })
    .then(() => {
      console.log(isLoading.value);
    })
    .catch((error) => {
      if (error) {
        isLoading.value = false;
        errorCaught.value = true;
      }
    });
}; */

onMounted(async () => {
  /* getPosts(); */
  fetchData();
  finishedFetch();
});
</script>

<template>
  <transition name="fadeLoading">
    <div v-if="isLoading" class="posts-loading">
      <div class="circle"></div>
    </div>
  </transition>
  <transition name="fadeLoading">
    <div class="errorCaught" v-if="errorCaught">
      There was an error loading news
    </div>
  </transition>
  <div class="blog-container">
    <div class="wrapper">
      <transition-group name="fadeBlog">
        <ul
          v-if="!isLoading"
          class="blog-posts-ul"
          v-for="post in posts"
          :key="post.slug"
          :class="[post.metadata.featured ? 'featured' : '']"
        >
          <div class="posts-card">
            <a
              ><router-link
                :to="/blog/ + post.slug"
                key="post.id"
                class="posts-permalink"
              >
              </router-link
            ></a>
            <div class="posts-image">
              <img
                v-if="post.metadata.image != null"
                class="post.metadata.hero"
                :src="post.metadata.image.imgix_url"
                :alt="post.title"
              />
              <img v-else src="@/assets/logos/favicon-big.png" />
            </div>

            <div class="posts-text">
              <h1 class="posts-title">{{ post.title }}</h1>

              <p v-html="post.metadata.description" class="posts-excerpt"></p>
            </div>
          </div>
        </ul>
      </transition-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .posts-loading {
    top: 70px;
    width: 100%;
    height: calc(100vh - 70px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .circle {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      display: inline-block;
      border-top: 10px solid var(--color-nav-bg);
      border-right: 10px solid transparent;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
    .circle::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      left: 0;
      top: 0;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      border-left: 10px solid var(--color-nav-bg);
      border-bottom: 10px solid transparent;
      animation: rotation 0.5s linear infinite reverse;
    }
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  .errorCaught {
    position: absolute;
    width: 30%;
    height: 100px;
    top: calc(50% + 35px);
    right: 50%;
    transform: translate(50%, -50%);
    background-color: rgb(146, 14, 14);
    border-width: 10px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    font-size: 2rem;
    font-weight: 900;
    animation: blink 2s infinite;
  }
  @keyframes blink {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  .blog-container {
    position: relative;
    min-height: 100vh;
    padding-top: 70px;
    width: 100vw;

    .wrapper {
      left: 0;
      margin: auto;
      padding-top: 50px;
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr;
      width: 70vw;
      gap: 10px 0;

      span {
        margin: auto;
        background-color: var(--color-nav-bg);
        color: var(--color-nav-txt);
        border-radius: 30px;
        font-family: Chango;
        font-size: 4rem;
        font-weight: 400;
        text-align: center;
        margin-bottom: 50px;
      }

      .blog-posts-ul.featured {
        position: relative;
        display: flex;
      }
      .blog-posts-ul {
        padding-inline-start: 0;
        padding: 0 0;
        .posts-card {
          width: 400px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          a:hover ~ .posts-text {
            background: var(--color-nav-bg);
            color: var(--color-nav-txt);
          }
          .posts-image {
            display: inherit;
            width: 100%;
            height: 300px;
            img {
              max-width: 100%;
              object-fit: cover;
              border-radius: 10px;
              box-shadow: rgba(0, 0, 0, 0.2) 5px 5px 10px 5px;
            }

            .posts-date {
              position: absolute;
              display: inline-block;
              margin: 10px 10px;
              left: 0;
              transition: transform 0.08s ease-in-out;
              p {
                color: var(--color-nav-txt);
                background-color: var(--color-nav-bg);
                padding: 0 10px;
                border-radius: 20px;
                display: flex;
                font-size: 1.2rem;
                font-weight: 600;
                font-style: italic;
              }
            }
          }
          a {
            position: absolute;
            height: 100%;
            width: 100%;
            border-radius: 20px;
            z-index: 10;
          }
          /*       a:hover + .posts-image .posts-date {
            transform: translate(100px);
          } */

          .posts-text {
            max-width: 100%;
            display: flex;
            border-radius: 20px;
            padding: 10px;
            flex-direction: column;
            word-wrap: break-word;
            transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
            backface-visibility: hidden;

            .posts-title {
              font-size: 1.1rem;
              font-weight: 700;
            }
            .posts-excerpt {
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
  .fadeBlog-enter-active,
  .fadeBlog-leave-active {
    transition: opacity 0.8s ease-in;
  }

  .fadeBlog-enter-from,
  .fadeBlog-leave-to {
    opacity: 0;
  }
  .fadeLoading-leave-active {
    transition: opacity 0.5s ease-in-out;
  }

  .fadeLoading-enter-from,
  .fadeLoading-leave-to {
    opacity: 0;
  }
}
</style>
