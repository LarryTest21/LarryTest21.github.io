<script setup lang="ts">
import axios from "axios";
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import moment from "moment";
import Cosmic from "cosmicjs";

const api = Cosmic();
const errorCaught = ref(false);
const bucket = api.bucket({
  slug: "c27229f0-9018-11ed-b853-65fa50acc7e7",
  read_key: "VLZQGABHjrhQj4iMYuvEXEfPRHZPnWt5CACFaIJB68PeteSwVX",
});

const posts = ref([] as any);

async function fetchDataNews() {
  isLoading.value = true;
  const data = await bucket.objects
    .find({
      type: "news",
    })
    .props("slug,title,content,metadata");
  posts.value = data.objects;
  isLoading.value = false;

}

const postsUrl = posts.value;

const isLoading = ref(false);
const postsLoadOk = ref(false);

var queryOptions = {
  _embed: true,
};

const getNews = () => {
  isLoading.value = true;

  axios
    .get(postsUrl, { params: queryOptions })
    .then((response) => {
      posts.value = response.data;
    })
    .then(() => {
      isLoading.value = false;
      console.log(isLoading.value);
    })
    .catch((error) => {
      if (error) {
        isLoading.value = false;
        errorCaught.value = true;
      }
    })
    .then(() => {
      postsLoadOk.value = true;
    });
};

onMounted(async () => {
  getNews();
  fetchDataNews();
});
</script>

<template>
  <transition name="fadeLoading">
    <div v-if="isLoading" class="posts-loading">
      <div></div>
    </div>
  </transition>
  <transition name="fadeLoading">
    <div class="errorCaught" v-if="errorCaught">
      There was an error loading news
    </div>
  </transition>
  <div class="news-container">
    <div class="wrapper">
      <div class="news-topper">
        <span>This is the News</span>
      </div>

      <transition-group name="fadeNews">
        <ul v-if="!isLoading" class="news-posts-ul" v-for="post in posts">
          <div class="posts-card">
            <a
              ><router-link
                :to="/news/ + post.slug"
                key="post.id"
                class="posts-permalink"
              >
              </router-link
            ></a>
            <img
              v-if="post.metafield?.thumbnail.imgix_url != 0"
              class="posts-featuredimage"
              :src="post.metadata?.thumbnail?.imgix_url"
              :alt="post.title.rendered"
            />
            <img v-else src="@/assets/logos/favicon-big.png" />
            <div class="posts-date">
              <p>
                {{ moment(post.date).fromNow() + " " + "ago" }}
              </p>
            </div>

            <div class="posts-text">
              <h1 class="posts-title">{{ post.title }}</h1>

              <p class="posts-excerpt">
                {{ post.description }}
              </p>
            </div>
          </div>
        </ul>
      </transition-group>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .posts-loading {
    position: relative;
    top: 70px;
    width: 100%;
    height: calc(100vh - 70px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    div {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      display: inline-block;
      border-top: 10px solid var(--color-nav-bg);
      border-right: 10px solid transparent;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
    div::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      left: 0;
      top: 0;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      border-left: 10px solid var(--color-nav-bg);
      border-bottom: 10px solid transparent;
      animation: rotation 0.5s linear infinite reverse;
    }
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  .errorCaught {
    text-align: center;
    position: relative;
    width: 30%;
    background-color: rgb(146, 14, 14);
    border-width: 10px;
    padding: 10px;
    border-radius: 20px;
    font-size: 2rem;
    font-weight: 900;
    animation: blink 2s infinite;
  }
  @keyframes blink {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .news-container {
    position: relative;
    min-height: 100vh;
    padding-top: 70px;
    width: 100%;

    .wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .news-topper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      span {
        margin: auto;
        background-color: var(--color-nav-bg);
        color: var(--color-nav-txt);
        padding: 0 10px;
        border-radius: 30px;
        font-family: Chango;
        font-size: 4rem;
        font-weight: 400;
        text-align: center;
        margin-bottom: 50px;
      }

      .news-posts-ul {
        margin-left: 80px;
        display: flex;
        flex-direction: column;
        .posts-card {
          margin: 30px 0;
          display: flex;
          gap: 30px;
          align-self: flex-start;

          a {
            position: absolute;
            height: 100%;
            width: 100%;
            z-index: 10;
          }
          a:hover ~ .posts-date {
            transform: translateX(30px);
          }

          a:hover ~ .posts.text {
            transform: translateX(30px);
          }

          img {
            height: 300px;
            width: 500px;
            border-radius: 10px;
            box-shadow: rgba(0, 0, 0, 0.2) 5px 5px 10px 5px;
          }
          .posts-date {
            position: absolute;
            display: inline-block;
            bottom: 0;
            margin: 10px 10px;
            transition: transform 0.08s ease-in-out;
            p {
              color: var(--color-nav-txt);
              background-color: var(--color-nav-bg);
              padding: 0 10px;
              border-radius: 20px;
              display: flex;
              font-size: 1.2rem;
              font-weight: 600;
              font-style: italic;
            }
          }

          .posts-text {
            display: flex;
            flex-direction: column;
            gap: 30px;

            .posts-title {
              font-size: 3rem;
              font-weight: 700;
            }
            .posts-excerpt {
              font-size: 2rem;
            }
          }
        }
      }
    }
  }

  .fadeNews-enter-active,
  .fadeNews-leave-active {
    transition: opacity 0.8s ease-in;
  }
}
</style>
