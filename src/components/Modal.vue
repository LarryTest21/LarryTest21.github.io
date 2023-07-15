<script setup lang="ts">
import { ref } from "vue";
import { modalActive } from "../store/modalActive";
import { modalButtonActive } from "../store/modalButtonActive";
import { FieldValue } from "firebase/firestore";

const props = defineProps({
  modalButtonShow: Boolean,
  modalAnimation: Boolean,
  loadingScale: Number,
  modalLoadingMessage: String,
  modalButtonMessage: String,
  backgroundOpacity: Number,
});

const closeModal = () => {
  setTimeout(() => {
    const modalActivation = modalActive();
    const { modalFalse } = modalActivation;
    modalFalse();
  }, 1);
};
const modalButton = modalButtonActive();
</script>

<template>
  <div class="modal" @click="closeModal" v-click-away="closeModal">
    <TransitionGroup name="fade">
      <div class="wrapper" key="lorem1">
        <p class="modal-message" key="lorem2" v-if="modalLoadingMessage">
          {{ props.modalLoadingMessage }}
        </p>
        <div
          class="modal-loading"
          key="lorem2"
          v-show="!modalButtonShow && modalAnimation"
        >
          <span class="loader"></span>

          <div class="lds-roller" key="lorem3">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <TransitionGroup name="fade">
      <div class="modal-button" key="lorem">
        <div class="modal-content" v-if="modalButtonShow" key="lorem2">
          <p v-if="modalButton.state" key="lorem3">
            {{ props.modalButtonMessage }}
          </p>
          <button key="lorem4">Close</button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.modal::before {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: var(--color-nav-bg);
  opacity: 0.9;
  opacity: v-bind(backgroundOpacity);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;
}
.modal {
  width: 100%;
  height: 100%;
  top: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-nav-txt) !important;
  display: flex;
  flex-direction: column;
  z-index: 70;
  left: 0;
  font-size: 3rem;
  border-radius: 30px;
  padding: 30px;
  .modal-message {
    position: relative;
    height: 100%;
    width: 100%;
    font-family: Chango;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;

    p {
      top: 0;
      margin: 0;
    }
  }
  .modal-loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 30px;
  }

  .loader {
    scale: v-bind(loadingScale);
    width: 48px;
    height: 48px;
    border-width: 3px;
    border-style: dashed solid solid dotted;
    border-color: var(--color-nav-bg) var(--color-nav-bg) transparent
      var(--color-nav-bg);
    border-radius: 50%;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    animation: rotation 1.5s linear infinite;
  }
  .loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    left: 20px;
    top: 31px;
    border: 10px solid transparent;
    border-right-color: var(--color-nav-bg);
    transform: rotate(-40deg);
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    50% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      transform: rotate(360deg);
      opacity: 0;
    }
  }

  // .lds-roller {
  //   width: 30px;
  //   height: 30px;
  //   scale: v-bind(loadingScale);
  //   transform: translate(-25px, -24px);
  // }
  // .lds-roller div {
  //   animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  //   transform-origin: 40px 40px;
  // }
  // .lds-roller div:after {
  //   content: " ";
  //   display: block;
  //   position: absolute;
  //   width: 7px;
  //   height: 7px;
  //   border-radius: 30%;
  //   background: var(--color-nav-txt);
  // }
  // .lds-roller div:nth-child(1) {
  //   animation-delay: -0.036s;
  // }
  // .lds-roller div:nth-child(1):after {
  //   top: 63px;
  //   left: 63px;
  // }
  // .lds-roller div:nth-child(2) {
  //   animation-delay: -0.072s;
  // }
  // .lds-roller div:nth-child(2):after {
  //   top: 68px;
  //   left: 56px;
  // }
  // .lds-roller div:nth-child(3) {
  //   animation-delay: -0.108s;
  // }
  // .lds-roller div:nth-child(3):after {
  //   top: 71px;
  //   left: 48px;
  // }
  // .lds-roller div:nth-child(4) {
  //   animation-delay: -0.144s;
  // }
  // .lds-roller div:nth-child(4):after {
  //   top: 72px;
  //   left: 40px;
  // }
  // .lds-roller div:nth-child(5) {
  //   animation-delay: -0.18s;
  // }
  // .lds-roller div:nth-child(5):after {
  //   top: 71px;
  //   left: 32px;
  // }
  // .lds-roller div:nth-child(6) {
  //   animation-delay: -0.216s;
  // }
  // .lds-roller div:nth-child(6):after {
  //   top: 68px;
  //   left: 24px;
  // }
  // .lds-roller div:nth-child(7) {
  //   animation-delay: -0.252s;
  // }
  // .lds-roller div:nth-child(7):after {
  //   top: 63px;
  //   left: 17px;
  // }
  // .lds-roller div:nth-child(8) {
  //   animation-delay: -0.288s;
  // }
  // .lds-roller div:nth-child(8):after {
  //   top: 56px;
  //   left: 12px;
  // }
  // @keyframes lds-roller {
  //   0% {
  //     transform: rotate(0deg);
  //     scale: 1;
  //   }

  //   100% {
  //     transform: rotate(360deg);
  //     scale: 1;
  //   }
  // }

  .modal-button {
    width: 100%;
    .modal-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      gap: 30px;

      p {
        font-family: Chango;
        text-align: center;
        color: var(--color-nav-txt);
        font-size: 1.4rem;
      }
      button {
        width: 80%;
        font-family: Chango;
        font-size: 1.5rem;

        border-radius: 18px;
        cursor: pointer;
        height: 50px;
        color: var(--color-nav-txt) !important;
        border-style: none;
        box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
        background-color: var(--color-nav-bg);
        transition: all 0.1s ease-in-out;
      }
      button:hover {
        color: var(--color-nav-bg) !important;
        background-color: var(--color-nav-txt);
      }
      button:active {
        box-shadow: -1px -1px 1px 0.5px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.2s ease-in-out;
    opacity: 1;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
