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

import { getAnalytics, logEvent } from "firebase/analytics";



const analytics = getAnalytics();
console.log(analytics);

logEvent(analytics, "notification_received");

</script>

<template>
  <div class="admin-page-wrapper">
    <div class="admin-page">
      <AdminUsersTab class="admincard" />
      <AdminCounts class="admincard" />
      <div class="admincard anayltics-wrapper"></div>
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
    top: 70px;
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    padding: 30px;
  }
}
</style>
