<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUpdated } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import moment from "moment";
import $ from "jquery";
import "jquery";
import Cosmic from "cosmicjs";

const route = useRoute();
/* 
const postsUrl = "http://localhost/wordpress/wp-json/wp/v2/posts";
const queryOptions = reactive({
  slug: route.params.blogSlug,
  _embed: true,
}); */
const post = ref<any>({});
const isLoading = ref(false);
const latestPosts = ref<any>({});

const api = Cosmic();

const bucket = api.bucket({
  slug: "c27229f0-9018-11ed-b853-65fa50acc7e7",
  read_key: "VLZQGABHjrhQj4iMYuvEXEfPRHZPnWt5CACFaIJB68PeteSwVX",
});

async function fetchData() {
  isLoading.value = true;
  const data = await bucket.objects
    .find({
      type: "posts",
      slug: route.params.blogSlug,
    })
    .props("slug,title,content,metadata"); // Limit the API response data by props
  console.log(route.params.blogSlug);
  post.value = data.objects;
  isLoading.value = false;
  console.log(post);
}

async function fetchDataSideBar() {
  const data = await bucket.objects
    .find({
      type: "posts",
    })
    .props("slug,title,content,metadata")
    .limit(3); // Limit the API response data by props
  console.log(data);

  const sidebarPosts = data;
  latestPosts.value = data.objects;
  console.log(sidebarPosts);
}

/* 
const getPost = () => {
  isLoading.value = true;
  axios
    .get(postsUrl, { params: queryOptions })
    .then((response) => {
      post.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      isLoading.value = false;
    });
};

const latestPostsAPI = "http://localhost/wordpress/wp-json/wp/v2/posts";
const latestPosts = ref([] as any);
 */
/* const errorCaughtLatest = ref(false);

var queryOptionsLatest = {
  _embed: true,
  per_page: 3,
}; */
/* 
const getLatest = () => {
  axios
    .get(latestPostsAPI, { params: queryOptionsLatest })
    .then((response) => {
      latestPosts.value = response.data;
    })
    .catch((error) => {
      if (error) {
        errorCaughtLatest.value = true;
      }
    });
}; */

/* getPost();
getLatest(); */

fetchData();
fetchDataSideBar();

watch(
  () => route.params.blogSlug,
  () => {
    route.params.blogSlug = route.params.blogSlug;
    /*  getPost(); */
    fetchData();
  }
);
</script>

<template>
  <div v-if="!isLoading" class="post-wrapper">
    <div class="wrapper">
      <div class="post-title">{{ post[0].title }}</div>
      <div class="post-date">
        {{ moment(post[0].date).format("MMMM Do YYYY, h:mm, dddd") }}
      </div>
      <div class="post-author">{{ post[0].metadata.author?.title }}</div>

      <div class="post-content" v-html="post[0].content"></div>
    </div>
  </div>
  <div class="side-container">
    <div class="side-wrapper">
      <ul v-if="!isLoading" class="blog-posts-ul" v-for="latest in latestPosts">
        <div class="posts-card">
          <a
            ><router-link
              :to="/blog/ + latest.slug"
              key="latest.id"
              class="posts-permalink"
            >
            </router-link
          ></a>
          <img
            v-if="latest.metadata.hero.url != 0"
            class="posts-featuredimage"
            :src="latest.metadata.image?.imgix_url"
            :alt="latest.title"
          />
          <img v-else src="@/assets/logos/favicon-big.png" />
          <div class="posts-text">
            <div class="posts-title">{{ latest.title }}</div>
            <div class="posts-date">
              <p>{{ moment(latest.date).fromNow() + " " + "ago" }}</p>
            </div>
            <div class="posts-author">
              {{ latest.metadata.author?.title }}
            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.post-wrapper {
  height: 100%;
  width: 80%;
  padding-left: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .wrapper {
    padding-top: 100px;
    width: 60%;
    height: 100%;
    .post-title {
      font-family: Roboto Condensed;
      font-size: 5rem;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0;
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
    }
    .post-content {
      font-family: Roboto;
      font-weight: 900;
      font-size: 1.3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;

      :deep(p:has(img)) {
        margin: 10px 0;
        align-self: center;
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

      :deep(figcaption) {
        margin: 10px 0 30px 0;
      }
      :deep(img) {
        background-color: red;
        border-radius: 20px;
        box-shadow: 10px 10px 10px 2px rgba(black, 0.4);
      }

      :deep(blockquote) {
        background: rgba(0, 0, 0, 0.1);
        background-size: 400% 400%;
        border-radius: 20px;
        transition: all 0.3s ease-in-out;
        will-change: scale;
        margin: 30px 0;
      }
      :deep(blockquote):hover {
        scale: 105%;
      }
      :deep(blockquote > p) {
        quotes: string;
        font-size: 2.5rem;
        font-style: italic;
        font-weight: 700;
        padding: 10px;
      }
      :deep(blockquote > p)::before {
        content: open-quote;
      }
      :deep(blockquote > p)::after {
        content: close-quote;
      }
      :deep(p:has(> .fr-img-caption)) {
        width: 50%;
        .fr-img-caption {
          width: 100%;
          span {
            width: 100%, img {
              height: 100%;
              margin: 30px 0;
            }
          }
        }
      }
    }
  }
}

.side-container {
  position:-webkit-sticky;
  position: sticky;
  top:0;
  right:0;
  .side-wrapper::before {
    position: absolute;
    content: "";
    height: 100%;
    left: 20px;
    width: 10px;
    background-color: var(--color-text);
    border-radius: 20px;
  }
  .side-wrapper {
    position: relative;
    .blog-posts-ul {
      display: flex;

      .posts-card {
        height: 100px;
        width: 280px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin: 15px 0;

        a {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        img {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 10px;
        }
        .posts-text {
          line-height: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;

          .posts-title {
            font-size: 1rem;
            font-weight: 600;
          }
          .posts-date {
            font-size: 0.8rem;
          }
          .posts-author {
            font-size: 0.7rem;
          }
        }
      }
    }
  }
}
</style>
