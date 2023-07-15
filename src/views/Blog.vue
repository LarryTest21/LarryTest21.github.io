<script setup lang="ts">
import axios from "axios";
import {
  ref,
  toRef,
  watch,
  computed,
  toRaw,
  onUnmounted,
  onMounted,
} from "vue";
import moment from "moment";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";
import SonarLoading from "@/components/SonarLoading.vue";
import BlogSideBar from "@/components/BlogSideBar.vue";
import { QuerySnapshot } from "firebase/firestore";
import SearchBar from "@/components/SearchBar.vue";
import searchIcon from "@/components/icons/search.vue";

const isLoading = ref(true);
const errorCaught = ref(false);
const colRef = firebase.firestore().collection("blogposts");
const blogPosts = ref([]) as any;
const sidebar = ref();
const storedPosts = ref([]) as any;
const blogFade = ref("fadeBlog2");
const search = ref(false) as any;

const sonarLoading = ref(false);
const sonarBackground = ref(false);

async function getPosts() {
  sonarLoading.value = true;
  sonarBackground.value = false;
  isLoading.value = true;
  blogPosts.value = [];
  storedPosts.value = [];
  colRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        const check = post.data();
        storedPosts.value.push(check);
        blogPosts.value.push(check);
      })
    )
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      setTimeout(() => {
        isLoading.value = false;
      }, 100);
    });
}

const selected = (e) => {
  console.log(e);
  setTimeout(() => {
    if (e != null) {
      const propsToCheck = ["postCategory"];
      function filterByValue(array, string) {
        return array.filter((o) =>
          propsToCheck.some((k) =>
            String(o[k]).toLowerCase().includes(string.toLowerCase())
          )
        );
      }

      blogPosts.value = filterByValue(storedPosts.value, e);

      // blogPosts.value = storedPosts.value.filter(function (el) {
      //   return el.postCategory == e;

      // });
    } else {
      getPosts();
    }
  }, 10);
};
const isSearching = ref(false);

const inputFocused = (e) => {
  if (e != undefined) {
    if (e.value === true) {
      isLoading.value = true;
      setTimeout(() => {
        sonarLoading.value = false;
        sonarBackground.value = true;
      }, 400);
    } else if (e.value === false) {
      isLoading.value = false;
    }
  }
};

onMounted(async () => {
  getPosts();
});
</script>

<template>
  <TransitionGroup name="search">
    <SearchBar :storedPosts="storedPosts" v-if="search" class="searchbar" />
  </TransitionGroup>
  <div class="blog-container" key="1">
    <TransitionGroup name="fadeLoading">
      <div class="searchIcon-wrapper" key="1">
        <searchIcon class="searchIcon" @click="search = !search" key="2" />
      </div>
    </TransitionGroup>

    <transition name="fadeLoading">
      <SonarLoading
        v-show="isLoading"
        :loading="sonarLoading"
        :background="sonarBackground"
      />
    </transition>
    <div class="sidebar">
      <BlogSideBar
        @selected="selected"
        @search="inputFocused"
        class="sidebar"
        ref="sidebar"
      />
    </div>
    <div class="wrapper" key="1">
      <TransitionGroup name="fade">
        <div
          class="posts-card"
          v-if="!isLoading"
          v-for="post in blogPosts"
          :key="post.postID"
        >
          <div class="wrapper-posts">
            <router-link
              :to="/blog/ + post.postID"
              key="post.id"
              class="posts-permalink"
            >
            </router-link>

            <div class="posts-image">
              <div class="category-wrapper">
                <div class="category" v-for="category in post.postCategory">
                  {{ category }}
                  <router-link
                    :to="/category/ + category.toLowerCase()"
                    key="category"
                    class="category-permalink"
                  ></router-link>
                </div>
              </div>
              <img
                class="post.metadata.hero"
                :src="post.coverImage"
                :alt="post.postTitle"
              />
            </div>

            <div class="posts-text">
              <div class="text">
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
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .searchIcon-wrapper {
    position: absolute;
    margin-top: 90px;
    padding: 10px;
    width: 100%;
    z-index: 13;

    .searchIcon {
      left: 0;
      height: 50px;
      width: auto;
      fill: var(--color-nav-bg);
    }
  }
  .sidebar {
    top: 180px;
    z-index: 10;
  }
  .blog-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;

    .searchbar {
      position: absolute;
    }

    .wrapper {
      left: 0;
      margin: auto;
      margin-top: 70px;
      width: 80vw;
      padding: 30px;
      display: flex;
      flex-wrap: wrap;
      top: 70px;
      gap: 30px;

      .posts-card {
        height: 400px;
        width: 450px;

        .wrapper-posts {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .posts-image {
          position: relative;
          height: 100%;
          width: 100%;
          border-radius: 10px;
          box-shadow: rgba(0, 0, 0, 0.2) 5px 5px 10px 5px;
          overflow: hidden;
          .category-wrapper {
            position: absolute;
            display: flex;
            bottom: 0;
            right: 0;
            z-index: 5;
            padding: 10px;
            margin: 10px;
            gap: 20px;
            z-index: 11;

            .category {
              position: relative;
              height: 100%;
              border-radius: 10px;
              overflow: hidden;
              z-index: 20;
              padding: 7px;
              font-size: 1.5rem;
              font-weight: 800;
              box-shadow: rgba(2, 11, 26, 0.534) 3px 3px 3px 2px;
              transition: all 0.2s ease-in-out;
              background-color: var(--color-nav-txt);
              color: var(--color-nav-bg);

              a {
                position: absolute;
                bottom: 0;
                right: 0;
                height: 100%;
                width: 100%;
              }
            }
            .category:hover {
              background-color: var(--color-nav-bg);
              color: var(--color-nav-txt);
              cursor: pointer;
            }
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: fill;
          }
        }
      }

      .posts-permalink {
        position: absolute;
        height: 400px;
        width: 450px;
        z-index: 10;
      }
      .posts-permalink:hover ~ .posts-text {
        color: var(--color-nav-txt);
        background: var(--color-nav-bg);
      }
      .posts-text {
        width: 100%;
        height: 40%;
        display: flex;
        border-radius: 20px;
        padding: 10px;
        flex-direction: row;
        justify-content: space-between;
        word-wrap: break-word;
        transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
        backface-visibility: hidden;
        font-size: 1rem;
        font-family: Roboto Condensed;
        .text {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;

          .posts-title {
            font-size: 1.6rem;
            font-weight: 700;
          }

          .posts-date {
            position: relative;
            font-style: italic;
          }
          .posts-excerpt {
            font-size: 1.1rem;
          }
        }
      }
    }
  }

  .fade-move,
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. declare enter from and leave to state */
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateX(100vw);
  }
  .fade-leave-active {
    position: absolute;
  }
  
  .search-move,
  .search-enter-active,
  .search-leave-active {
    transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
  }

  /* 2. declare enter from and leave to state */
  .search-enter-from,
  .search-leave-to {
    opacity: 0;
  }
  .search-leave-active {
    position: absolute;
  }


  /* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */

  .fadeLoading-enter-active,
  .fadeLoading-leave-active {
    transition: opacity 0.3s ease-in;
  }
  .fadeLoading-leave-from,
  .fadeLoading-leave-to {
    opacity: 0;
  }
}
</style>
