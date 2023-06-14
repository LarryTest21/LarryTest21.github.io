import { defineStore } from "pinia";
import { ref } from "vue";

export const modalActive = defineStore("modalActive", () => {
    
  const state = ref(false);

  const modalTrue = () => {
    state.value = true;
  };

  const modalFalse = () => {
    state.value = false;
  };

  return { state, modalTrue, modalFalse };
});
