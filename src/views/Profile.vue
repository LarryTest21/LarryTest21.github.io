<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import nameSVG from "../components/icons/user.vue";
import userSVG from "../components/icons/user.vue";
import emailSVG from "../components/icons/email.vue";
import passwordSVG from "../components/icons/password.vue";
import firebase from "firebase/compat/app";
import db from "../firebase/firebaseInit";
import "firebase/auth";
import $ from "jquery";
import EditProfilePicture from "../components/EditProfilePicture.vue";
import Modal from "../components/Modal.vue";
import { modalButtonActive } from "../store/modalButtonActive";
import { profPicClose } from "../store/profPicClose";
import { profPicChanged } from "@/store/profPicChanged";
import moment from "moment";
import Delete from "@/components/icons/delete.vue"
import { base64NoPFP } from "@/components/icons/nopfpbase64"


const skeleton = ref();
const modalActivation = ref(true);
const modalButtonMessage = ref();
const modalLoadingMessage = ref();
const modalAnimation = ref(false);

const modalClickAway = ref(false);
const picChanged = profPicChanged();

const skeletonLoad = ref(true)

const modalClickAwayFunction = () => {
  if (modalClickAway.value) {
    modalActivation.value = false;
  }
};
const noPFP = ref()

const storedPosts = ref([]) as any
const readHistoryArray = ref([]) as any;
const readArrayFinal = ref([]) as any

const showUserName = ref("") as any;
const showFirstName = ref("") as any;
const showLastName = ref("") as any;
const showEmail = ref("") as any;
const editingProfile = ref(false);
const userPFP = ref();
const imgLoaded = ref(false);
const userData = ref();
const userPFPStored = ref();

const colRef = firebase.firestore().collection("blogposts");


const getHistoryRead = () => {
  const docRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser!.uid);

  skeletonLoad.value = true;

  docRef
    .get().then((user) => {
      readHistoryArray.value = user.data()!.readBlog

      storedPosts.value = [];
      colRef
        .get()
        .then((querySnapshot) =>

          querySnapshot.forEach((post) => {
            const check = post.data();
            storedPosts.value.push(check);
          })

        ).then(() => {

          if (readHistoryArray.value === undefined || readHistoryArray.value.length === 0) {
            setTimeout(() => {
              skeletonLoad.value = false;
            }, 500);

          } else {
            const propsToCheck = ["postID"];

            function filterByValue(array, string) {

              return array.filter((o) =>
                propsToCheck.some((k) =>
                  String(o[k]).toLowerCase().includes(string.toLowerCase())
                )
              );
            }



            readHistoryArray.value.forEach((value) => {
              var interSingle = filterByValue(storedPosts.value, value);
              readArrayFinal.value.push(interSingle[0])

              setTimeout(() => {
                skeletonLoad.value = false;
              }, 500);
            })
          }


        })
    })

}
const deleteHistoryPost = async (postID) => {
  const docRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser!.uid);

  readArrayFinal.value.splice(readArrayFinal.value.findIndex(item => item.postID === postID), 1)
  const finalArray = ref([]) as any;
  const refreshArray = () => {
    readArrayFinal.value.forEach((post) => {
      finalArray.value.push(post.postID)
    })
  }
  refreshArray()
  docRef.update({ readBlog: finalArray.value })

}


