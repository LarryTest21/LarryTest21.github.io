<!-- 
<script lang="ts">
import { onMounted } from "vue";

export default {
  
  data() {
    return {
      currentTheme: localStorage.getItem("theme-color"),
      theme_checked: false
    };
  },

  methods: {
    themechange() {
      var currentTheme = localStorage.getItem("theme-color");
      if (currentTheme === "theme-dark") {
        localStorage.setItem("theme-color", "theme-light");
        this.currentTheme = localStorage.getItem("theme-color") || "null";
      } else {
        localStorage.setItem("theme-color", "theme-dark");
        this.currentTheme = localStorage.getItem("theme-color") || "null";
      }
    },
  },

  created: function () {
    this.theme_checked =
      JSON.parse(localStorage.getItem("theme-checked") as string) || false;
  },

  watch: {
    theme_checked: function () {
      localStorage.setItem("theme-checked", JSON.stringify(this.theme_checked));
    },
  },
};
</script> -->

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { ref, watch, onMounted } from "vue";
import PreLoader from "@/views/PreLoader.vue";
import { useLoaderState } from "./store/isloading";
import gsap from "gsap";
import $ from "jquery";

const theme_checked = ref(false);
const show = ref(false);
const time = ref([] as unknown as number | string);
const weathertime = ref([] as unknown as number | string);
const weatherHov = ref(false);
const timeWeatherUp = ref(false);

var getIP = "http://ip-api.com/json/";
var openWeatherMap = "http://api.openweathermap.org/data/2.5/weather";

var userIp = [] as unknown as number;
var currentTheme = localStorage.getItem("theme-color");
var animDark = "";

if (currentTheme === "theme-dark") {
  theme_checked.value = false;
} else if (currentTheme === "theme-light") {
  theme_checked.value = true;
} else {
  localStorage.setItem("theme-color", "theme-dark");
  currentTheme = localStorage.getItem("theme-color");
}

const themechange = () => {
  if (currentTheme === "theme-dark") {
    animDark = "";
    localStorage.setItem("theme-color", "theme-light");
    currentTheme = localStorage.getItem("theme-color");
  } else {
    animDark = "animdark";
    localStorage.setItem("theme-color", "theme-dark");
    currentTheme = localStorage.getItem("theme-color");
  }
};

const weatherHovered = () => {
  weatherHov.value = true;
};
const weatherLeft = () => {
  weatherHov.value = false;
};

const getWeather = () => {
  $.getJSON(getIP).done(function (location) {
    $.getJSON(openWeatherMap, {
      lat: location.lat,
      lon: location.lon,
      units: "metric",
      APPID: "20fd3e315880d30f3beed6621ed06ee1",
    }).done(function (weather) {
      $(".weather").append(
        location.city +
          "," +
          " " +
          Math.round(weather.main.temp) +
          " " +
          "Celsius"
      );
    });
  });
};
function currentTime() {
  var date = new Date();
  var hh = date.getHours() as number | string;
  var mm = date.getMinutes() as number | string;

  hh = hh < 10 ? "0" + hh : hh;
  mm = mm < 10 ? "0" + mm : mm;

  time.value = hh + ":" + mm;
  var t = setTimeout(function () {
    currentTime();
  }, 60000);
}

watch(theme_checked, (newValue, oldValue) => {
  localStorage.setItem("theme-checked", JSON.stringify(newValue));
});

const isLoading = useLoaderState();

const onMountApp = ref(false);

onMounted(() => {
  onMountApp.value = true;
  show.value = true;
  getWeather();
  currentTime();

  theme_checked.value =
    JSON.parse(localStorage.getItem("theme-checked") as string) || false;

  const intervalId = setInterval(function () {
    timeWeatherUp.value = true;
    setTimeout(function () {
      timeWeatherUp.value = false;
    }, 2000);
  }, 15000);

  if (onMountApp) {
    setTimeout(() => {
      gsap.from(".nav", { duration: 0.3, y: -70 });
      gsap.from(".nav-links a", {
        delay: 0.1,
        duration: 0.2,
        stagger: 0.05,
        y: -70,
      });
      gsap.from(".weather-time", { delay: 0.3, opacity: 0 });

      gsap.from(".theme-changer-wrapper", { delay: 0.4, opacity: 0 });
    }, 1);
  }
});
console.log("hey");
</script>

<script lang="ts"></script>

<template>
  <div id="app" v-if="onMountApp" :class="[currentTheme, animDark]">
    <header class="nav">
      <div class="wrapper">
        <nav :class="currentTheme">
          <ul class="nav-links" v-if="show">
            <RouterLink to="/">
              <div class="nav-logo">
                <img
                  class="logo"
                  src="/src/assets/logos/logo.svg"
                  alt=""
                /></div
            ></RouterLink>
            <RouterLink to="/rulebook"><li>Rulebook</li></RouterLink>
            <RouterLink to="/news"><li>News</li></RouterLink>
            <RouterLink to="/bsl"><li>BSL</li></RouterLink>
            <RouterLink to="/custom-teams"><li>CustomTeams</li></RouterLink>
            <RouterLink to="/contact"><li>Contact</li></RouterLink>
          </ul>
          <div
            @mouseover="weatherHovered"
            @mouseleave="weatherLeft"
            :class="[
              'weather-time',
              { active: weatherHov },
              timeWeatherUp ? 'up' : 'down',
            ]"
          >
            <div class="time">{{ time }}</div>
            <div class="weather"></div>
          </div>

          <div class="theme-changer-wrapper">
            <label class="theme-changer">
              <input
                v-model="theme_checked"
                type="checkbox"
                class="button"
                @click="themechange()"
                :class="currentTheme"
              />
              <span class="slider round"></span>
            </label>
          </div>
        </nav>
      </div>
    </header>
    <transition name="fade">
      <PreLoader v-if="isLoading.state" :class="[currentTheme]" />
    </transition>
    <RouterView />
  </div>
</template>

<style lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1 ease-in;
}

.fade-enter-from,
.fade-leave-to {
  transition: opacity 0.1s ease-out;
  opacity: 0;
}

.nav-enter-active,
.nav-leave-active {
  transform: translateY(0);
  transition: transform 1s ease-in;
}

.nav-enter-from,
.nav-leave-to {
  transform: translateY(-200px);
  transition: transform 1s ease-out;
}
.content-wrapper {
  height: 100%;
}

.weather-time {
  top: 0;
  position: absolute;
  height: 200%;
  width: 100px;
  right: 0;
  margin-right: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: Chango;
  font-size: 20px;
  color: var(--color-nav-txt);
  transition: transform 0.1s ease-in-out;

  .weather {
    height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
  }
  .time {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 100%;
  }
}
.weather-time.up {
  transform: translateY(-50%);
}

.weather-time.active {
  transform: translateY(-50%);
}

@keyframes weatherAnimHover {
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes weatherAnim {
  0% {
    transform: translateY(0%);
  }
  35% {
    transform: translateY(0%);
  }
  40% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(-50%);
  }
  55% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(0%);
  }
}
</style>
