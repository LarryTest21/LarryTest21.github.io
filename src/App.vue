<script setup lang="ts">
import { RouterView } from "vue-router";
import { ref, watch, onMounted } from "vue";
import PreLoader from "@/components/PreLoader.vue";
import { useLoaderState } from "@/store/isloading";
import { useTheme } from "@/store/theme";
import Nav from "@/components/Nav.vue";
import MobileNav from "@/components/MobileNav.vue";
import MobileNavIcon from "@/components/MobileNavIcon.vue";
import { useRoute } from "vue-router";
import "firebase/compat/auth";
import { mobileIconClicked } from "@/store/mobileIconClicked";
import { onMountApp } from "@/store/onMountApp";
import { isAdmin } from "@/store/isAdmin";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "@/firebase/firebaseInit";



const mobileNav = ref();
const mobileNavButton = ref(false);
const showNav = ref(false);
var windowWidth = document.documentElement.clientWidth;

const isAdminCheck = isAdmin();

firebase.auth().onAuthStateChanged((user) => {
  //Getting User clearent - admin or regular user

  if (user) {
    const { adminTrue } = isAdminCheck;
    const { adminFalse } = isAdminCheck;

    adminFalse();
    if (isAdminCheck.state === "regular") {
      const dataBase = db
        .collection("users")
        .doc(firebase.auth().currentUser?.uid);
      dataBase.get().then((doc) => {
        var userData = doc.data();

        if (userData!.clearance === "admin") {
          adminTrue();
        }
      });
    }
  }
});

const scrollIndicator = ref();
const mobileNavIconClicked = mobileIconClicked();

const navigation = ref(false);
const currentTheme = useTheme();

const route = useRoute();

const isLoading = useLoaderState();
const mountApp = onMountApp();
mountApp.state = false;

const onResize = () => {
  windowWidth = document.documentElement.clientWidth;

  if (windowWidth > 0 && windowWidth < 767) {
    mobileNav.value = "mobile";
    mobileNavButton.value = true;
  } else if (windowWidth > 768 && windowWidth < 1199) {
    mobileNav.value = "medium";
    mobileNavButton.value = true;
  } else if (windowWidth > 1200) {
    mobileNav.value = "full";
    mobileNavButton.value = false;
  }
};

window.addEventListener("resize", onResize);

const checkRoute = () => {
  navigation.value = true;
};

watch(
  () => route.name,
  () => {
    checkRoute();
    if (route.name === "post" || route.name === "newspost") {
      window.addEventListener("scroll", moveScrollIndicator);
    } else {
      window.removeEventListener("scroll", moveScrollIndicator);
    }
  }
);

function moveScrollIndicator(e) {
  const maxHeight = document.body.scrollHeight - window.innerHeight;
  const scrollIndicator = document.getElementById("scrollIndicator");
  const percentage = (window.scrollY / maxHeight) * 100;
  if (percentage > 0) {
    scrollIndicator!.style.opacity = "1";
    scrollIndicator!.style.width = percentage + "%";
  } else if (percentage == 0) {
    scrollIndicator!.style.opacity = "0";
  }
}

onMounted(() => {
  mountApp.state = true;
  setTimeout(() => {
    showNav.value = true;
  }, 100);
  onResize();
});
</script>

<script lang="ts"></script>

<template>
  <div id="app" v-if="mountApp" :class="[currentTheme.state, mobileNav]">
    <transition name="nav">
      <Nav
        :class="mobileNav"
        v-if="
          (showNav && mobileNav === 'medium') ||
          (showNav && mobileNav === 'full')
        "
      />
    </transition>
    <div ref="scrollIndicator" class="scrollLineTop" id="scrollIndicator"></div>

    <transition name="mobileNav">
      <MobileNav v-if="mobileNav === 'mobile' && mobileNavIconClicked.state" />
    </transition>
    <MobileNavIcon v-if="mobileNav === 'mobile'" />

    <transition name="fade">
      <PreLoader v-if="isLoading.state" :class="[currentTheme.state]" />
    </transition>
    <RouterView />
  </div>
</template>

<style lang="scss">
.scrollLineTop {
  opacity: 0;
  background: var(--color-nav-txt);
  height: 8px;
  left: 0;
  border-radius: 0px 4px 0 0;
  position: fixed;
  top: 63px;
  width: 0%;
  left: 70px;
  z-index: 105;
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: all 0.2s ease-in-out;
}

.fade-leave-to {
  opacity: 0;
}
.nav-enter-active,
.nav-leave-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.4s ease-in-out;
}

.nav-enter-from,
.nav-leave-to {
  opacity: 0;
  transform: translateY(-200px);
}

.mobileNav-enter-active {
  opacity: 1;
  transition: all 0.4s ease-in-out;
}

.mobileNav-enter-from {
  transform: translateX(-400px);
}
.mobileNav-leave-to {
  opacity: 0;
  transition: all 0.1s ease-in-out;
}

.error {
  position: absolute;
  opacity: 0.9;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-nav-bg);
  font-family: Chango;
  text-align: center;
  font-size: 2rem;
  color: red;
}
</style>
