<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted, onUpdated } from "vue";
import { useRoute } from "vue-router";
import moment from "moment";
import $ from "jquery";
import "jquery";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import SideBar from "@/components/PostSideBar.vue";
import { signedIn } from "@/store/signedIn"
import differenceBy from "lodash/differenceBy";

const signedInCheck = signedIn()


const route = useRoute();
const colRef = firebase.firestore().collection("blogposts");
const isLoading = ref(true);

const blogPosts = ref([]) as any;
const sidebar = ref();
const postSlug = ref(route.params.blogSlug) as any;

const postTitle = ref();
const postAuthor = ref();
const postDate = ref();
const postContent = ref();
const coverImage = ref();
const postCategory = ref([]) as any;
const singlePost = ref([]) as any;


postSlug.value = route.params.blogSlug;

async function fetchData() {
  isLoading.value = true;

  colRef
    .get()
    .then((querySnapshot) =>
      querySnapshot.forEach((post) => {
        const check1 = post.data();
        blogPosts.value.push(check1);
      })
    )
    .then(() => {
      singlePost.value = blogPosts.value.filter(
        (item) => item.postID === postSlug.value
      );

      postTitle.value = singlePost.value[0].postTitle;
      postAuthor.value = singlePost.value[0].postAuthor;
      postDate.value = moment(
        new Date(singlePost.value[0].postDate.toDate())
      ).format("MMM, DD\xa0\xa0\xa0HH:mm");
      postContent.value = singlePost.value[0].postContent;
      coverImage.value = singlePost.value[0].coverImage;
      postCategory.value = singlePost.value[0].postCategory[0];
    })
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    });
}

watch(
  () => route.params.blogSlug,
  () => {
    postSlug.value = route.params.blogSlug;
    blogPosts.value = [];
    fetchData();
  }
);
const scrollTopp = ref();

function logScroll() {
  console.log(sidebar.value.sidebar)
  const sidebar2 = sidebar.value.sidebar;
  scrollTopp.value = $(window).scrollTop();
  const toBottom =
    window.innerHeight + Math.round(window.scrollY) >=
    document.body.offsetHeight;

  if (!toBottom && scrollTopp.value >= 280) {
    sidebar2.style.transition = "all 0.3s ease-in-out";

    sidebar2.style.top = scrollTopp.value + 200 + "px";
  } else if (!toBottom && scrollTopp.value < 400) {
    sidebar2.style.position = "absolute";
    sidebar2.style.top = "400px";
  } else if (toBottom) {
    sidebar2.style.top = scrollTopp.value + 110 + "px";
  }
}


onMounted(() => {
  fetchData();
  window.addEventListener("scroll", logScroll);

  var docRef = firebase.firestore().collection("blogposts").doc(postSlug.value);

  const currentTime = new Date();

  //SETTING ANALYTICS DATA


  docRef.get().then((viewcount) => {




    const viewCount = ref();


    if (signedInCheck.state) {
      var userStore = firebase.firestore().collection("users").doc(firebase.auth().currentUser!.uid);

      userStore.get().then((user) => {
        var readInitial = user.data()!.readBlog
        const newReadArray = ref([]) as any
        if (readInitial !== undefined && readInitial.length !== 0) {


          if (readInitial.includes(postSlug.value)) {
            console.log("already read")
          } else {
            readInitial.forEach((value) => {
              var readInitial = user.data()!.readBlog;

              newReadArray.value = readInitial

              newReadArray.value.push(postSlug.value)
              console.log("newarray" + " " + newReadArray.value)
              userStore.update({ readBlog: newReadArray.value })
            })
          }


          // userStore.update({ readBlog: finalReadArray })
        } else if (readInitial === undefined) {
          userStore.update({ readBlog: [postSlug.value] })

        } else if (readInitial.length === 0) {
          userStore.update({ readBlog: [postSlug.value] })

        }

      })


    }


    if (localStorage.getItem(postSlug.value) === undefined) {
      localStorage.setItem(postSlug.value, new Date().valueOf().toString());
    } else {
      var lastWatched = new Date(+localStorage.getItem(postSlug.value)!);

      var timeDiff = Math.round(
        (currentTime.getTime() - lastWatched.getTime()) / 60000
      );
      if (timeDiff > 1440) {
        if (isNaN(viewcount.data()!.viewCount)) {
          viewCount.value = 1;
        } else {
          viewCount.value = viewcount.data()!.viewCount + 1;
        }
        localStorage.setItem(postSlug.value, new Date().valueOf().toString());
        docRef.update({ viewCount: viewCount.value });
      }
    }
  });
});

