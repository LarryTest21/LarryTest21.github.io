import { defineStore } from "pinia";
import { ref } from "vue";

export const userClicked = defineStore("userClicked", () => {

  const state = ref();

  const changeUCTrue = () => {
    state.value = true;
  };

  const changeUCFalse = () => {
    state.value = false;
  };

  return { state, changeUCFalse, changeUCTrue };
});
