<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
</script>
<template>
  <div class="container">
    <div class="contact">
      <h1>This is contact page</h1>
    </div>
    <div class="hello">
      <VueDatePicker hide-input-icon uid="demo" />
    </div>
  </div>
</template>

<style lang="scss">
@media (min-width: 1024px) {
  .container {
    position: relative;
    height: 100vh;
    width: 100%;
    display: flex;
    top:100px;
    justify-content: center;
    align-items: flex-start;

    .contact {
      position: relative;

    }
    .hello {
      position: relative;
    }
  }
}
</style>
