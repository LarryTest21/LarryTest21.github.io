<script setup lang="ts">
import { ref, onMounted } from "vue";
import emailSVG from "../components/icons/email.vue";
import passwordSVG from "../components/icons/password.vue";
import Modal from "../components/Modal.vue";
import { modalActive } from "../store/modalActive";
import { signedIn } from "../store/signedIn";
import firebase from "firebase/compat/app";

import "firebase/compat/auth";

const modalActivation = modalActive();
const { modalFalse } = modalActivation;
modalFalse();

const inputEmail = ref() as any;

const modalButtonMessage = ref();
const email = ref("");
const password = ref("");

const modalButtonShow = ref(false);
const modalAnimation = ref(false);
const error = ref(false);
const loggedIn = ref(false);

const signIn = () => {
  modalButtonMessage.value = "";
  modalButtonShow.value = false;
  modalAnimation.value = true;
  modalActivation.state = true;

  firebase
    .auth()
    .signInWithEmailAndPassword(email.value, password.value)
    .then(() => {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const signedInCheck = signedIn();
      const { signedInTrue } = signedInCheck;
      signedInTrue();
      loggedIn.value = true;
      localStorage.setItem("isLoggedIn", JSON.stringify(loggedIn.value));
      localStorage.setItem("loggedInBefore", "true");
      modalActivation.state = false;
    })
    .catch((err) => {
      error.value = true;
      modalAnimation.value = false;

      setTimeout(() => {
        modalButtonShow.value = true;
      }, 300);
      modalButtonMessage.value = err.code;

      if (err.code === "auth/invalid-email") {
        modalButtonMessage.value = "Invalid E-mail";
      } else if (err.code === "auth/wrong-password") {
        modalButtonMessage.value = "Wrong Password";
      }
    });
};

onMounted(() => {
  console.log(inputEmail);
  setTimeout(() => {
    inputEmail.value.focus();
  }, 300);
});
</script>

<template>
  <div class="login-wrap">
    <transition name="modal">
      <Modal
        v-if="modalActivation.state"
        :modalButtonShow="modalButtonShow"
        :modalButtonMessage="modalButtonMessage"
        :modalAnimation="modalAnimation"
      />
    </transition>

    <div class="inputs">
      <div class="input">
        <input
          type="text"
          ref="inputEmail"
          placeholder="Email"
          v-model="email"
          @keyup.enter.native="signIn"
        />
        <emailSVG class="icon" />
      </div>

      <div class="input">
        <input
          type="password"
          placeholder="Password"
          v-model="password"
          @keyup.enter.native="signIn"
        />
        <passwordSVG class="icon" />
      </div>

      <div class="buttons">
        <input type="button" value="LogIn" @click.prevent="signIn" />

        <RouterLink to="/register">
          <input type="button" value="Register" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-wrap {
  position: fixed;
  width: 250px;
  top: 75px;
  left: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 4px 4px 10px 10px rgba(0, 0, 0, 0.3);
  align-items: center;
  background: var(--color-nav-bg);
  border-radius: 5px;
  font-size: 1rem;
  font-family: Chango;
  color: var(--color-nav-txt) !important;
  cursor: default;
  z-index: -10;
  overflow: hidden;

  .inputs {
    padding: 15px;
    width: 100%;
    height: 100%;

    .input {
      border-color: var(--vt-c-nav-text-bg-hover);
      background-color: var(--color-bg);
      color: var(--color-nav-txt);
      border-style: none;
      transition: width 0.1s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        position: absolute;
        width: 20px;
        height: 25px;
        left: 20px;
        stroke-width: 2px;
        fill: var(--color-nav-txt);
      }
      input {
        width: 100%;
        height: 40px;
        font-family: Chango;
        border-style: none;
        background: transparent;
        margin: 10px 0;
        border-bottom: solid rgba(0, 86, 167, 0.555);
        transition: all 0.1s ease-in-out;
      }
      input[type="button"] {
        width: 100%;
      }

      input[type="text"],
      input[type="password"] {
        padding: 5px 5px 5px 30px;
      }

      input:active {
        border-style: none;
        outline: none;
      }

      input:focus {
        outline: none;
        border-style: none;
        border-bottom: solid rgba(0, 86, 167, 0.192);
        width: 100%;
      }
      input,
      select,
      textarea {
        color: var(--color-nav-txt);
      }
    }

    input::placeholder {
      color: var(--color-nav-txt);
      font-weight: Light;
    }

    .buttons {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 10px;

      input[type="button"] {
        overflow: visible;
        padding: 0 0;
        width: 100%;
        font-family: Chango;
        font-size: 1rem;
        border-radius: 18px;
        cursor: pointer;
        height: 40px;
        color: var(--color-nav-txt) !important;
        border-style: none;
        box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
        background-color: var(--color-nav-bg);
        transition: all 0.1s ease-in-out;
      }
      input[type="button"]:hover {
        color: var(--color-nav-bg) !important;
        background-color: var(--color-nav-txt);
      }
      input[type="button"]:active {
        box-shadow: -1px -1px 1px 0.5px rgba(0, 0, 0, 0.3);
      }

      a {
        display: flex;
        justify-content: center;
        margin: 5px;
        overflow: visible;
        text-decoration: none;
      }
      a:nth-child(1) {
        width: 100%;
        left: auto;
        width: 100%;
      }
      a:nth-child(2) {
        padding: 0 0;
        left: 0;
        width: 80%;
      }
      a::after {
        height: 0;
        box-shadow: 0 0 0 0;
      }
      a:hover {
        box-shadow: 0px 0 0 0 var(--vt-c-nav-text-bg-hover);
        color: var(--vt-c-nav-txt);
        background-color: transparent;
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
</style>
