<template>
  <div class="landing">
    <h1>This is landing page</h1>
  </div>
</template>

<style lang="scss">
@media (min-width: 1024px) {
  .landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

  }

}
</style>

<script setup lang="ts">
import { RouterLink, RouterView, onBeforeRouteLeave } from "vue-router";


</script>
