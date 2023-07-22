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
import AdminCounts from "@/components/AdminPostsCount.vue";
import AdminUsersTab from "@/components/AdminUsersTab.vue";
import { initializeApp } from "firebase/app";
import GoogleA from "@/assets/subtest-gakey.json"


const isActive = ref(false);
const keepP = ref(false);


const editPressed = (value) => {
  isActive.value = value;
  console.log(isActive.value);

  if (isActive.value) {
  } else {
    keepP.value = true;

    setTimeout(() => {
      keepP.value = false;
    }, 500);
  }
};




</script>

<template>
  <div class="admin-page-wrapper">
    <div class="admin-page">
      <div class="pseudo-div" :class="{ anim: isActive, keepP: keepP }"></div>
      <AdminUsersTab
        @editPressed="editPressed"
        class="admincard userstab"
        :class="{ anim: isActive, keepP: keepP }"
      />
      <AdminCounts class="admincard" />
      <div class="admincard anayltics-wrapper"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-page-wrapper {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 30px;
  .admin-page {
    position: relative;
    width: 100%;
    top: 70px;
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
  }
  .pseudo-div {
    position: absolute;
    width: 450px;
    height: 300px;
    transition: all 0.3s ease-in-out;
  }
  .pseudo-div.anim {
    position: relative;
    width: 0px;
  }
  .pseudo-div.keepP {
    width: 450px;
    position: relative;
  }
  .admincard {
    position: relative;
    width: 450px;
    height: 300px;
    box-shadow: 4px 4px 2px 1px rgba(0, 0, 0, 0.3);
    border-radius: 20px;
  }
  .userstab {
    position: relative;
    transition: all 0.3s ease-in-out;
    transform: translate(0, 0);
  }

  .userstab.keepP {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;

  }
  .userstab.anim {
    position: absolute;
    width: 80%;
    height: 600px;
    z-index: 10;
  }
}
</style>
