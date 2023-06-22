import { ref } from "vue";
import { createPinia } from "pinia";
import { createApp } from "vue";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import VueMultiselect from 'vue-multiselect'
import "@vuepic/vue-datepicker/dist/main.css";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "cropperjs/dist/cropper.css";

import App from "./App.vue";
import router from "./router";
import VueClickAway from "vue3-click-away";

import "./assets/main.css";
import { onAuthStateChanged } from "firebase/auth";

const pinia = createPinia();
const app = createApp(App);

app.component('VueMultiselect', VueMultiselect);


app.directive('visible', function(el, binding) {
    el.style.visibility = !!binding.value ? 'visible' : 'hidden';
});

app.use(pinia);

app.use(router);
app.use(VueClickAway);

app.mount("body");
