import { ref } from "vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import VueMultiselect from "vue-multiselect";

import App from "./App.vue";
import router from "./router";
import VueClickAway from "vue3-click-away";

import "./assets/main.css";
import { onAuthStateChanged } from "firebase/auth";

import VueGtag from "vue-gtag-next";

const pinia = createPinia();
const app = createApp(App);

app.use(VueGtag, {
  property: {
    id: "G-HEP332VST4"
  }
});
app.component("VueMultiselect", VueMultiselect);



app.directive("visible", function (el, binding) {
  el.style.visibility = !!binding.value ? "visible" : "hidden";
});



app.use(pinia);

app.use(router);
app.use(VueClickAway);
app.mount("body");