firebase.auth().onAuthStateChanged((user) => {
  modalActivation.value = true;

  const modalButton = modalButtonActive();
  const { modalButtonHide } = modalButton;
  modalButtonHide();

  if (user) {
    getHistoryRead();

    modalActivation.value = true;
    modalAnimation.value = true;
    userPFPStored.value = localStorage.getItem("avatar");


    const downloadPFP = () => {
      var docRef = firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser!.uid);
      docRef
        .get()
        .then((user) => {
          var userPic = user.data();
          console.log(userPic!.profilePic);

          if (userPic!.profilePic === undefined) {
            userPFP.value = base64NoPFP
            noPFP.value = true
            console.log("no prof pic");
          } else {
            console.log("Yes prof pic");
            noPFP.value = false
            userPFPStored.value = userPic!.profilePic;
            userPFP.value = userPic!.profilePic
            localStorage.setItem("avatar", userPFPStored.value);
          }

        })
        .then(() => {
          setTimeout(() => {
            modalActivation.value = false;
            imgLoaded.value = false
          }, 600);
        });
    };

    watch(picChanged, () => {
      downloadPFP();
    });

    if (userPFPStored.value !== null) {
      userPFP.value = localStorage.getItem("avatar");
      setTimeout(() => {
        modalActivation.value = false;
      }, 600);


    } else if (userPFPStored.value == null) {
      downloadPFP();
    }

    watch(imgLoaded, () => {
      setTimeout(() => {
        modalActivation.value = false;
      }, 600);
    });

    const dataBase = db
      .collection("users")
      .doc(firebase.auth().currentUser?.uid);
    dataBase
      .get()
      .then((doc) => {
        userData.value = doc.data();
      })

      .then(() => {
        showFirstName.value = userData.value.firstName;
        showLastName.value = userData.value.lastName;
        showUserName.value = userData.value.userName;
        showEmail.value = userData.value.email;
      });
  }
});

const password = ref("");
const newPassword = ref("");

const errorP = ref(false);
const errorMsg = ref("");

const pwOp = ref(false);

const closeError = () => {
  if (errorP.value) {
    errorP.value = false;
  }
};

const saveProfile = async () => {
  errorP.value = false;
  errorMsg.value = "";

  modalActivation.value = true;
  modalLoadingMessage.value = "Updating";

  const modalButton = modalButtonActive();
  const { modalButtonHide } = modalButton;
  modalButtonHide();

  const user = firebase.auth().currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    userData.value.email,
    password.value
  );
  user!
    .reauthenticateWithCredential(credential)
    .catch((error) => {
      firebase.setLogLevel("silent");
      if (error.code == "auth/missing-password") {
        errorP.value = true;
        modalActivation.value = false;
        errorMsg.value = "Missing password";
        return;
      } else if (error.code == "auth/wrong-password") {
        errorP.value = true;
        modalActivation.value = false;

        errorMsg.value = "Wrong password";
        return;
      } else if (error.code == "auth/wrong-password") {
        errorP.value = true;
        modalActivation.value = false;
        errorMsg.value = "Wrong password";
        return;
      } else if (error.code == "auth/too-many-requests") {
        errorP.value = true;
        modalActivation.value = false;
        errorMsg.value = "Too many requests, wait before trying again";
      } else if (error.code !== "undefined") {
        errorP.value = true;
        modalActivation.value = false;
        errorMsg.value = "Unknown error";
      }
    })
    .then(() => {
      if (errorP.value) {
        return;
      } else {
        modalAnimation.value = true;
        modalActivation.value = true;
        modalLoadingMessage.value = "Updating";
        const modalButton = modalButtonActive();
        const { modalButtonHide } = modalButton;
        modalButtonHide();

        if (userData.value.email == showEmail.value) {
          console.log("email is same");
        } else {
          console.log("email is changed");
          firebase.auth().currentUser?.updateEmail(showEmail.value);
        }

        firebase
          .auth()
          .currentUser?.updateEmail(showEmail.value)
          .then(async () => {
            firebase.auth().currentUser?.updateProfile({
              displayName: showUserName.value,
            });

            const firebaseAuth = firebase.auth().currentUser;
            const dataBase = db.collection("users").doc(firebaseAuth?.uid);

            await dataBase
              .set({
                email: showEmail.value,
                userName: showUserName.value,
                firstName: showFirstName.value,
                lastName: showLastName.value,
                lastUpload: new Date(),
              })
              .catch((error) => {
                error.value = true;
                errorMsg.value = error.message;
              });

            console.log("saved everything");
            modalActivation.value = true;
            modalAnimation.value = false;
            modalLoadingMessage.value = "Profile Updated";
            modalClickAway.value = true;
            setTimeout(() => {
              modalActivation.value = false;
            }, 1500);
          })
          .catch((error) => {
            error.value = true;
            errorMsg.value = error.message;
          });
      }
    })
    .catch((error) => {
      error.value = true;
      errorMsg.value = error.message;
    });
};

