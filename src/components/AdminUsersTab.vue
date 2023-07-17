<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
} from "firebase/firestore";
import db from "../firebase/firebaseInit";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import moment from "moment";

const usersRef = collection(db, "users");
const usersArray = ref([]) as any;
const userCount = ref();

const isLoading = ref(true);
const createdAt = ref() as any;
const isActive = ref();
const item = ref([]) as any;
const lastRegistered = ref([]) as any;

const pseudoDiv = ref(false)

const lastRegisteredLoaded = ref(false);
console.log(lastRegistered.value);
onBeforeMount(async () => {
  (async () => {
    const colRef = firebase.firestore().collection("users");

    colRef
      .get()
      .then((querySnapshot) =>
        querySnapshot.forEach((post) => {
          const check = post.data();
          usersArray.value.push(check);

          lastRegistered.value = usersArray.value.reduce(function (
            prev,
            current
          ) {
            if (+current.createdAt > +prev.createdAt) {
              return current;
            } else {
              console.log(lastRegistered.value);
              return prev;
            }
          });
          lastRegisteredLoaded.value = true;
        })
      )
      .catch((err) => {
        console.log(err);
      });

    const users = (await getCountFromServer(usersRef)).data().count;
    return users;
  })().then((users) => {
    userCount.value = users;
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  });
});

function editUsers() {
  isActive.value = !isActive.value;
  pseudoDiv.value = !pseudoDiv.value
}
</script>

<template>
  <div class="users-wrapper" :class="{ active: isActive }">
    <div class="posts-tab-label">Users</div>
    <input type="button" class="button" value="Edit" @click="editUsers" />
    <div class="inner">
      <div class="text-count">
        <div class="text-count-inner">
          <transition name="skeleton">
            <div class="skeleton" v-if="isLoading"></div>
          </transition>
          <p>All users:</p>
          <p>{{ userCount }}</p>
        </div>
      </div>
      <div class="last-registered">
        <div class="text" v-if="lastRegisteredLoaded">
          <transition name="skeleton" v-if="isLoading">
            <div class="skeleton"></div>
          </transition>
          <label>Last Registered</label>
          <p>
            Full name: {{ lastRegistered.firstName }}
            {{ lastRegistered.lastName }}
          </p>
          <p>
            Registered on:
            {{
              moment(new Date(lastRegistered.createdAt.toDate())).format(
                "MMM DD, YYYY - HH:mm"
              )
            }}
          </p>
          <p>Email: {{ lastRegistered.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.users-wrapper.active {
  position: absolute;
  z-index: 10;
  width: 800px;
  height:600px;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}
.users-wrapper {
  top: 0;
  left:0;
  position: relative;
  width: 400px;
  height: 300px;
  background: var(--color-nav-bg);
  color: var(--color-nav-txt);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  font-family: Roboto Condensed;
  font-weight: 800;
  border-radius: 20px;
  box-shadow: 4px 4px 2px 1px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease-in-out;

  .posts-tab-label {
    position: relative;
    height: 30%;
    font-size: 2.4rem;
    padding: 20px;
    background-color: rgb(4, 123, 192);
    border-radius: 15px 15px 0 0;
    color: var(--color-nav-bg);
  }

  .button {
    position: absolute;
    right: 0;
    top: 0;
    margin: 20px;
    font-family: Chango;
    font-size: 1.4rem;
    font-weight: 400;
    right: 0;
    top: 0;
    border-radius: 18px;
    cursor: pointer;
    padding: 10px;
    color: var(--color-nav-txt);
    border-style: none;
    box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
    background-color: var(--color-nav-bg);
    transition: all 0.2s ease-in-out;
  }
  .button:hover {
    color: var(--color-nav-bg);
    background-color: var(--color-nav-txt);
  }
  .button:active {
    box-shadow: -1px -1px 1px 0.5px rgba(0, 0, 0, 0.3);
  }
  .inner {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-between;
    height: 100%;
    .text-count {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 10px;
      .text-count-inner {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        gap: 10px;
        padding: 5px 20px;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
      }
    }
    .last-registered {
      position: relative;
      padding: 10px;
      .text {
        position: relative;
        font-size: 1rem;
        display: flex;
        flex-direction: column;
        color: var(--color-nav-bg);
        background-color: rgb(4, 123, 192);
        border-radius: 10px;
        overflow: hidden;
        label {
          color: var(--color-nav-bg);
          padding: 3px;
          font-size: 1.3rem;
          background-color: #008ca5;
          padding-left: 10px;

        }
        p {
          padding: 5px;
          margin-left: 10px;
        }
      }
    }
    .skeleton {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      border-radius: 7px;
      background: linear-gradient(
          100deg,
          rgba(255, 255, 255, 0) 40%,
          rgba(255, 255, 255, 0.384) 50%,
          rgba(255, 255, 255, 0) 60%
        )
        #c7c7c7;
      background-size: 200% 100%;
      background-position-x: 180%;
      animation: 0.8s loading ease-in-out infinite;
    }

    @keyframes loading {
      to {
        background-position-x: -20%;
      }
    }
  }
}

.skeleton-enter-active,
.skeleton-leave-active {
  transition: all 0.4s ease-in-out;
  opacity: 1;
}

.skeleton-enter-from,
.skeleton-leave-to {
  opacity: 0;
}
</style>
