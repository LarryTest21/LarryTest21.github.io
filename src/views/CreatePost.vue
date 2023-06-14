<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import $ from "jquery";
import DownIcon from "@/components/icons/down.vue";
import { QuillEditor } from "@vueup/vue-quill";
import "firebase/auth";
import "@vuepic/vue-datepicker/dist/main.css";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Side from "@/components/CreatePostSide.vue";
import Preview from "@/components/CreatePostPreview.vue";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";
import Dialogue from "@/components/SavedPostDialogue.vue";

const saveShowButton = ref(false);

const postContent = ref();
const postContentShow = ref(false);

window.addEventListener("keydown", (e) => {});

const postTitle = ref();
const postTitleShow = ref(false);

const savedDialogue = ref(false);

const downIcon = ref() as any;

const side = ref();
const showPreview = ref(false);
const quillEditor = ref() as any;
const showDownIcon = ref() as any;

const doOnce = ref(false);

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  [{ align: [] }],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, false] }],
  ["link", "image", "video"], // add's image support
  [{ color: [] }], // dropdown with defaults from theme

  ["clean"],
];

const onShowPostPreview = () => {
  showPreview.value = false;
};
const onShowPostPreviewTrue = () => {
  showPreview.value = true;
};
const postDate = ref();
const postDateFn = function (params) {
  postDate.value = params;
};
const postContentFn = function (params) {
  postContent.value = params;
};
const postTitleFn = function (params) {
  postTitle.value = params;
};

const loadSavedSide = ref(false);

const dialogueYes = () => {
  checkSavedPost.value = true;

  savedDialogue.value = false;
};

const dialogueNo = () => {
  savedDialogue.value = false;
};
const dialogueDelete = async() => {

  const firebaseAuth = firebase.auth().currentUser;
  const dataBase = db.collection("users").doc(firebaseAuth?.uid);
  await dataBase
    .update({
      savedPost: {},
    })
    .catch((error) => {
      error.value = true;
    });
  savedDialogue.value = false;
};

//GETTING AUTHOR NAME
const postAuthor = ref();
const checkSavedPost = ref(false);

firebase.auth().onAuthStateChanged((user) => {
  const userData = ref();

  const dataBase = db.collection("users").doc(firebase.auth().currentUser?.uid);
  dataBase
    .get()
    .then((doc) => {
      userData.value = doc.data();
    })

    .then(() => {
      postAuthor.value =
        userData.value.firstName + "" + userData.value.lastName;
    });

  const savedPost = ref();

  if (user) {
    const dataBase = db
      .collection("users")
      .doc(firebase.auth().currentUser?.uid);
    dataBase
      .get()
      .then((doc) => {
        userData.value = doc.data();
      })

      .then(() => {
        savedPost.value = userData.value.savedPost;
        console.log(checkSavedPost.value);

        if (Object.keys(savedPost.value).length !== 0) {

          savedDialogue.value = true;
        } else if (Object.keys(savedPost.value).length === 0) {

        }
      });
  }
});
onMounted(() => {
  quillEditor.value = document.querySelector(".ql-editor");
  window.addEventListener("keydown", (e) => {
    document.querySelector("blockquote")?.classList.add("blockquote");
    if (quillEditor.value.scrollHeight > quillEditor.value.clientHeight) {
      showDownIcon.value = true;

      if (showDownIcon.value && doOnce.value) {
        doOnce.value = false;
      }
    }

    if (postContent.value == undefined || postContent.value == "<p><br></p>") {
      postContentShow.value = false;
    } else {
      postContentShow.value = true;
    }
    if (!postContentShow.value && !postTitleShow.value) {
      saveShowButton.value = false;
    } else {
      saveShowButton.value = true;
    }

    if (postTitle.value == undefined || postTitle.value == "") {
      postTitleShow.value = false;
    } else {
      postTitleShow.value = true;
    }
    if (!postContentShow.value && !postTitleShow.value) {
      saveShowButton.value = false;
    } else {
      saveShowButton.value = true;
    }
  });

  $(".ql-editor").scroll(function () {
    var el = document.querySelector(".ql-editor");
    if (Math.abs(el!.scrollHeight - el!.scrollTop - el!.clientHeight) < 5) {
      doOnce.value = false;
      console.log("at the bottom");
    } else {
      doOnce.value = true;
    }
  });
});
</script>

