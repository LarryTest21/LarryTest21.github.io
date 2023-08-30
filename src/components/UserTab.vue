<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getBlob, getStorage, ref as storageFBRef, getDownloadURL } from "firebase/storage";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { signedIn } from "../store/signedIn";
import router from "../router";
import { useRoute } from "vue-router";
import { userTabClick } from "@/store/userTabClick";
import Modal from "../components/Modal.vue";
import { modalButtonActive } from "../store/modalButtonActive";
import NoPFP from "@/components/icons/nopfp.vue"
import { base64NoPFP } from "@/components/icons/nopfpbase64"
import EditProfilePicture from "@/components/EditProfilePicture.vue"
import bellIcon from "@/components/icons/bell.vue"

const userPFPDownload = ref();
const userPFP = ref();
const noPFP = ref(false)
const route = useRoute();
const userEmail = ref();
const displayName = ref();
const signedInCheck = signedIn();

const notifClicked = ref(false)

const props = defineProps({
  isAdminCheck: String,
  notifCounter: Number,
  notificationArray: Array,
  isActivated: Boolean
})

const modalActivation = ref(false);
const modalAnimation = ref(true);

const notifArray = props.notificationArray as any
const notActivated = ref(false)

if (!notifArray.activated) {

  notActivated.value = true
}

userPFP.value = localStorage.getItem("avatar");
if (userPFP.value = base64NoPFP) {
  noPFP.value = true
}




