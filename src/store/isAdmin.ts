import { defineStore } from "pinia";
import { ref } from "vue";

export const  isAdmin = defineStore("isAdmin", () => {
    
    const state = ref()

const adminTrue = () => {
    state.value = 'admin'
}

const adminFalse = () => {
    state.value = 'regular'
}

    return { state, adminTrue, adminFalse }
})