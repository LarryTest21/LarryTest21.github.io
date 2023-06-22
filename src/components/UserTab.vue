<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getBlob, getStorage, ref as storageFBRef } from "firebase/storage";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { signedIn } from "../store/signedIn";
import router from "../router";
import { useRoute } from "vue-router";
import { userClicked } from "@/store/userClicked";
import Modal from "../components/Modal.vue";
import { modalButtonActive } from "../store/modalButtonActive";

const userPFPDownload = ref();
const userPFP = ref();
const route = useRoute();
const userEmail = ref();
const displayName = ref();

const modalActivation = ref(false);
const modalAnimation = ref(true);

userPFP.value = localStorage.getItem("avatar");

const checkPFP = () => {
  if (userPFP.value == null) {
    modalActivation.value = true;
    const userStorage = firebase.auth().currentUser?.uid;
    const storage = getStorage();

    const storageRef = storageFBRef(
      storage,
      "/" + userStorage + "/" + "avatar.png"
    );
    const convertBase64 = async () => {
      const blob = await getBlob(storageRef);
      var reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = function () {
        var base64data = reader.result;
        userPFPDownload.value = base64data;
        userPFP.value = base64data;
        localStorage.setItem("avatar", userPFPDownload.value);
        return;
      };
    };
    convertBase64().then(() => {
      setTimeout(() => {
        modalActivation.value = false;
      }, 700);
    });
  } else {
    userPFP.value = localStorage.getItem("avatar");
  }
};
checkPFP();

displayName.value = firebase.auth().currentUser?.displayName;
userEmail.value = firebase.auth().currentUser?.email;

const userClick = () => {
  const userClick = userClicked();
  const { changeUCFalse } = userClick;
  changeUCFalse();
  console.log(userClicked().state);
};
const logOut = () => {
  const signedInCheck = signedIn();
  const { signedInFalse } = signedInCheck;
  signedInFalse();
  firebase.auth().signOut();

  if (
    route.name === "profile" ||
    route.name === "editposts" ||
    route.name === "createpost"
  ) {
    console.log("pushed");
    router.push({ name: "landing" });
  }
};
</script>

<template>
  <div class="user-tab">
    <div class="usertab-top">
      
      <div class="userPFP">
        
        <transition name="modal">
          <Modal v-if="modalActivation" :modalAnimation="modalAnimation" :backgroundOpacity="1" />

        </transition>
        <img class="userPFP-img" v-bind:src="userPFP" />
      </div>
      <div class="user-text">
        <p class="displayName">{{ displayName }}</p>
        <p class="userEmail">{{ userEmail }}</p>
      </div>
    </div>
    <div class="usertab-links">
      <router-link @click.native.prevent="userClick" to="/profile"
        >Profile</router-link
      >
      <router-link @click.native.prevent="userClick" to="/createpost/newPost"
        >Create Post</router-link
      >
      <router-link @click.native.prevent="userClick" to="/editpostslist"
        >Edit Posts</router-link
      >
      <a @click.stop.prevent="logOut()">Logout</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-tab {
  z-index: -10;
  background-color: var(--color-nav-bg);
  position: fixed;
  top: 75px;
  left: 5%;
  width: 250px;
    border-radius: 5px;
  font-size: 1.5rem;
  font-family: Chango;
  color: var(--color-nav-txt) !important;
  display: flex;
  flex-direction: column;
  position: absolute;
  justify-content: center;
  align-items: flex-start;
  gap: 5px;
  box-shadow: 4px 4px 10px 10px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  .usertab-top {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.4rem;
    .userPFP {
      position: relative;
      height: 70px;
      width: 70px;
      overflow: hidden;
      .userPFP-img {
        height: 70px;
      }
    }
    .user-text {
      width: 100%;
      margin-left: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      .displayName {
        text-align: center;
      }
      .userEmail {
        width: 130%;
        background-color: var(--color-nav-txt);
        color: var(--color-nav-bg);
        padding: 0.2rem 0.2rem;
        border-radius: 10px;
        font-size: 0.8rem;
      }
    }
  }
  .usertab-links {
    display: flex;
    flex-direction: column;
    width: 100%;
    a {
      width: 100%;
      text-align: left;
      text-decoration: none;
      font-size: 1.3rem;
      text-transform: uppercase;
      font-family: Chango;
      padding: 0 1rem;
      transition: font 0.1s, background-color 0.3s, box-shadow 0.1s;
      padding: 10px ;
      height: 100%;
      color: var(--color-nav-txt)
    }
    a:hover {
      background-color: var(--color-nav-txt);
      color: var(--vt-c-nav-text-hover);
      cursor: pointer;
    }
    a::after {
      box-shadow: none;
    }


  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
  opacity: 1;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
