import { defineStore } from "pinia";
import { ref } from "vue";

export const useTheme = defineStore("themeFromNav", () => {

  const state = ref('theme-dark');

  const changeStateLight = () => {
    state.value = 'theme-light';
  };

  const changeStateDark = () => {
    state.value = 'theme-dark';
  };

  return { state, changeStateDark, changeStateLight };
});
