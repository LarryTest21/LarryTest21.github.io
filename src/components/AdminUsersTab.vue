<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import {
  collection,
  getCountFromServer,
  doc,
  getDoc,
  query,
} from "firebase/firestore";
import db from "../firebase/firebaseInit";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import moment from "moment";
import Users from "@/components/icons/users-multiple.vue";
import $ from "jquery";

const usersRef = collection(db, "users");
const usersArray = ref([]) as any;
const userCount = ref();

const isLoadingCount = ref(true);
const createdAt = ref() as any;
const isActive = ref();
const item = ref([]) as any;
const lastRegistered = ref([]) as any;

const usersArray2 = ref([]) as any;

const colRef = firebase.firestore().collection("users");

const isAnim = ref();
const isPseudo = ref();

const usersWrap = ref();

const pseudoDiv = ref(false);

const emit = defineEmits(["editPressed"]);

const lastRegisteredLoaded = ref(false);

const getUsers = () => {
  colRef.get().then((querySnapshot) => {
    querySnapshot.forEach((user) => {
      var check = user.data();
      usersArray2.value.push(check);
      console.log(usersArray2.value);
    });
  });
};
getUsers();
onBeforeMount(async () => {
  (async () => {
    lastRegisteredLoaded.value = false;
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
          setTimeout(() => {
            lastRegisteredLoaded.value = true;
          }, 1000);
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
      isLoadingCount.value = false;
    }, 1000);
  });
});

function editUsers() {
  isActive.value = !isActive.value;
  // pseudoDiv.value = !pseudoDiv.value;
  // isPseudo.value = true;

  // if (!pseudoDiv.value) {
  //   isPseudo.value = false;
  //   isAnim.value = true;
  //   setTimeout(() => {
  //     isAnim.value = false;
  //   }, 300);
  // } else {
  // }

  emit("editPressed", isActive.value);
}
</script>

<template>
  <div class="adminusers-container">
    <div class="pseudo-div"></div>
    <div class="users-wrapper" ref="usersWrap">
      <div class="label">
        <Users class="usersIcon" />
        <input type="button" class="button" value="Edit" @click="editUsers" />
      </div>

      <div class="inner">
        <div class="text-count" v-if="!isActive">
          <div class="text-count-inner">
            <transition name="skeleton">
              <div class="skeleton" v-if="isLoadingCount"></div>
            </transition>
            <p>All users:</p>
            <p>{{ userCount }}</p>
          </div>
        </div>
        <TransitionGroup name="user-list">
          <div class="user-list-wrapper" v-if="isActive">
            <ul class="user-list-top">
              <li>Full Name</li>
              <li>Rights</li>
              <li>Email</li>
              <li>Registered</li>
              <li>Profile Picture</li>
            </ul>
            <div class="user-list" v-for="users in usersArray2">
              <div class="user-list-container">
                <div class="name">
                  {{ users.firstName }} {{ users.lastName }}
                </div>
                <div class="rights" v-if="users.clearance === 'admin'">
                  <div class="admin">{{ users.clearance }}</div>
                </div>
                <div class="rights" v-if="users.clearance === 'regular'">
                  <div class="regular">{{ users.clearance }}</div>
                </div>

                <div class="email">{{ users.email }}</div>
                <div
                  class="registered-date"
                  v-if="users.createdAt !== undefined"
                >
                  {{
                    moment(new Date(users.createdAt.toDate())).format(
                      "MMM DD, YYYY - HH:mm"
                    )
                  }}
                </div>
                <div class="placeholder" v-else>Unknown</div>
                <div class="img-wrapper">
                  <img v-bind:src="users.profilePic" />
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
        <div class="last-registered-wrapper" key="1">
          <div class="last-registered">
            <transition name="skeleton" v-if="!lastRegisteredLoaded">
              <div class="skeleton"></div>
            </transition>
            <TransitionGroup name="user-list">
              <div class="text" v-show="lastRegisteredLoaded" key="2">
                <label>Last Registered</label>
                <p>
                  Full name: {{ lastRegistered.firstName }}
                  {{ lastRegistered.lastName }}
                </p>
                <p v-if="lastRegistered.createdAt !== undefined">
                  Registered on:
                  {{
                    moment(new Date(lastRegistered.createdAt.toDate())).format(
                      "MMM DD, YYYY - HH:mm"
                    )
                  }}
                </p>
                <p>Email: {{ lastRegistered.email }}</p>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.adminusers-container {
  position: relative;
}

.pseudo-div {
  position: absolute;
  width: 450px;
  height: 300px;
  transition: all 0.3s ease-in-out;
}

.users-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  flex-direction: column;
  background: var(--color-nav-bg);
  color: var(--color-nav-txt);
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  font-family: Roboto Condensed;
  font-weight: 800;
  border-radius: 20px;
  overflow: hidden;
  .label {
    position: relative;
    height: 100px;
    padding: 20px;
    color: var(--color-nav-bg);
    background-color: rgb(4, 123, 192);
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: center;

    .usersIcon {
      height: 100%;
      fill: white;
    }
    .button {
      position: relative;
      right: 0;
      top: 0;
      height: 100%;
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
  }

  .inner {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: space-between;
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
        justify-content: center;
        align-items: center;
        font-size: 2rem;
      }
    }

    .user-list-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      font-size: 1.4rem;
      .user-list-top {
        text-decoration: none;
        list-style-type: none;
        display: flex;
        gap: 50px;
        padding-left: 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        grid-template-rows: 1fr;
        gap: 0px 0px;
        font-size: 2rem;
      }
      .user-list {
        position: relative;
        width: 100%;
        height: 80px;
        padding: 10px;
        display: flex;
        align-items: center;
        background-color: var(--color-nav-txt);
        border-radius: 5px;
        color: var(--color-nav-bg);
        .user-list-container {
          position: relative;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          grid-template-rows: 1fr;
          div {
            display: flex;
            align-items: center;
          }
          .rights {
            width: 100px;

            div {
              padding: 10px;
            }
            .admin {
              background-color: rgb(143, 140, 0);
              border-radius: 6px;
            }
            .regular {
              background-color: rgb(0, 143, 43);
              border-radius: 6px;
            }
          }

          .img-wrapper {
            position: relative;
            height: 100%;
            width: 100%;
            img {
              margin-left: 30px;
              height: 60px;
              display: flex;
              justify-content: center;
            }
          }
        }
      }
    }
    .last-registered-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 10px;
    }
    .last-registered {
      position: relative;
      height: 100%;
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

.user-list-enter-active,
.user-list-leave-active {
  transition: all 0.3s ease-in-out;
  opacity: 1;
  height: 100%;
}

.user-list-enter-from,
.user-list-leave-to {
  opacity: 0;
  height: 0;
  transform: translateX(-200px);
}
</style>
