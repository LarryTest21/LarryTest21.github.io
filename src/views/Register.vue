<script setup lang="ts">
import { ref } from "vue";
import nameSVG from "@/components/icons/user.vue";
import userSVG from "@/components/icons/user.vue";
import emailSVG from "@/components/icons/email.vue";
import passwordSVG from "@/components/icons/password.vue";
import firebase from "firebase/compat/app";
import "firebase/auth";
import db from "../firebase/firebaseInit";
import router from "../router";

const firstName = ref("");
const lastName = ref("");
const user = ref("");
const email = ref("");
const password = ref("");

const displayName = ref("");
const initialsUser = ref("");

const errorCheck = ref(false);
const errorMsg = ref("");

const closeError = () => {
  if (errorCheck.value) {
    errorCheck.value = false;
  }
};

const register = async () => {
  if (
    firstName.value !== "" &&
    lastName.value !== "" &&
    user.value !== "" &&
    email.value !== "" &&
    password.value !== ""
  ) {
    errorCheck.value = false;
    errorMsg.value = "";

    const firebaseAuth = await firebase.auth();

    const createUser = await firebaseAuth
      .createUserWithEmailAndPassword(email.value, password.value)
      .catch((error) => {
        if (error.message == "Firebase: Error (auth/email-already-in-use).") {
          errorCheck.value = true;

          errorMsg.value = "E-mail already in use";
          return;
        } else {
          errorCheck.value = true;
          errorMsg.value = error.message;
        }
      });

    const result = await createUser!;
    const dataBase = db.collection("users").doc(result.user!.uid);

    await dataBase.set({
      createdAt: new Date(),
      firstName: firstName.value,
      lastName: lastName.value,
      username: user.value,
      email: email.value,
      clearance: 'regular'
    });

    const getInitials = function (name) {
      var parts = name.split(" ");
      var initials = "";
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].length > 0 && parts[i] !== "") {
          initials += parts[i][0];
        }
      }
      return initials;
    };

    initialsUser.value = getInitials(firstName.value + " " + lastName.value);
    displayName.value = firstName.value + " " + lastName.value;
    firebase.auth().currentUser?.updateProfile({
      displayName: displayName.value,
    });
    console.log(initialsUser.value);

    const pushToLanding = () => {
      router.push({ name: "landing" });
    };

    pushToLanding();
    return;
  }
  errorCheck.value = true;
  errorMsg.value = "Please fill out all the fields correctly!";
  return;
};
</script>

<template>
  <div class="form-wrap">
    <img src="../assets/logos/logo.svg" alt="" />
    <div class="inputs">
      <div class="register-title">Register an account</div>
      <div class="input">
        <input
          type="text"
          placeholder="First Name"
          v-model="firstName"
          @focus="closeError"
        />
        <nameSVG class="icon" />
      </div>

      <div class="input">
        <input
          type="text"
          placeholder="Last Name"
          v-model="lastName"
          @focus="closeError"
        />
        <userSVG class="icon" />
      </div>

      <div class="input">
        <input
          type="text"
          placeholder="Username"
          v-model="user"
          @focus="closeError"
        />
        <userSVG class="icon" />
      </div>

      <div class="input">
        <input
          type="text"
          placeholder="Email"
          v-model="email"
          @focus="closeError"
        />
        <emailSVG class="icon" />
      </div>

      <div class="input">
        <input
          type="password"
          placeholder="Password"
          v-model="password"
          @focus="closeError"
        />
        <passwordSVG class="icon" />
      </div>
      <div class="buttons">
        <input type="button" value="Register" @click.prevent="register" />
      </div>
      <div class="error" v-if="errorCheck">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@media (min-width: 1024px) {
  .form-wrap {
    font-family: Chango;
    color: var(--color-nav-txt);
    font-size: 1rem;
    position: relative;
    left: 0;
    margin: auto;
    height: 100vh;
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    padding: 10px;
    gap: 50px;
    position: relative;

    img {
      width: 200px;
    }
    .inputs {
      background-color: var(--color-nav-bg) !important;
      border-radius: 20px;
      width: 50%;
      height: 350px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 15px;
      position: relative;

      .input {
        position: relative;
        border-color: var(--vt-c-nav-text-bg-hover);
        width: 60%;
        border-width: 2px;
        border-style: default;
        border-radius: 5px;
        transition: width 0.1s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          position: absolute;
          width: 30px;
          height: 20px;
          stroke-width: 2px;
          fill: var(--color-nav-txt);
          z-index: 0;
          pointer-events: none;
          transition: all 0.2s ease-in-out;
          left: -25px;
          bottom:0;
        }
        input {
          font-family: Chango;
          font-size: 0.8rem;
          padding: 0 0 0 20px;
          width: 100%;
          height: 30px;
          background: transparent;
          border-style: none;
          border-bottom: solid var(--color-nav-txt);
          outline: none;
          transition: border-bottom 0.1s ease-in-out, width 0.1s ease-in;
          caret-color: var(--color-nav-txt);
        }
        input:active {
          border-style: none;
          border-bottom: solid rgba(0, 70, 88, 0.192);
        }
        input:focus {
          border-style: none;
          border-bottom: solid rgba(0, 70, 88, 0.192);
        }
        input:focus + .icon {
          opacity:0;
        }
      }
      input,
      select,
      textarea {
        color: var(--color-nav-txt);
      }

      input::placeholder {
        color: rgba(178, 200, 224, 0.575);
        font-weight: Light;
        font-family: Chango;
      }
      input:focus::placeholder {
        outline: none;
        color: transparent;
      }

      .buttons {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 100%;
        gap: 10px;

        display: flex;
        justify-content: center;
        margin: 5px;
        overflow: visible;
        text-decoration: none;

        input[type="button"] {
          overflow: visible;
          padding: 0 0;
          width: 50%;
          font-family: Chango;
          font-size: 16px;
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
      }
      .error {
        position: absolute;
        height: 60px;
        bottom: 0px;
      }
    }
  }
}
</style>
