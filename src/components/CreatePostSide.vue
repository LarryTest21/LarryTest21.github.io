<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import $ from "jquery";
import firebase from "firebase/compat/app";
import {
  getStorage,
  ref as storageFBRef,
  uploadBytesResumable,
} from "firebase/storage";

import db from "../firebase/firebaseInit";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import Modal from "@/components/Modal.vue";
import { updateCurrentUser } from "firebase/auth";

const props = defineProps({
  saveShow: Boolean,
  postTitle: String,
  postContent: String,
  postAuthor: String,
  loadSaved: Boolean,
  postExcerpt: String,
  postDate: Date,
  checkSavedPost: Boolean,
});

const emit = defineEmits([
  "showPreview",
  "postDate",
  "postContent",
  "postTitle",
  "changedImage",
]);
const checkSavedPost = computed(() => props.checkSavedPost);
const saveShow = computed(() => props.saveShow);
const saveShow2 = ref(false);

const date = ref(new Date()) as any;

const postDate = ref();

emit("postDate", date);

const showPreview = () => {
  emit("showPreview", true);
};

watch(date, () => {
  emit("postDate", date);
});

const postAuthor = ref();

var postContent = ref(props.postContent);
const postTitle = ref();

window.addEventListener("keydown", (e) => {
  postTitle.value = props.postTitle;
  console.log(postTitle.value);
});

const datePicker = ref();
const fileUpload = ref() as any;
const coverFile = ref() as any;
const rawImg2 = ref();

const excerpt = ref();
const characterCounter = ref("70 characters left");
const characterCounterRef = ref() as any;
const showCoverPreview = ref();

const error = ref(false);
const errorMsg = ref("");

const changedImage = ref(false);
watch(changedImage, () => {
  console.log(changedImage.value);
  emit("changedImage", true);
});

const modalActive = ref(false);

const onFileClick = (e) => {
  e.target.value = null;
};

const onFileSelect = (e) => {
  coverFile.value = e.target.files[0];
  changedImage.value = true;
  saveShow2.value = true;
  const mime_type = ref();
  mime_type.value = coverFile.value.type;
  const validImageTypes = ["image/jpeg", "image/png"];

  if (validImageTypes.includes(mime_type.value)) {
    if (typeof FileReader === "function") {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (coverFile.value) {
          coverFile.value.replace(event.target?.result);
        }
        coverFile.value = event.target?.result;
      };

      reader.readAsDataURL(coverFile.value);

      reader.onload = () => {
        rawImg2.value = reader.result;
        showCoverPreview.value = true;
      };
    } else {
      alert("Sorry, FileReader API not supported");
    }
  } else {
    alert("Select an image file (png or jpeg)");
  }
};

const btnClose = (e) => {
  fileUpload.value = "";
  showCoverPreview.value = false;
  saveShow2.value = true;
  rawImg2.value = null;
};
const savedObj = ref({});

const loadSaved = computed(() => props.loadSaved);

watch(loadSaved, () => {
  console.log("loadsaved changed");
  if (loadSaved.value) {
    console.log("excerpt reading" + " " + loadSaved.value);
    var savedPost = localStorage.getItem("savedPost") as string;
    var parsedSaved = JSON.parse(savedPost);

    date.value = parsedSaved.postDate;
  }
});

const savePost = () => {
  modalActive.value = true;
  const firebaseAuth = firebase.auth().currentUser;
  const dataBase = db.collection("users").doc(firebaseAuth?.uid);

  savedObj.value = {
    postTitle: props.postTitle || null,
    postDate: date.value.toString(),
    postAuthor: props.postAuthor,
    postContent: props.postContent || null,
    postExcerpt: excerpt.value || null,
    coverImage: rawImg2.value || null,
  };
  console.log(savedObj.value);
  dataBase
    .update({
      savedPost: savedObj.value,
    })
    .catch((error) => {
      error.value = true;
      errorMsg.value = error.message;
    })
    .then(() => {
      setTimeout(() => {
        modalActive.value = false;
      }, 300);
    });
};

