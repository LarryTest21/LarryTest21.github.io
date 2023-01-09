<!-- <script lang="ts">
import { EMPTY_ARR } from "@vue/shared";
import axios from "axios";
import { ref } from "vue";

export default {
  data() {
    return {
      postsUrl: "https://localhost/wordpress/wp-json/wp/v2/news",

      posts: [] as any[],
      isLoading: false,
      regex: /(<([^>]+)>)/gi,
      errorCaught: false,
    };
  },
  methods: {
    getPosts() {
      this.isLoading = true;
      axios
        .get(this.postsUrl, { params: { _embed: true } })
        .then((response) => {
          this.posts = response.data;
          console.log("Pages retrieved!");
          console.log(this.posts);
          this.isLoading = false;
        })
        .catch((error) => {
          console.log(error);
          if (error) {
            this.isLoading = false;
            setTimeout(() => {
              this.errorCaught = true;
            }, 1100);
          }
        });
    },
  },
  mounted() {
    this.getPosts();
  },
};
</script> -->

<script setup lang="ts">
import axios from "axios";
import { ref, reactive } from "vue";
import { onMounted } from "vue";
import moment from "moment";

const postsUrl = "https://localhost/wordpress/wp-json/wp/v2/news";
const posts = ref([] as any);
const postdate = ref([] as any);

const isLoading = ref(false);
const postsLoadOk = ref(false);
const regex = /(<([^>]+)>)/gi;
const errorCaught = ref(false);
var featuredmedia = ref();

var queryOptions = {
  _embed: true,
};

const getPosts = () => {
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
        errorCaught.value = true;
      }
    })

    .then(() => {
      postsLoadOk.value = true;
    });
};

onMounted(async () => {
  getPosts();
});
</script>

<template>
  <div class="news-container">
    <div class="wrapper">
      <div class="news-topper">
        <span>This is the News</span>
          <div v-if="isLoading" class="loading">
            <div>Loading...</div>
          </div>
        <transition name="fadeLoading">
          <div class="errorCaught" v-if="errorCaught">
            There was an error loading news
          </div>
        </transition>
      </div>
      <ul v-if="!isLoading" class="news-posts-ul" v-for="post in posts">
        <div class="posts-card">
          <a
            ><router-link :to="post.slug" key="post.id" class="posts-permalink">
            </router-link
          ></a>
          <img
            class="posts-featuredimage"
            :src="post._embedded['wp:featuredmedia'][0].source_url"
            :alt="post.title.rendered"
          />
          <div class="posts-date">
            <p>
              {{ moment(post.date).fromNow() + " " + "ago" }}
            </p>
          </div>

          <div class="posts-text">
            <h1 class="posts-title">{{ post.title.rendered }}</h1>

            <p class="posts-excerpt">
              {{ post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "") }}
            </p>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media (min-width: 1024px) {
  .news-container {
    position: relative;
    min-height: 100vh;
    padding-top: 70px;
    width: 100%;

    .wrapper {
      margin: 20px 0;
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
      .loading {
        position: relative;
        display: inline-block;
        width: 10%;
        background-color: var(--color-nav-bg);
        color: var(--color-nav-txt);
        border-width: 20px;
        border-radius: 30px;
        font-size: 2rem;
        text-align: center;
        margin-bottom: 10px;
        animation: blink 0.5s infinite;
        div {
          font-family: Nunito;
          font-weight: 900;
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

      span {
        margin: auto;
        background-color: var(--color-nav-bg);
        color: var(--color-nav-txt);
        padding: 0 10px;
        border-radius: 30px;
        font-family: Nunito;
        font-size: 4rem;
        font-weight: 900;
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
            height: 200px;
            width: 300px;
            border-radius: 10px;
            box-shadow: rgba(0, 0, 0, 0.2) 5px 5px 10px 5px;
          }
          .posts-date {
            position: absolute;
            z-index: 7;
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

  .fadeLoading-enter-active,
  .fadeLoading-leave-active {
    transition: opacity 0.2 ease-in;
  }

  .fadeLoading-enter-from,
  .fadeLoading-leave-to {
    transition: opacity 0.5s ease-out;
    opacity: 0;
  }
}
</style>

<!-- 
<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";

const post = ref([]);
const isLoading = ref(false);

const getPosts = () => {
  isLoading.value = true;
  fetch("http://localhost/wordpress/?rest_route=/wp/v2/news")
    .then((response) => response.json())
    .then((data) => {
      post.value = data;
      isLoading.value = false;
      console.log(post)
      console.log(post)


    });
};

onMounted(() => {
  getPosts();
});

</script> -->