watch(() => route.params.blogSlug, () => {
  postSlug.value = route.params.blogSlug

  const newReadArray = ref([]) as any
  if (signedInCheck.state) {
    var userStore = firebase.firestore().collection("users").doc(firebase.auth().currentUser!.uid);
    userStore.get().then((user) => {

      var readInitial = user.data()!.readBlog;
      console.log("read initial" + " " + readInitial)
      if (readInitial !== undefined) {

        if (readInitial.includes(postSlug.value)) {
          console.log("already read")
        } else {
          var readInitial = user.data()!.readBlog;

          newReadArray.value = readInitial

          newReadArray.value.push(postSlug.value)
          console.log("newarray" + " " + newReadArray.value)
          userStore.update({ readBlog: newReadArray.value })


        }


        // userStore.update({ readBlog: finalReadArray })
      } else {
        userStore.update({ readBlog: [postSlug.value] })

      }
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", logScroll);
});
</script>

<template>
  <TransitionGroup name="fade">
    <div v-if="!isLoading" class="posts-wrapper">
      <div class="blogpost-wrapper" ref="postWrapper">
        <div class="post-title">
          {{ postTitle }}
          <div class="post-category">
            {{ postCategory }}
          </div>
        </div>
        <div class="post-date">{{ postDate }}</div>
        <div class="post-author">{{ postAuthor }}</div>
        <img :src="coverImage" alt="" />
        <div class="post-content" v-html="postContent"></div>
      </div>
      <SideBar ref="sidebar" class="sidebar" :Posts="blogPosts" :Slug="postSlug" />
    </div>
  </TransitionGroup>
</template>

<style scoped lang="scss">
.posts-wrapper {
  position: relative;
  height: calc(100% - 70px);
  padding-top: 70px;
  width: 100%;
  padding-left: 40px;

  .blogpost-wrapper {
    right: 0;
    left: 0;
    margin: auto;
    margin-top: 30px;
    width: 60%;
    color: var(--color-nav-bg);

    .post-title {
      font-family: Roboto Condensed;
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between;
      font-size: 5rem;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .post-category {
        font-size: 1rem;
        padding: 5px;
        background-color: var(--color-nav-bg);
        color: var(--color-nav-txt);
        border-radius: 10px;
      }

      .cover-image {
        width: 100%;

        img {
          margin-left: 200px;
          width: 200px;
        }
      }
    }

    .post-date {
      font-family: Nunito;
      font-weight: 900;
      font-size: 1.2rem;
      margin-top: 10px;
    }

    .post-author {
      font-family: Nunito;
      font-weight: 900;
      font-size: 1rem;
      font-style: italic;
    }

    .post-content {
      display: flex;
      font-family: Roboto;
      font-weight: 900;
      font-size: 1.3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-top: 30px;

      :deep(span) {
        color: var(--color-nav-bg) !important;
      }

      :deep(p:has(img)) {
        margin: 10px 0;
        width: 300px;
      }

      :deep(p:has(+ img)) {
        background-color: red;
      }

      :deep(img) {
        position: relative;
        transition: scale 0.2s ease-in-out;
        z-index: 3;
        transform-origin: 2rem;
      }

      :deep(img):hover {
        position: relative;
        transform-origin: 2rem;
        scale: 1.1;
      }

      :deep(p) {
        margin: 10px 0;
      }

      :deep(figcaption) {
        margin: 10px 0 30px 0;
      }

      :deep(img) {
        background-color: red;
        border-radius: 20px;
        box-shadow: 5px 2px 5px 2px rgba(black, 0.2);
      }

      :deep(blockquote) {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 20px;
        transition: all 0.3s ease-in-out;
        will-change: scale;
        padding: 10px 20px;
        width: 70%;
        box-shadow: 3px 2px 3px 1px rgba(black, 0.2);
      }

      :deep(blockquote):hover {
        scale: 105%;
      }

      :deep(blockquote) {
        quotes: string;
        font-size: 1.5em;
        font-style: italic;
      }

      :deep(blockquote)::before {
        content: open-quote;
      }

      :deep(blockquote)::after {
        content: close-quote;
      }
    }
  }
}

.sidebar {
  position: absolute;
  right: 0;
  top: 400px;
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20vh);
}
</style>