<template>
  <div class="createpost-wrapper">
    <transition name="savedDialogue">
      <Dialogue
        v-if="savedDialogue"
        @button-yes="dialogueYes"
        @button-no="dialogueNo"
        @button-delete="dialogueDelete"
      />
    </transition>
    <transition name="preview">
      <Preview
        v-if="showPreview"
        @showPreview="onShowPostPreview"
        :postTitle="postTitle"
        :postContent="postContent"
        :postDate="postDate"
        :postAuthor="postAuthor"
      />
    </transition>

    <div class="container">
      <div class="post-editor" id="editor">
        <div class="blog-title-wrapper">
          <label class="blog-title">Title</label>
          <input type="text" v-model="postTitle" />
        </div>
        <div class="editor-wrapper">
          <div class="editor">
            <transition name="downIcon">
              <DownIcon class="downIcon" ref="downIcon" v-show="doOnce" />
            </transition>
            <QuillEditor
              v-model:content="postContent"
              contentType="html"
              :toolbar="toolbarOptions"
            />
          </div>
        </div>
      </div>
      <Side
        ref="side"
        :saveShow="saveShowButton"
        :postTitle="postTitle"
        :postContent="postContent"
        :postAuthor="postAuthor"
        :loadSaved="loadSavedSide"
        :postDate="new Date(postDate)"
        :checkSavedPost="checkSavedPost"
        @showPreview="onShowPostPreviewTrue"
        @postDate="postDateFn"
        @post-content="postContentFn"
        @post-title="postTitleFn"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
*::-webkit-scrollbar {
  width: 12px;
}

*::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: var(--color-nav-bg);
  cursor: pointer;
}

.createpost-wrapper {
  position: relative;
  height: 100vh;
  .container {
    height: calc(100vh - 70px);
    padding: 20px;
    top: 70px;
    position: relative;
    display: flex;
    justify-content: center;
    gap: 10px;
    overflow: visible;

    .post-editor {
      position: relative;
      overflow: visible;
      height: 100%;
      width: 1024px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      label {
        width: 120px;
        font-family: Chango;
        padding: 7px;
        background-color: #d1d5db;
        color: var(--color-nav-txt);
        display: block;
        border-bottom: solid 2px rgba(0, 0, 0, 0.2);
        border-radius: 10px 10px 0 0;
      }
      .blog-title-wrapper {
        width: 50%;
        height: 90px;
        display: flex;
        flex-direction: column;
        border-radius: 10px;
        overflow: hidden;

        input {
          width: 100%;
          height: 100%;
          padding: 10px;
          outline: none;
          font-weight: 500;
          font-family: Roboto;
          font-size: 1rem;
          color: var(--color-nav-txt);
          background-color: var(--color-nav-bg);
          border-style: none;
          border-radius: 0 10px;
        }

        input:focus {
          color: var(--color-nav-txt);
        }
      }

      .editor-wrapper {
        overflow-y: auto;
        height: 100%;
        width: 100%;
        .editor {
          position: relative;
          display: flex;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          height: 100%;
          left: 0;
          right: 0;
          .downIcon {
            width: 70px;
            height: 70px;
            fill: var(--color-nav-txt);
            position: absolute;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            z-index: 2;
            transform: rotate(90deg);
            right: 0;
            left: 0;
            bottom: 30px;
            margin: auto;
          }
        }
      }
    }
  }
}

.downIcon-enter-active,
.downIcon-leave-active {
  transition: all 0.2s ease-out;
  max-height: 100%;
  opacity: 1;
}

.downIcon-enter-from,
.downIcon-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-out;
  opacity: 1;
}

.fade-enter-from,
.fade-leave-to {
  transition: all 0.4s ease-out;
  opacity: 0;
  max-height: 0%;
}

.preview-enter-active,
.preview-leave-active {
  transition: all 0.2s ease-out;
  opacity: 1;
  max-height: 100%;
}

.preview-enter-from,
.preview-leave-to {
  transition: all 0.4s ease-out;
  opacity: 0;
  max-height: 0;
}
.savedDialogue-enter-active,
.savedDialogue-leave-active {
  max-height: 160px;
  transition: all 0.8s ease-in-out;
}

.savedDialogue-enter-from,
.savedDialogue-leave-to {
  overflow: hidden;
  max-height: 0px;
}
</style>
