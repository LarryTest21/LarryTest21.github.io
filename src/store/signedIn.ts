import { defineStore } from "pinia";
import { ref } from "vue";

export const signedIn = defineStore("signedIn", () => {
    
  const state = ref(false);

  const signedInTrue = () => {
    state.value = true;
  };

  const signedInFalse = () => {
    state.value = false;
  };

  return { state, signedInTrue, signedInFalse };
});
