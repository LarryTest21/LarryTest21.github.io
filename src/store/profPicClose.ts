import { defineStore } from "pinia";
import { ref } from "vue";

export const profPicClose = defineStore("profPicClose", () => {
    
  const state = ref(false);

  const profPicOpen = () => {
    state.value = true;
  };

  const profPicClose = () => {
    state.value = false;
  };

  return { state, profPicOpen, profPicClose };
});