const uploadPost = async () => {
  if (postTitle.value == undefined) {
    error.value = true;
    errorMsg.value = "Give the post a title";
    alert("no title");
  } else if (
    postContent.value == undefined ||
    postContent.value == "<p><br></p>"
  ) {
    error.value = true;
    errorMsg.value = "Post content can not be empty";
    alert("no content");
  } else {
    const dataBase = db.collection("blogposts").doc(postTitle.value);
    const coverImage = ref();
    if (rawImg2.value == undefined) {
      coverImage.value = null;
    } else {
      coverImage.value = rawImg2.value;
    }
    await dataBase.set({
      coverImage: coverImage.value,
      postDate: date.value,
      postTitle: postTitle.value,
      postContent: postContent.value,
      postExcerpt: excerpt.value,
    });
  }
};

const userData = ref();
const savedPost = ref();

watch(checkSavedPost, () => {
  if (checkSavedPost.value) {
    firebase.auth().onAuthStateChanged((user) => {
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

          if (Object.keys(savedPost.value).length !== 0) {
            emit("postContent", savedPost.value.postContent);
            emit("postTitle", savedPost.value.postTitle);
            excerpt.value = savedPost.value.postExcerpt;
            postDate.value = savedPost.value.postDate;
            date.value = postDate.value;
            if (savedPost.value.coverImage === null) {
            } else {
              rawImg2.value = savedPost.value.coverImage;
              showCoverPreview.value = true;
            }
          }
        });
    });
  }
});

const saveDateButton = () => {
  saveShow2.value = true;
};

onMounted(() => {
  $("textarea").on("input", function () {
    var maxlength = $("textarea").attr("maxlength");
    var currentLength = $("textarea").val().length;

    if (currentLength >= maxlength) {
      console.log("You have reached the maximum number of characters.");
      characterCounter.value = "0 characters left";
      characterCounterRef.value.style.color = "red";
    } else {
      console.log(maxlength - currentLength + " chars left");
      characterCounterRef.value.style.color = "var(--color-nav-txt)";
      characterCounter.value = maxlength - currentLength + " characters left";
    }
  });
});
</script>

<template>
  <transition name="modal">
    <Modal
      v-if="modalActive"
      :modalAnimation="true"
      :modalLoadingMessage="'Saving'"
    />
  </transition>
  <div class="side-container">
    <div class="date-picker">
      <label class="date">Post Date</label>
      <label>{{ postAuthor }}</label>
      <VueDatePicker
        @update:model-value="saveDateButton"
        ref="datePicker"
        v-model="date"
        auto-apply
        hide-input-icon
        show-now-button
        :month-change-on-scroll="true"
        :close-on-auto-apply="true"
        :close-on-clear-value="false"
        :min-date="new Date()"
      >
      </VueDatePicker>
    </div>
    <div class="cover-photo">
      <label>Cover Photo</label>
      <div class="cover-preview-wrapper" value="Preview Cover" key="1">
        <div class="cover-image-wrapper">
          <img :src="rawImg2" alt="" key="2" v-if="showCoverPreview" />
        </div>
        <div
          v-if="showCoverPreview"
          type="button"
          class="btn-close"
          @click.prevent="btnClose"
        />
        <span class="icon-cross"></span>
        <span class="visually-hidden"></span>
      </div>
      <input
        type="button"
        @click="fileUpload.click()"
        class="custom-file-upload"
        value="Select Image"
      />

      <input
        type="file"
        @change="onFileSelect"
        @click="onFileClick"
        name=""
        ref="fileUpload"
        id="file-upload"
        style="display: none"
      />
    </div>
    <div class="excerpt-wrapper">
      <label>Excerpt</label>
      <textarea
        type="text"
        class="excerpt-textarea"
        v-model="excerpt"
        maxlength="70"
        ref="excerptText"
      />
      <div class="excerpt-counter">
        <div
          ref="characterCounterRef"
          v-text="characterCounter"
          class="character-counter"
        />
      </div>
    </div>

    <div class="btns">
      <transition name="save">
        <div class="button-save" :class="{ active: saveShow || saveShow2 }">
          <input type="button" value="Save" @click="savePost" />
        </div>
      </transition>
      <div class="button-preview">
        <input type="button" value="Preview" @click="showPreview" />
      </div>
      <div class="button-upload">
        <input type="button" value="Upload" @click="uploadPost" />
      </div>
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

