import { defineStore } from "pinia";
import { ref } from "vue";

export const  postLoaded = defineStore("postLoaded", () => {
    
    const state = ref(false)

const postStateTrue = () => {
    state.value = true
}

const postStateFalse = () => {
    state.value = false
}

    return { state, postStateTrue, postStateFalse }
})