const checkPFP = () => {
  if (userPFP.value === null) {
    modalActivation.value = true;
    const userStorage = firebase.auth().currentUser?.uid;
    const storage = getStorage();

    const storageRef = storageFBRef(
      storage,
      "/" + userStorage + "/" + "avatar.png"
    )

    getDownloadURL(storageRef)
      .then((url) => {

        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        const img = document.getElementById('myimg');
      })
      .catch((error) => {
        console.log(error.code);
        if (error.code === 'storage/object-not-found') {
          userPFP.value = base64NoPFP
          localStorage.setItem("avatar", userPFP.value);
          noPFP.value = true
          console.log(userPFP.value)
          modalActivation.value = false;
        }
        else {
          const convertBase64 = async () => {
            const blob = await getBlob(storageRef);
            noPFP.value = false

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
        }
      });

  } else {
    userPFP.value = localStorage.getItem("avatar");
    noPFP.value = false
  }
};
checkPFP();

var userStore = firebase.firestore().collection("users").doc(firebase.auth().currentUser!.uid);
userStore.get().then((user) => {

  var userPic = user.data()!
  console.log(userPic.displayName);
  displayName.value = userPic.displayName;
  userEmail.value = userPic.email;

})

const userClick = () => {
  const userClick = userTabClick();
  userClick.state = false
};
const logOut = () => {
  signedInCheck.state = false
  firebase.auth().signOut();
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userClearance");

  if (
    route.name === "profile" ||
    route.name === "editposts" ||
    route.name === "createpost" ||
    route.name === "adminpage"
  ) {
    router.push({ name: "landing" });
  }



};
watch(() => props.isActivated, (newValue) => {
  console.log(props.isActivated);
})
</script>

<template>
  <div class="user-tab-wrapper">
    <div class="user-tab">

      <div class="usertab-info">
        <div class="usertab-top">
          <div class="userPFP">

            <transition name="modal">
              <Modal v-if="modalActivation" spinnerColor='var(--color-nav-txt)' :modalAnimation="modalAnimation"
                :backgroundOpacity="1" />

            </transition>
            <div class="img-wr">
              <img class="userPFP-img" v-bind:src="userPFP" :class="noPFP ? 'nopfp' : ''" />

              <div class="no-pfp" v-if="noPFP">no profile picture</div>
            </div>
            <div class="notif-wr" v-if="notifCounter != 0" @click="notifClicked = !notifClicked">
              <div class="notif-counter">
                {{ props.notifCounter }}
              </div>
              <div class="notif-counter-icon-wrapper">

                <bellIcon />
              </div>
            </div>
          </div>
          <div class="user-text">
            <p class="displayName">{{ displayName }}</p>
            <p class="userEmail">{{ userEmail }}</p>
          </div>
        </div>
        <div class="usertab-links">
          <router-link @click.native.prevent="userClick" to="/createpost/newPost">Create Post</router-link>
          <router-link @click.native.prevent="userClick" to="/profile">Profile</router-link>
          <router-link @click.native.prevent="userClick" to="/editpostslist" v-if="props.isAdminCheck === 'regular'">Edit
            Posts</router-link>
          <router-link @click.native.prevent="userClick" to="/adminpage" v-if="props.isAdminCheck === 'admin'">Admin
            Page</router-link>
          <a @click.stop.prevent="logOut()">Logout</a>
        </div>
      </div>
      <transition name="notif">

        <div class="notification-wrapper" v-if="notifClicked">
          <ul class="notifications" v-for="notif in notifArray">

            <li class="activate notif" v-if="!props.isActivated">Please activate your account</li>

            <li class="notif">{{ notif }}</li>
          </ul>

        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-tab-wrapper {
  z-index: -1;
  position: absolute;
  top: 75px;
  left: 5%;

  .user-tab {
    flex-direction: column;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 5px;
    border-radius: 5px;
    font-size: 1.5rem;
    font-family: Chango;
    color: var(--color-nav-txt) !important;




    .notification-wrapper {
      position: relative;
      margin-left: 10px;
      top: 20px;
      color: var(--color-nav-txt);
      font-family: Roboto Condensed;
      font-weight: 700;
      font-size: 1.4rem;
      overflow: hidden;
      border-radius: 3px;

      .notifications {
        display: flex;
        flex-direction: column;
        list-style: none;
        padding-inline-start: 0;
        background-color: var(--color-nav-bg);
        padding-inline-end: 0;
      }

      .notif {
        z-index: 10;
        background-color: var(--color-nav-bg);
        border-top: var(--color-nav-txt) 2px solid;
        padding: 7px;
        display: flex;
        align-items: center;
        transition: all 0.1s ease-in-out;
      }

      .notif::before {
        content: "\A";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--color-nav-txt);
        margin-right: 10px;
        display: flex;

      }

      .notif:first-child {
        border-top: transparent
      }

      .notif:hover {
        cursor: pointer;
        background-color: var(--color-nav-txt);
        color: var(--color-nav-bg);

      }
    }

    .usertab-info {
      background-color: var(--color-nav-bg);
      border-radius: 5px;
      z-index: 10;
      box-shadow: 4px 8px 5px 0px rgba(0, 0, 0, 0.3);

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
          display: flex;
          flex-direction: row;
          height: 100%;
          width: 100%;
          align-items: center;
          justify-content: center;



          .userPFP-img.nopfp {
            opacity: 0.2;
          }

          .no-pfp {
            position: absolute;
            display: flex;
            font-size: 0.8rem;
            justify-content: center;
            text-align: center;
            padding-top: 20px;
            height: 100%;
            width: 50%;
          }

          .add-pfp {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;

            input[type="button"] {
              position: relative;
              width: 50%;

              z-index: 1000;
              padding: 0 0;
              font-family: Chango;
              font-size: 16px;
              border-radius: 18px;
              cursor: pointer;
              height: 40px;
              color: var(--color-nav-txt) !important;
              border-style: none;
              background-color: var(--color-nav-bg);
              transition: all 0.1s ease-in-out;


            }

            input[type="button"]:hover {
              color: var(--color-nav-bg) !important;
              background-color: var(--color-nav-txt);
            }
          }

          .img-wr {
            position: relative;
            width: 100%;
            height: 50%;
            display: flex;
            justify-content: center;
            align-items: center;

            img {
              height: 70px;
            }
          }

          .notif-wr {
            position: relative;
            width: 100%;
            height: 100%;
            transition: all 0.1s ease-in-out;
            border-radius: 10px;
            display: flex;
            justify-content: flex-end;


            .notif-counter {
              position: absolute;
              background-color: rgb(32, 97, 1);
              color: var(--color-nav-bg);
              font-family: Roboto Condensed;
              font-weight: 700;
              font-size: 1.2rem;
              z-index: 1;
              right: 0;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              transition: all 0.2s;
            }

            .notif-counter-icon-wrapper {
              position: relative;
              height: 100%;
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: flex-end;
              transition: all 0.1s ease-in-out;
              border-radius: 10px;

              &:hover {
                cursor: pointer;
                background-color: var(--color-nav-txt);
                ;

                svg {
                  stroke: var(--color-nav-bg);

                }


              }


              svg {
                position: relative;
                fill: none;
                height: 20%;
                stroke: var(--color-nav-txt);
                stroke-width: 6px;
                animation: bell 3s ease-in-out infinite;
                transform-origin: top;
                transition: all 0.1s ease-in-out
              }

              @keyframes bell {
                35% {
                  transform: rotate(0);
                }

                40% {
                  transform: rotate(-20deg);
                }

                45% {
                  transform: rotate(20deg);

                }

                50% {
                  transform: rotate(-20deg);
                }

                55% {
                  transform: rotate(20deg);

                }

                60% {
                  transform: rotate(-20deg);

                }

                65% {
                  transform: rotate(0);

                }


              }
            }



          }

        }

        .user-text {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 5px;

          .displayName {
            font-family: Chango;
          }

          .userEmail {
            position: relative;
            width: 100%;
            background-color: var(--color-nav-txt);
            color: var(--color-nav-bg);
            padding: 0.2rem 0.3rem;
            border-radius: 10px 0 0 10px;
            font-size: 0.8rem;
          }
        }
      }
    }

    .usertab-links {
      display: flex;
      flex-direction: column;
      width: 100%;

      a {
        position: relative;
        width: 100%;
        text-align: left;
        text-decoration: none;
        font-size: 1.3rem;
        text-transform: uppercase;
        font-family: Chango;
        padding: 0 1rem;
        transition: font 0.1s, background-color 0.3s;
        padding: 10px;
        height: 100%;
        color: var(--color-nav-txt);
      }

      a:hover {
        background-color: var(--color-nav-txt);
        color: var(--vt-c-nav-text-hover);
        cursor: pointer;

      }
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

.notif-enter-active,
.notif-leave-active {
  transition: all 0.1s ease-out;
  opacity: 1;

}

.notif-enter-from,
.notif-leave-to {
  opacity: 0;
  transform: translatex(-50px)
}
</style>
