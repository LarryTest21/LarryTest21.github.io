<script setup lang="ts">
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
</script>
<template>
  <div class="wrapper">
    <div class="not-found-container">
      <div class="not-found">
        <h1>Page cant be found</h1>
      </div>
      <div class="animation-wrapper">
        <h1>404</h1>
      </div>
      <div class="back-wrapper">
        <RouterLink to="/"><li>Go back</li></RouterLink>
        <div class="arrow">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@media (min-width: 1024px) {
  .wrapper {
    position: relative;
    height: 100vh;
    width: 100%;
    .not-found-container {
      position: relative;
      height: calc(100% - 70px);
      top: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: Chango;
      font-size: 2rem;

      .not-found {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .animation-wrapper {
        display: flex;
        justify-content: center;
      }
      .back-wrapper {
        margin-top: 100px;
        position: relative;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        width: 400px;
        a {
          position: relative;
          text-decoration: none;
          list-style-type: none;
        }
        a:-webkit-any-link:active {
          color: var(--color-nav-bg);
        }
        a:visited {
          color: var(--color-nav-bg);
        }

        .arrow {
          position: relative;
          transform: rotate(-90deg);
          left: -20px;
        }

        .arrow span {
          display: block;
          width: 30px;
          height: 30px;
          border-bottom: 5px solid white;
          border-right: 5px solid white;
          transform: rotate(45deg);
          margin: -10px;
          animation: animate 2s infinite;
        }

        .arrow span:nth-child(2) {
          animation-delay: -0.2s;
        }

        .arrow span:nth-child(3) {
          animation-delay: -0.4s;
        }

        @keyframes animate {
          0% {
            opacity: 0;
            transform: rotate(45deg) translate(-20px, -20px);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(45deg) translate(20px, 20px);
          }
        }
      }
    }
  }
}
</style>