const editProPicPanel = () => {
  if (editingProfile.value && pwOp.value) {
    editingProfile.value = false;
    pwOp.value = false;
  } else if (!editingProfile.value && !pwOp.value) {
    editingProfile.value = true;
    pwOp.value = true;
  }
};

const editProfPic = profPicClose();

const profPicEnable = () => {
  const { profPicOpen } = editProfPic;
  profPicOpen();
};

const closeProf = () => {
  const { profPicClose } = editProfPic;
  profPicClose();
};

onMounted(() => {
  $.each(skeleton.value.children, function (i, el) {
    $(el).css({ 'animation-delay': (i / 10 * Math.floor(Math.random() * -50)) + "s" });
  });


})


</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-wrapper-inner">
      <div class="form-wrap" :class="[pwOp ? 'active' : '']">
        <transition name="modal">
          <Modal class="modal" v-if="modalActivation" :position="'absolute'" :modalAnimation="modalAnimation"
            :loadingScale="3" :modalLoadingMessage="modalLoadingMessage" :modalButtonMessage="modalButtonMessage"
            :spinnerColor="'var(--color-nav-txt)'" v-click-away="modalClickAwayFunction" />
        </transition>
        <transition name="error">
          <div v-show="errorP" class="error">{{ errorMsg }}</div>
        </transition>
        <transition name="edit">
          <EditProfilePicture class="edit-profile-picture" v-if="editingProfile && editProfPic.state"
            v-click-away="closeProf" />
        </transition>

        <div class="profile-pic">
          <div class="prof-content" :class="noPFP ? 'nopfp' : ''">
            <img v-bind:src="userPFP" />
            <div class="no-pfp" v-if="noPFP">no profile pic</div>
            <input type="button" value="Change" v-if="editingProfile" @click="profPicEnable" />
          </div>
        </div>
        <div class="inputs-field-wrapper" @click="closeError" v-click-away="closeError">

          <div class="inputs">
            <div class="field">
              <div class="icon">
                <emailSVG class="icon" />
              </div>
              <div class="label-input">
                <label class="lastName">Email</label>
                <div class="value" v-if="!editingProfile">{{ showEmail }}</div>
                <input v-if="editingProfile" type="text" v-model="showEmail" @focus="closeError" />
              </div>
            </div>
            <div class="field">
              <div class="icon">
                <nameSVG class="icon" />
              </div>
              <div class="label-input">
                <label class="firstName">First Name</label>
                <div class="value" v-if="!editingProfile">
                  {{ showFirstName }}
                </div>

                <input type="text" v-if="editingProfile" v-model="showFirstName" @focus="closeError" />
              </div>
            </div>

            <div class="field">
              <div class="icon">
                <userSVG class="icon" />
              </div>
              <div class="label-input">
                <label class="lastName">Last Name</label>
                <div class="value" v-if="!editingProfile">
                  {{ showLastName }}
                </div>
                <input v-if="editingProfile" type="text" v-model="showLastName" @focus="closeError" />
              </div>
            </div>

            <div class="field">
              <div class="icon">
                <userSVG class="icon" />
              </div>
              <div class="label-input">
                <label class="lastName">Username</label>
                <div class="value" v-if="!editingProfile">
                  {{ showUserName }}
                </div>
                <input v-if="editingProfile" type="text" v-model="showUserName" @focus="closeError" />
              </div>
            </div>

            <div class="field" v-if="editingProfile">
              <div class="icon">
                <passwordSVG class="icon" />
              </div>
              <div class="label-input">
                <label class="lastName">New Password</label>
                <input type="password" v-model="newPassword" @focus="closeError" />
              </div>
            </div>
          </div>
        </div>
        <div class="buttons">
          <input type="button" value="Edit" class="editButton" @click.prevent="editProPicPanel" />
          <TransitionGroup name="edit">
            <div class="save" v-if="editingProfile" key="1">
              <div class="field">

                <div class="label-input">
                  <div class="icon">
                    <passwordSVG class="icon" />
                  </div>
                  <label class="password">Password</label>

                  <div class="input"> <input type="password" v-model="password" @focus="closeError"
                      @keyup.enter.native="saveProfile" />
                  </div>
                </div>
              </div>
              <input type="button" value="Save" @click.prevent="saveProfile" />
            </div>

          </TransitionGroup>
        </div>
      </div>
      <div class="read-history-wrapper">
        <div class="read-history">
          <div class="labels">
            <label> Read History</label>

          </div>
          <TransitionGroup name="fade">
            <div class="skeleton-wrapper-wr" key="1" v-show="skeletonLoad">
              <div class="skeleton-wrapper" ref="skeleton">
                <li></li>
                <li></li>
                <li></li>
              </div>
            </div>
            <div class="empty" key="2"
              v-if="(!skeletonLoad && readArrayFinal === undefined) || (!skeletonLoad && readArrayFinal.length === 0)">You
              have no history yet</div>

            <div class="history-list-wrapper" v-if="!skeletonLoad" key="3">
              <ul class="label-list list" v-if="readHistoryArray.value != undefined">
                <li>Title</li>
                <li>ID</li>
                <li>Date</li>
                <li></li>
              </ul>
              <ul class="history-list list" v-for="historyValue in readArrayFinal">
                <div class="post-title">{{ historyValue.postTitle }}</div>
                <div class="post-id">{{ historyValue.postID }}</div>
                <div class="post-date">{{ moment(new Date(historyValue.postDate.toDate())).format(
                  "YY/MM/DD, HH:mm"
                )
                }}</div>
                <div class="delete-button">
                  <Delete @click="deleteHistoryPost(historyValue.postID)" />
                </div>
              </ul>
            </div>
          </TransitionGroup>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-wrapper {
  padding-top: 70px;

  input,
  select,
  textarea {
    color: var(--color-nav-txt);
  }


  input {
    margin-top: 5px;
    padding: 5px;
    font-family: Verdana;
    font-weight: 700;
    width: 100%;
    background: transparent;
    border: solid var(--color-nav-txt);
    border-radius: 10px;
    outline: none;
  }

  .profile-wrapper-inner {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 70px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-start;

    .form-wrap {
      position: relative;
      font-family: Chango;
      color: var(--color-nav-txt);
      font-size: 1.1rem;
      position: relative;
      width: 400px;
      border-radius: 30px;
      display: flex;
      flex-direction: row;
      gap: 30px;
      border-radius: 5%;
      background-color: var(--color-nav-bg) !important;
      transition: all 0.2s ease-in-out;
      overflow: hidden;
      left: 0;
      margin: auto;
      right: 0;

      .error {
        display: flex;
        border-radius: 30px;
        z-index: 50;
      }

      .edit-profile-picture {
        height: 50%;
        width: 90%;
      }

      input[type="button"] {
        font-family: Chango;
        cursor: pointer;
        padding: 10px;
        color: var(--color-nav-txt) !important;
        border-style: none;
        box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
        background-color: var(--color-nav-bg);
      }

      input[type="button"]:hover {
        color: var(--color-nav-bg) !important;
        background-color: var(--color-nav-txt);
        transition: all 0.1s ease-in-out;
      }



      .profile-pic {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 90px;
        width: 90px;
        padding: 10px;
        top: 5px;
        left: 30px;
        background-color: var(--color-nav-bg);
        border-radius: 50%;
        z-index: 2;
        transition: all 0.2s ease-in-out;

        .prof-content.nopfp {
          img {
            opacity: 0.3;
          }

          &::before {
            opacity: 0.3
          }


        }

        .prof-content {
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;

          .no-pfp {
            position: absolute;
            text-align: center;
            font-size: 1.6rem;
          }


          &::after {
            position: absolute;
            content: "";
            width: 110%;
            height: 110%;
            background-color: var(--color-nav-bg);
            z-index: -1;
            border-radius: 50%;
          }

          &::before {
            position: absolute;
            content: "";
            width: 130%;
            height: 130%;
            background-color: var(--color-nav-txt);
            z-index: -1;
            border-radius: 50%;

          }

          input[type="button"] {
            position: absolute;
            margin-right: -100px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            height: 40px;
            width: 100px;
            padding: 0;
          }

          img {
            height: 70px;
            width: 70px;
            transition: all 0.2s ease-in-out;
          }
        }
      }


      .inputs-field-wrapper {
        position: relative;
        transition: all 0.2s ease-in-out;
        overflow: hidden;
        font-size: 1.5rem;


        .inputs {
          position: relative;
          margin-top: 80px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          gap: 5px;
          padding: 30px;
          transition: all 0.2s ease-in-out;


          .field {
            height: 70px;
            display: flex;
            flex-direction: row;
            align-items: flex-start;


            .label-input {
              position: relative;
              width: 250px;

              input[type="text"] {
                width: 100%;
                position: relative;
                height: 30px;
                font-size: 1rem;
                font-family: Verdana;
                font-weight: 900;
              }

              .value {
                height: 50px;
                font-family: Verdana;
                font-weight: 900;
              }
            }
          }
        }
      }

      .buttons {
        position: absolute;
        top: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: all 0.2s ease-in-out;
        width: 200px;
        right: 0;

        input[type="button"] {
          width: 90%;
          font-size: 1.8rem;
          border-radius: 30px;
        }

        input[type="button"] {
          color: var(--color-nav-bg) !important;
          background-color: var(--color-nav-txt);
        }

        .save {
          transition: all 0.2s ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: center;

          .field {
            position: relative;


            .label-input {
              position: relative;
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 100%;

              .icon {
                position: absolute;
                top: -3px;
                left: -25px
              }

              .input {
                height: 100%;
                width: 100%;

                position: relative;
              }
            }
          }
        }
      }

      .icon {
        height: 40px;
        width: 40px;
        align-self: flex-start;
        position: relative;
        left: -5px;
        top: -2px;
        fill: var(--color-nav-txt);
        z-index: 0;
        pointer-events: none;
        stroke-width: 3%;
        stroke: var(--vt-c-nav-text-bg-hover);
      }
    }

    .form-wrap.active {
      width: 650px;

      .profile-pic {
        top: 20px;
        left: 170px;

        .prof-content {
          img {
            width: 90px;
            height: 90px
          }
        }
      }

      .inputs-field-wrapper {
        margin-top: 50px;

      }

      .buttons {
        right: 20px;

        .save {
          display: flex;
          margin-top: 30px;


        }

        .save.active {
          opacity: 1;
        }
      }

    }


  }

  .read-history-wrapper {
    position: relative;
    width: 100%;
    height: 300px;
    display: flex;


    .read-history {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 20px;
      position: relative;
      width: 550px;
      height: 100%;
      border-radius: 30px;
      background-color: var(--color-nav-bg);
      color: var(--color-nav-txt);
      font-family: Roboto Condensed;
      gap: 10px;

    }

    label {
      display: flex;
      font-family: Chango;
      color: var(--color-nav-txt);
      font-size: 2rem;
      width: 100%;
      justify-content: center;
      margin-bottom: 30px;
    }

    .list {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 1fr;
      padding-inline-start: 0;
      padding-left: 5px;
      gap: 20px;
    }

    .label-list {
      position: relative;
      list-style: none;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .history-list-wrapper {
      overflow-y: scroll;
    }


    .history-list-wrapper::-webkit-scrollbar {
      width: 10px;
      border-radius: 5px;
    }

    .history-list-wrapper::-webkit-scrollbar-track {
      background: #c5c5c5;
      border-radius: 5px;
    }

    .history-list-wrapper::-webkit-scrollbar-thumb {
      background: var(--color-nav-txt);
      border-radius: 10px;
      height: 10%;
    }

    .empty {
      font-family: Chango;
      font-size: 2rem;
      text-align: center;
      vertical-align: middle;
      line-height: 50px;
      background-color: var(--color-nav-txt);
      color: var(--color-nav-bg);
      border-radius: 30px;
      top: 0;
      margin: auto;
    }

    .history-list {
      position: relative;
      font-family: Roboto Condensed;
      font-size: 1.2rem;
      color: var(--color-nav-bg);
      border-radius: 10px;
      background-color: var(--color-nav-txt);
      margin-right: 10px;

      div {
        display: flex;
        align-items: center;
        padding: 5px;
      }

      .post-title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .post-id {
        font-size: 1rem;
      }

      .post-date {
        font-size: 0.9rem;
      }

      .delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;

        svg {
          fill-rule: evenodd;
          cursor: pointer;
          width: 80%;
          height: 80%;
          stroke: var(--color-nav-txt);
          fill: var(--color-nav-bg);

          &:hover {
            scale: 1.2;
            animation: jiggle 0.4s ease-in-out;
          }

          :deep(.delete-2) {
            fill: var(--color-nav-txt);
          }

          @keyframes jiggle {
            0% {
              transform: rotate(0);
            }

            16% {
              transform: rotate(12deg);
            }

            33% {
              transform: rotate(-12deg);
            }

            49% {
              transform: rotate(12deg);
            }

            66% {
              transform: rotate(-25deg);
            }

            100% {
              transform: rotate(0)
            }
          }
        }
      }
    }

    .skeleton-wrapper {
      width: 100%;
      height: 100%;
      z-index: 100;

      li {
        list-style: none;
        height: 30px;
        margin: 10px 0;
        border-radius: 10px;
        background-color: black;
        content: "";
        background: linear-gradient(100deg,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.384) 50%,
            rgba(255, 255, 255, 0) 60%) #c7c7c7;
        background-size: 200% 100%;
        background-position-x: 180%;
        animation: 0.8s loading ease-in-out infinite;

      }
    }

    .history-list-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }






    @keyframes loading {
      to {
        background-position-x: -20%;
      }
    }

  }
}

