<script setup lang="ts">
import { ref, watch } from "vue";

const selected = ref();

const emit = defineEmits(["selected", "search"]);


const clickBlog = (e) => {
  var text = e.target.textContent;
  selected.value = text;
  emit("selected", text);
};

const noSelected = () => {
  if (selected.value != null) {
    selected.value = null;
    emit("selected", null);
  }
};


</script>

<template>
  <div class="sidebar-wrapper" v-click-away="noSelected">
    <ul class="categories">
      <span>Categories</span>
      <li @click="clickBlog" tabindex="0">Blog</li>
      <li @click="clickBlog" tabindex="1">Tournament</li>
      <li @click="clickBlog" tabindex="2">Cup</li>
      <li @click="clickBlog" tabindex="3">General</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-wrapper {
  font-family: Chango;
  font-size: 1.1rem;
  position: relative;
  z-index: 2;
  .searchIcon {
    height: 50px;
    width: auto;
    fill: var(--color-nav-bg);
    cursor: pointer;
  }
  .categories {
    list-style: none;
    display: flex;
    list-style-type: none;
    flex-direction: column;
    background-color: transparent;
    padding-left: 0;

    span {
      padding: 10px;
      background-color: var(--color-nav-bg);
      color: var(--color-nav-txt);
      border-radius: 0 10px 10px 0;
    }
    li:first-child {
      margin-top: 20px;
    }
    li {
      text-decoration: none !important;
      padding: 10px;
      border-radius: 0 10px 10px 0;
    }

    li:hover,
    li:focus {
      text-decoration: none !important;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      background-color: var(--color-nav-bg);
      color: var(--color-nav-txt);
    }
  }
}
</style>
