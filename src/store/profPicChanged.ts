import { defineStore } from "pinia";
import { ref } from "vue";

export const profPicChanged = defineStore("profPicChanged", () => {
    
  const state = ref(false);

  const PFCTrue = () => {
    state.value = true;
  };

  const PFCFalse = () => {
    state.value = false;
  };

  return { state, PFCTrue, PFCFalse };
});
