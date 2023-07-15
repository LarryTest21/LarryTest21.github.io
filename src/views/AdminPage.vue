<script async setup lang="ts">
import { ref, onBeforeMount } from "vue";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getCountFromServer,
} from "firebase/firestore";
import Modal from "@/components/Modal.vue";

const blogRef = collection(db, "blogposts");
const newsRef = collection(db, "news");
const blogPostsCount = ref();
const newsPostsCount = ref();

const userCount = ref();

onBeforeMount(async () => {
  const snapshot = await getCountFromServer(blogRef);
  const snapshot2 = await getCountFromServer(newsRef);

  blogPostsCount.value = snapshot.data().count;
  newsPostsCount.value = snapshot2.data().count;
});
</script>

<template>
  <div class="admin-page-wrapper">
    <div class="admin-page">
      <div class="users-tab-wrapper">
        <div class="userCount">{{ userCount }}</div>
      </div>
      <div class="posts-wrapper">
        <div class="blog-posts">
          <p>Blog posts count</p>
          <Modal
            :backgroundOpacity="0"
            :modalAnimation="true"
            :loadingScale="0.7"
            class="spinner"
            v-if="!blogPostsCount"
          />
          <p>{{ blogPostsCount }}</p>
        </div>
        <div class="news-posts">
          <p>News posts count</p>
          <Modal
            :backgroundOpacity="0"
            :modalAnimation="true"
            :loadingScale="0.7"
            class="spinner"
            v-if="!blogPostsCount"
          />

          <p>{{ newsPostsCount }}</p>
        </div>
      </div>
      <div class="anayltics-wrapper"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page-wrapper {
  height: 100vh;
  width: 100%;
  .admin-page {
    position: relative;
    height: calc(100% - 70px);
    width: 100%;
    padding-top: 80px;

    .users-tab-wrapper {
      position: relative;
      width: 200px;
      height: 200px;
      .userCount {
        position: relative;
      }
    }
    .posts-wrapper {
      position: relative;
      .blog-posts {

      }
.news-posts{
    position: relative;

}
      .spinner {
        position: absolute;
        width: 20px;
        height: 20px;
      }
    }
    
  }
}
</style>
