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
import { ref as storageFBRef, getStorage, getBlob } from "firebase/storage";

const modalActivation = ref(true);
const modalButtonMessage = ref();
const modalLoadingMessage = ref();
const modalAnimation = ref(false);

const modalClickAway = ref(false);
const picChanged = profPicChanged();

const modalClickAwayFunction = () => {
  if (modalClickAway.value) {
    modalActivation.value = false;
  }
};

const showUserName = ref("") as any;
const showFirstName = ref("") as any;
const showLastName = ref("") as any;
const showEmail = ref("") as any;
const editingProfile = ref(false);
const userPFP = ref();
const imgLoaded = ref(false);
const userData = ref();
const userPFPStored = ref();
const Logo = new URL("../assets/logos/logo.svg", import.meta.url);
const logoBase64 = ref();

const toDataUrl = (url, callback) => {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
};

firebase.auth().onAuthStateChanged((user) => {
  modalActivation.value = true;

  const modalButton = modalButtonActive();
  const { modalButtonHide } = modalButton;
  modalButtonHide();

  if (user) {
    modalActivation.value = true;
    modalAnimation.value = true;
    userPFPStored.value = localStorage.getItem("avatar");

    const downloadPFP = () => {
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
          userPFPStored.value = base64data;
          userPFP.value = base64data;
          localStorage.setItem("avatar", userPFPStored.value);
          return;
        };
      };

      convertBase64()
        .catch((error) => {
          switch (error.code) {
            case "storage/object-not-found":
              toDataUrl(Logo, function (myBase64) {
                console.log(myBase64); // myBase64 is the base64 string
                userPFPStored.value = myBase64;
                localStorage.setItem("avatar", myBase64);
              });

              break;
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;

            // ...

            case "storage/unknown":
              // Unknown error occurred, inspect the server response
              break;
          }
        })
        .then(() => {
          setTimeout(() => {
            modalActivation.value = false;
          }, 2000);
        });
    };

    watch(picChanged, () => {
      downloadPFP();
    });

    if (userPFPStored.value !== null) {
      userPFP.value = localStorage.getItem("avatar");
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
    console.log(errorP.value);
  }
};

// const saveProfile = async () => {
//   const user = firebase.auth().currentUser;
//   const credential = firebase.auth.EmailAuthProvider.credential(
//     userData.value.email,
//     password.value
//   );
//   user!.reauthenticateWithCredential(credential).catch((error) => {
//     console.log(error);
//     if (error.code == "auth/missing-password") {
//       errorP.value = true;
//       errorMsg.value = "Wrong password";
//       return;
//     } else if (error.code == "auth/too-many-requests") {
//       errorP.value = true;
//       errorMsg.value = "Too many requests, login temporarily disabled";
//       return;
//     }
//   });
// };

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

onMounted(() => {});
</script>