.modal {
  width: 100%;
  height: 100%;
}

.error-enter-active,
.error-leave-active {
  transition: all 0.1s ease-out;
  opacity: 0.9;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-leave-active {
  position: absolute;
}


.picPanel-enter-active,
.picPanel-leave-active {
  transition: all 0.1s ease-out;
  opacity: 1;
}

.picPanel-enter-from,
.picPanel-leave-to {
  opacity: 0;
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

.edit-enter-active,
.edit-leave-active {
  transition: all 0.2s ease-out;
  opacity: 1;
}

.edit-enter-from,
.edit-leave-to {
  opacity: 0;
  transform: translateX(200px)
}

@media only screen and (max-width: 600px) {

  .profile-wrapper {
    height: 100%;
    top: 0;
    padding: 10px;

    .profile-wrapper-inner {
      position: relative;
      padding: 0;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 30px;

      .form-wrap {
        position: relative;
        width: 100%;
        height: 100vh;
        display: flex;
        margin: 0;
        padding: 10px;



        .profile-pic {
          position: absolute;
          top: 8vh;
          margin-left: 10px;
          left: auto;
        }

        .inputs-field-wrapper {
          height: 95%;
          width: 100%;
          border-radius: 10px;
          ;
          background-color: transparent;
          height: 100%;
          background-color: var(--color-nav-bg) !important;
        }



        .buttons {
          position: relative;
          height: 5vh;
          right: 20px;
        }


      }
    }
  }
}
</style>
