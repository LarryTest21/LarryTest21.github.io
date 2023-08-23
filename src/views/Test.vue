

<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import firebase from "firebase/compat/app";
import db from "../firebase/firebaseInit";
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { storeToRefs } from "pinia";
import { newUser } from "@/store/newUser"

const checkNewUser = newUser()

onMounted(() => {




})

function logout() {
    checkNewUser.state = true;

    const Auth = getAuth()
    let originalUser = Auth.currentUser
    signOut(Auth).then(() => {

        Auth.updateCurrentUser(originalUser)

    }).catch((error) => {
        // An error happened.
    }).then(() => {
        checkNewUser.state = false;

    });



}
</script>

<template>
    <div class="wrapper">
        <div class="inner">
            <input type="button" value="hello" @click="logout" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.wrapper {
    width: 100%;
    height: 100vh;
    padding-top: 70px;

    input[type="button"] {
        font-family: Chango;
        font-size: 16px;
        border-radius: 18px;
        width: 20%;
        height: 100px;
        cursor: pointer;
        padding: 10px;
        color: var(--color-nav-txt) !important;
        border-style: none;
        box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
        background-color: var(--color-nav-bg);
        transition: all 0.15s ease-in-out;
    }

    .inner {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Roboto Condensed;
        font-size: 3rem;
        color: var(--color-nav-txt);

        button {
            width: 100px;
            height: 70px;
            font-size: 2rem;
            border-radius: 20px;
            color: var(--color-nav-txt);
            background-color: white;

        }
    }
}
</style>