<template>
  <div class="profile-wrapper">
    <div class="form-wrap">
      <transition name="error">
        <div v-show="errorP" class="error">{{ errorMsg }}</div>
      </transition>
      <transition name="modal">
        <EditProfilePicture
          v-if="editingProfile && editProfPic.state"
          v-click-away="closeProf"
        />
      </transition>

      

      <div class="profile-pic">
        <div class="prof-content">
          <img v-bind:src="userPFP || Logo" @load="imgLoaded = !imgLoaded" />
          <input
            type="button"
            value="Change"
            v-if="editingProfile"
            @click="profPicEnable"
          />
        </div>
      </div>
      <div
        class="inputs-field-wrapper"
        @click="closeError"
        v-click-away="closeError"
        :class="[pwOp ? '' : 'op']"
      >
      <transition name="modal">
        <Modal
          class="modal"
          v-if="modalActivation"
          :modalAnimation="modalAnimation"
          :loadingScale="2"
          :modalLoadingMessage="modalLoadingMessage"
          :modalButtonMessage="modalButtonMessage"
          v-click-away="modalClickAwayFunction"
        />
      </transition>
        <div class="inputs">
          <div class="field">
            <div class="icon">
              <emailSVG class="icon" />
            </div>
            <div class="label-input">
              <label class="lastName">Email</label>
              <div class="value" v-if="!editingProfile">{{ showEmail }}</div>
              <input
                v-if="editingProfile"
                type="text"
                v-model="showEmail"
                @focus="closeError"
              />
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

              <input
                type="text"
                v-if="editingProfile"
                v-model="showFirstName"
                @focus="closeError"
              />
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
              <input
                v-if="editingProfile"
                type="text"
                v-model="showLastName"
                @focus="closeError"
              />
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
              <input
                v-if="editingProfile"
                type="text"
                v-model="showUserName"
                @focus="closeError"
              />
            </div>
          </div>

          <div class="field" :class="[pwOp ? '' : 'op']">
            <div class="icon"><passwordSVG class="icon" /></div>
            <div class="label-input">
              <label class="lastName">New Password</label>
              <input
                type="password"
                v-if="pwOp"
                v-model="newPassword"
                @focus="closeError"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="buttons">
        <input
          type="button"
          value="Edit"
          class="editButton"
          :class="[!pwOp ? null : 'op']"
          @click.prevent="editProPicPanel"
        />

        <div class="save" v-visible="editingProfile">
          <div class="field" :class="[pwOp ? '' : 'op']">
            <div class="icon"><passwordSVG class="icon" /></div>
            <div class="label-input">
              <label class="lastName">Password</label>
              <input
                type="password"
                v-model="password"
                @focus="closeError"
                @keyup.enter.native="saveProfile"
              />
            </div>
          </div>
          <input type="button" value="Save" @click.prevent="saveProfile" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-wrapper {
  height: 100vh;
  padding-top: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
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
  .form-wrap {
    position: relative;
    font-family: Chango;
    color: var(--color-nav-txt);
    font-size: 1.1rem;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-content: center;
    gap: 30px;
    border-radius: 30px;

    .error {
      display: flex;
      border-radius: 30px;
      z-index: 50;
    }

    input[type="button"] {
      font-family: Chango;
      border-radius: 1rem;
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
      height: 120px;
      width: 120px;
      top: -10px;
      padding: 10px;
      left: 70px;
      background-color: var(--color-nav-bg);
      border-radius: 50%;
      z-index: 2;

      .prof-content {
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 10px;

        input[type="button"] {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          padding: 0;
          height: 30px;
          bottom: 10px;
        }
      }
    }
    .inputs-field-wrapper.op {
      width: 400px;
    }
    .inputs-field-wrapper {
      position: relative;
      width: 600px;
      height: 70%;
      background-color: var(--color-nav-bg) !important;
      border-radius: 20px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: 50px 50px 50px 50px;
      gap: 30px;
      transition: all 0.2s ease-in-out;
      overflow:hidden;

      .inputs {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 80%;
        gap: 15px;
        margin-top: 70px;

        .field.op {
          opacity: 0%;
          width: 100%;
        }
        .field {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          width: 70%;
          height: 50px;
          .label-input {
            input[type="text"] {
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
      width: 150px;
      top: 20px;
      right: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;

      input {
        margin-top: 0;
      }
      .save {
        width: 100%;
        display: flex;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin-top: 50px;
      }

      input[type="button"] {
        width: 90%;
        font-size: 1.8rem;
        border-radius: 30px;
      }
      input[type="button"].op {
        color: var(--color-nav-bg) !important;
        background-color: var(--color-nav-txt);
      }

      .save {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        .field {
          position: relative;
          width: 100%;
          display: flex;
          .icon {
            position: absolute;
          }
          .label-input {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
        }
      }
    }

    .icon {
      height: 25px;
      width: 25px;
      align-self: flex-start;
      position: relative;
      left: -3px;
      top: -1px;
      fill: var(--color-nav-txt);
      z-index: 0;
      pointer-events: none;
      stroke-width: 3%;
      stroke: var(--vt-c-nav-text-bg-hover);
    }
    img {
      width: 100px;
    }
  }
}

@media (max-width: 412px) {
  input[type="button"] {
    height: 200px;
    width: 70%;
  }
  .profile-wrapper {
    height: 100vh;
    padding-top: 0;
    justify-content: flex-end;
    align-items: flex-end;
    .form-wrap {
      position: relative;
      height: 100%;
      width: 100%;
      align-items: flex-end;
      justify-content: flex-end;
      .buttons {
        position: absolute;
        right: 0;
        width: 50%;
      }
      .inputs-field-wrapper {
        width: 100%;
        height: 100%;
        background-color: transparent !important;
      }
      .inputs-field-wrapper.op {
        padding: 30px 30px 30px 30px;
        position: relative;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        border-radius: 30px 30px 0 0;
        .inputs {
          font-size: 2rem;
          width: 100%;
          margin-top: 40px;
          .field {
            height: 100%;
          }
        }
      }
    }
  }
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
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
  opacity: 1;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
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
</style>