.side-container input[type="button"] {
  font-family: Chango;
  font-size: 16px;
  border-radius: 18px;
  width: 100%;
  cursor: pointer;
  padding: 10px;
  color: var(--color-nav-txt) !important;
  border-style: none;
  box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.3);
  background-color: var(--color-nav-bg);
  transition: all 0.15s ease-in-out;
}
.side-container input[type="button"]:hover {
  color: var(--color-nav-bg) !important;
  background-color: var(--color-nav-txt);
}
.side-container input[type="button"]:active {
  box-shadow: -1px -1px 1px 0.5px rgba(0, 0, 0, 0.3);
}
.side-container {
  position: relative;
  height: 100%;
  width: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 10px;
  background-color: var(--color-nav-bg);
  border-radius: 15px;
  box-shadow: 2px 2px 5px 3px rgba(0, 0, 0, 0.3);
  font-family: Chango;
  transition: transform 0.3s ease-in-out;
  color: var(--color-nav-txt);

  .date-picker {
    width: 100%;
    display: flex;
    flex-direction: column;
    color: var(--color-nav-txt);
    gap: 3px;
    .date {
      width: 100%;
      margin: 0;
      left: 0;
    }
  }
  .excerpt-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    label {
      margin-bottom: 5px;
      width: 100%;
    }
    textarea {
      width: 100%;
      font-family: Roboto Condensed;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 10px;
      border: solid 2px var(--color-nav-txt);
      background-color: white;
      height: 100px;
      color: var(--color-nav-txt);
      text-align: top;
      resize: none;
      padding: 10px;
    }
    textarea:focus-visible {
      outline: var(--color-nav-txt);
    }
    textarea > div > div:last-child {
      scroll-snap-align: end;
    }
    .excerpt-counter {
      width: 100%;
      display: flex;
      flex-direction: column;
      margin-left: 15px;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.8rem;
    }
  }
  .cover-photo {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 100%;
    .cover-preview-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      .btn-close {
        position: absolute;
        border: 0;
        padding: 0;
        right: 10px;
        top: 10px;
        background: var(--color-nav-txt);
        border-radius: 50%;
        box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.3);
        width: 40px;
        height: 40px;
        border: solid 1px rgba(0, 0, 0, 0.219);
        cursor: pointer;
        transition: all 150ms;

        &:hover {
          box-shadow: 0px 0px 0px 8px rgba(0, 0, 0, 0.5);
        }
        &:focus {
          box-shadow: -0px -0px 0px 0.5px rgba(0, 0, 0, 0.3);
        }
      }

      .btn-close:before,
      .btn-close:after {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 20px;
        background-color: var(--color-nav-bg);
        transform: rotate(45deg) translate(-50%, -50%);
        transform-origin: top left;
        content: "";
      }
      .btn-close:after {
        transform: rotate(-45deg) translate(-50%, -50%);
      }
      .btn-close:after:hover {
        transform: rotate(-90deg) translate(-50%, -50%);
      }

      .cover-image-wrapper {
        height: 120px;
        width: 100%;
        border-radius: 5px;
        border: solid 5px var(--color-nav-txt);
        border-radius: 10px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  .btns {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;
    .button-upload {
      input {
        font-size: 2rem;
        background-color: var(--color-nav-txt) !important;
        color: var(--color-nav-bg) !important;
      }
      input:hover {
        background-color: var(--color-nav-bg) !important;
        color: var(--color-nav-txt) !important;
      }
    }
    .button-save {
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
      input {
        background-color: red;
        color: var(--color-nav-bg) !important;
      }
      input:hover {
        background: rgba(114, 2, 2, 0.8) !important;
      }
    }
    .button-save.active {
      opacity: 1;
    }
  }
}

.save-enter-active,
.save-leave-active {
  transition: all 0.2s ease-out;
  opacity: 1;
}

.save-enter-from,
.save-leave-to {
  transition: all 0.4s ease-out;
  opacity: 0;
}
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
  opacity: 1;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
