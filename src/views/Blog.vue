<script setup lang="ts">
import axios from "axios";
import { ref, watch, computed, toRaw, onUnmounted, onMounted } from "vue";
import moment from "moment";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";
import SonarLoading from "@/components/SonarLoading.vue";

const isLoading = ref(false);
const errorCaught = ref(false);
const colRef = firebase.firestore().collection("blogposts");
const blogPosts = ref([]) as any;

async function getPosts() {
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
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    });
}
onMounted(async () => {
  isLoading.value = true;
  getPosts();
});
</script>

<template>
  <transition name="fadeLoading">
    <SonarLoading v-if="isLoading" />
  </transition>
  <TransitionGroup name="fadeBlog">
    <div class="blog-container" key="1"  v-if="!isLoading">
      <div class="wrapper" key="2">
        <div
          class="blog-posts-ul"
         
          v-for="post in blogPosts"
          :key="post.postID"
        >
          <div class="posts-card">
            <a
              ><router-link
                :to="/blog/ + post.postID"
                key="post.id"
                class="posts-permalink"
              >
              </router-link
            ></a>
            <div class="posts-image">
              <img
                class="post.metadata.hero"
                :src="post.coverImage"
                :alt="post.postTitle"
              />
            </div>

            <div class="posts-text">
              <h1 class="posts-title">{{ post.postTitle }}</h1>
              <p class="posts-date">
                {{
                  moment(new Date(post.postDate.toDate())).format(
                    "MMM DD, HH:mm"
                  )
                }}
              </p>
              <p class="posts-excerpt">{{ post.postExcerpt }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
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
          position: relative;
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
            height: 100%;
            width: 100%;
            border-radius: 10px;
            box-shadow: rgba(0, 0, 0, 0.2) 5px 5px 10px 5px;
            overflow: hidden;

            img {
              width: 100%;
              object-fit: fill;
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
          font-size: 1rem;
          font-family: Roboto Condensed;
          .posts-title {
            font-size: 1.6rem;
            font-weight: 700;
          }
          .posts-date {
            font-style: italic;
          }
        }
      }
    }
  }
  .fadeBlog-enter-active,
  .fadeBlog-leave-active {
    transition: opacity 0.2s ease-in;
  }

  .fadeBlog-enter-from,
  .fadeBlog-leave-to {
    opacity: 0;
  }
  .fadeLoading-enter-active,
  .fadeLoading-leave-active {
    transition: opacity 0.3s ease-in;
  }

  .fadeLoading-enter-from,
  .fadeLoading-leave-to {
    opacity: 0;
  }
}
</style>
