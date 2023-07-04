<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref, watch, onMounted } from "vue";
import { useTheme } from "../store/theme";
import $ from "jquery";
import gsap from "gsap";
import LoginTab from "@/components/LoginTab.vue";
import UserTab from "@/components/UserTab.vue";
import { modalActive } from "../store/modalActive";
import { signedIn } from "../store/signedIn";
import { userClicked } from "@/store/userClicked";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Englishflag from "@/assets/logos/English_language.svg";
import Hungaryflag from "@/assets/logos/Hungary_Flag.svg";

const langEn = ref(false) as any;
const langHu = ref(false) as any;

const Logo = new URL("../assets/logos/logo.svg", import.meta.url).href;

//FETCHING LOCATION FOR LANGUAGE

var requestUrl = "https://geolocation-db.com/json/";

$.ajax({
  url: requestUrl,
  type: "GET",
  success: function (json) {
    if (json.country_name == "Hungary") {
      langHu.value = true;
    } else {
      langEn.value = true;
    }
  },
  error: function (err) {
    console.log("Request failed, error= " + err);
  },
});

// if(on.country.name == "Hungary"){
//   console.log("szevasz")
//   langHu.value = true;
//   langEn.value = true;

// }else {
//   langEn.value = true;
// }

const loginActivated = ref(false);
const signedInCheck = signedIn();
const activateLoginTab = ref(false);

const displayName = ref();

const userClick = userClicked();

const initialName = ref();

const loggedIn = ref();
loggedIn.value = localStorage.getItem("isLoggedIn");

const activeLogin = () => {
  if (!activateLoginTab.value) {
    activateLoginTab.value = true;
  } else {
    activateLoginTab.value = false;
  }
};

const closeLoginTab = () => {
  const modalActivation = modalActive();
  if (activateLoginTab.value && !modalActivation.state) {
    activateLoginTab.value = false;
  }
};

const closeProfileTab = () => {
  if (userClick) {
    userClick.state = false;
  }
};

//THEME SCRIPT

const theme_checked = ref();
var currentTheme = localStorage.getItem("theme-color");

if (currentTheme === "theme-dark") {
  theme_checked.value = false;
  const changeTheme = useTheme();
  const { changeStateDark } = changeTheme;
  changeStateDark();
} else if (currentTheme === "theme-light") {
  theme_checked.value = true;
  const changeTheme = useTheme();
  const { changeStateLight } = changeTheme;
  changeStateLight();
} else {
  localStorage.setItem("theme-color", "theme-dark");
}

const themechange = () => {
  currentTheme = localStorage.getItem("theme-color");
  if (currentTheme === "theme-dark") {
    theme_checked.value = false;
    currentTheme = "theme-light";
    const changeTheme = useTheme();
    const { changeStateLight } = changeTheme;
    changeStateLight();
    localStorage.setItem("theme-color", "theme-light");
  } else if (currentTheme === "theme-light") {
    theme_checked.value = true;
    currentTheme = "theme-dark";
    const changeTheme = useTheme();
    const { changeStateDark } = changeTheme;
    changeStateDark();
    localStorage.setItem("theme-color", "theme-dark");
  } else {
    const changeTheme = useTheme();
    const { changeStateLight } = changeTheme;
    theme_checked.value = true;
    changeStateLight();
    localStorage.setItem("theme-color", "theme-light");
  }
};
watch(theme_checked, (newValue, oldValue) => {
  localStorage.setItem("theme-checked", JSON.stringify(newValue));
});

theme_checked.value =
  JSON.parse(localStorage.getItem("theme-checked") as string) || false;

//LOGIN
watch(signedIn, (newValue, oldValue) => {
  localStorage.setItem("loggedIn", JSON.stringify(newValue));
});
watch(signedInCheck, (newValue) => {
  if (signedInCheck.state) {
    activateLoginTab.value = false;
  } else {
    userClick.state = false;
  }
});

//WEATHER
const onMountApp = ref(false);
const time = ref([] as unknown as number | string);
const weatherHov = ref(false);
const timeWeatherUp = ref(false);

//TIME CALCULATION
function timeCurrent() {
  const today = new Date();
  time.value =
    (today.getHours() < 10 ? "0" : "") +
    today.getHours() +
    ":" +
    (today.getMinutes() < 10 ? "0" : "") +
    today.getMinutes();

  var t = setTimeout(function () {
    timeCurrent();
  }, 10);
}
timeCurrent();

//WEATHER SCRIPT
var getIP = "https://geolocation-db.com/json/";
var openWeatherMap = "https://api.openweathermap.org/data/2.5/weather/";
const location2 = ref()

const city = ref()
const temp = ref()


const getWeather2 = () => {
    $.getJSON(getIP).done(function (location) {
    $.getJSON(openWeatherMap, {
      lat: location.latitude,
      lon: location.longitude,
      units: "metric",
      APPID: "20fd3e315880d30f3beed6621ed06ee1",
    }).done(function (weather) {
      city.value = location.city
      temp.value = Math.round(weather.main.temp)
    });
  });
};

// const getWeather = () => {
//   $.getJSON(getIP).done(function (location) {
//     $.getJSON(openWeatherMap, {
//       lat: location.latitude,
//       lon: location.longitude,
//       units: "metric",
//       APPID: "20fd3e315880d30f3beed6621ed06ee1",
//     }).done(function (weather) {
//       0;
//       $(".weather").append(
//         location.city +
//           "," +
//           " " +
//           Math.round(weather.main.temp) +
//           " " +
//           "Celsius"
//       );
//     });
//   });
// };

//WEATHER HOVERING
const weatherHovered = () => {
  weatherHov.value = true;
};
const weatherUnHovered = () => {
  weatherHov.value = false;
};

//ACTIVATION LOGIN TAB

const navRef = ref();
const UserTabHeight = ref();

//START ON MOUNT
onMounted(() => {
  onMountApp.value = true;
  getWeather2();
  timeCurrent();
  loginActivated.value = JSON.parse(localStorage.getItem("loggedInBefore")!);

  gsap.from(".nav-links a", {
    delay: 0.3,
    duration: 0.2,
    stagger: 0.05,
    y: -70,
  });
  gsap.from(".weather-time", { delay: 0.8, opacity: 0 });
  gsap.from(".theme-changer-wrapper", { delay: 0.8, opacity: 0 });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (firebase.auth().currentUser?.uid != undefined) {
        signedInCheck.state = true;
        loginActivated.value = true;
        activateLoginTab.value = false;
      }

      var getInitials = function (name) {
        var parts = name.split(" ");
        var initials = "";
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].length > 0 && parts[i] !== "") {
            initials += parts[i][0];
          }
        }
        return initials;
      };
      initialName.value = firebase.auth().currentUser?.displayName;
      displayName.value = getInitials(initialName.value);
    } else {
      signedInCheck.state = false;
    }
  });

  const intervalId = setInterval(function () {
    timeWeatherUp.value = true;
    setTimeout(function () {
      timeWeatherUp.value = false;
    }, 2000);
  }, 15000);
});
</script>

<template>
  <header class="fullNav" ref="navRef">
    <div class="wrapper">
      <nav :class="currentTheme">
        <ul class="nav-links">
          <RouterLink to="/">
            <div class="nav-logo">
              <img class="logo" :src="Logo" />
            </div>
          </RouterLink>
          <div class="user-wrapper">
            <TransitionGroup name="user">
              <a
                key="2"
                v-show="!signedInCheck.state && loginActivated"
                to="/login"
                class="login"
                @click.stop.prevent="activeLogin()"
                :class="activateLoginTab ? 'active' : ''"
              >
                <li>Login</li>
              </a>
              <a
                key="1"
                v-show="signedInCheck.state"
                class="user"
                @click.native.prevent="userClick.state = !userClick.state"
              >
                {{ displayName }}
              </a>
            </TransitionGroup>
          </div>
          <RouterLink to="/rulebook"><li>Rulebook</li></RouterLink>
          <RouterLink to="/news"><li>News</li></RouterLink>
          <RouterLink to="/bsl"><li>BSL</li></RouterLink>
          <RouterLink to="/custom-teams"><li>Custom Teams</li></RouterLink>
          <RouterLink to="/contact"><li>Contact</li></RouterLink>
        </ul>

        <div class="wt-wrapper">
          <div
            @mouseover="weatherHovered"
            @mouseleave="weatherUnHovered"
            :class="[
              'weather-time',
              { active: weatherHov },
              timeWeatherUp ? 'up' : 'down',
            ]"
          >
            <div class="time">{{ time }}</div>
            <div class="weather">
              <div class="city">{{ city }}</div>
              <div class="temp">{{ temp }} Celsius</div>
            </div>
          </div>
        </div>
        <div class="language-wrapper"></div>
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

        <transition name="fadeLogin">
          <LoginTab
            v-if="activateLoginTab && !signedInCheck.state"
            v-click-away="closeLoginTab"
          />
        </transition>
        <transition name="userTab">
          <UserTab
            ref="UserTabHeight"
            v-if="signedInCheck.state && userClick.state"
            v-click-away="closeProfileTab"
          />
        </transition>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.fullNav {
  z-index: 100;
  position: fixed;
  width: 100%;
  height: 70px;

  .wrapper {
    height: 100%;
    width: 100%;

    nav {
      background-color: var(--color-nav-bg);
      border-radius: 70px 0 0 70px;
      box-shadow: 4px 4px 5px 5px rgba(0, 0, 0, 0.3);
      gap: 40px;
      height: 100%;
      width: 100vw;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      transition: all 0.5s ease-out;

      .nav-links {
        height: 100%;
        width: 80%;
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-block-start: 0;
        padding-inline-start: 0;

        a {
          color: var(--color-nav-txt);
          text-decoration: none;
          font-size: 1.5rem;
          text-transform: uppercase;
          font-family: Chango;
          padding: 0 1rem;
          transition: font 0.1s, background-color 0.3s, box-shadow 0.1s;
          overflow: hidden;

          li {
            list-style-type: none;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            transition: all 0.2s;
          }
        }

        a::after {
          content: "";
          height: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          transform: translateX(-20px);
          box-shadow: 0px 5px 10px 10px rgba(black, $alpha: 1);
          opacity: 0;
          transition: opacity 0.1s ease-in-out;
        }
        a:hover::after {
          opacity: 1;
        }
        a:hover {
          background-color: var(--vt-c-nav-text-bg-hover);
          color: var(--vt-c-nav-text-hover);
        }

        a:first-child::after {
          display: none;
        }

        a:first-child:hover::after {
          display: none;
        }

        a:first-child {
          background-color: transparent;
        }

        a:nth-child(2).router-link-exact-active::after {
          height: 0;
          width: 0;
          box-shadow: 0px 0px 0px 0px;
        }
        a:nth-child(2) {
          a {
            cursor: pointer;
          }
        }

        a:nth-child(2):hover::after {
          display: none;
        }
        a:nth-child(1) {
          padding: 0;
          left: 0;
        }

        a.router-link-exact-active:first-child {
          background-color: transparent;
        }
        a.router-link-exact-active:first-child:hover {
          background-color: transparent;
        }
        a.router-link-exact-active {
          color: var(--vt-c-nav-text-active);
          background-color: var(--vt-c-nav-text-bg-hover);
        }
        a.router-link-exact-active::after {
          content: "";
          height: 100%;
          position: absolute;
          top: 0;
          transform: translateX(-32px);
          box-shadow: 0px 0px 5px 2px rgba($color: #000000, $alpha: 1);
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
        }
        .user-wrapper {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;

          .login {
            height: 100%;
            width: 100%;
            transition: opacity 0.2s;
            overflow: visible;
          }
          .login:hover {
            background-color: transparent;
            color: var(--color-nav-txt);
          }
          .user {
            position: absolute;
            transition: opacity 0.2s;
            align-self: center;
            height: 50px;
            width: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-nav-txt);
            color: var(--color-nav-bg);
          }
        }

        .nav-logo {
          position: relative;
          left: 0;
          height: 100%;

          .logo {
            height: 70px;
            position: relative;
            padding: 2px;
          }
        }
      }
    }
  }
  .wt-wrapper {
    height: 100%;
    overflow: hidden;
    .weather-time {
      top: -35px;
      height: 200%;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      font-family: Chango;
      font-size: 1rem;
      color: var(--color-nav-txt);
      transition: transform 0.1s ease-in-out;

      .weather {
        width: 100%;
        height: 50%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        div {
          width: 100%;
        }
      }
      .time {
        width: 100%;
        height: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        align-content: center;
      }
    }
    .weather-time.up {
      transform: translateY(-50%);
    }
    .weather-time.down {
      transform: translateY(0%);
    }

    .weather-time.active {
      transform: translateY(-50%);
    }
  }
  .language-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100px;
    cursor: pointer;
    svg {
      border-radius: 10px;
      width: 50%;
      height: 50%;
    }
  }
  .theme-changer-wrapper {
    height: 100%;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 25px;
  }

  .theme-changer {
    position: relative;
    width: 60px;
    height: 34px;
  }

  .button {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(1, 67, 131);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: rgb(235, 235, 235);
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: rgb(235, 235, 235);
  }
  input:checked + .slider:before {
    background-color: rgba(0, 54, 107, 1);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px rgb(1, 67, 131);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  a.router-link-exact-active {
    span {
      transform: scale(1.1);
    }
  }
}

.content-wrapper {
  position: relative;
  height: calc(100vh - 70px);
  bottom: -70px;
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

.fullNav.medium {
  .wrapper {
    nav {
      .nav-links {
        a {
          font-size: 1rem;
        }
      }
    }
  }
}

.user-enter-active,
.user-leave-active {
  opacity: 1;
}
.user-enter-from,
.user-leave-to {
  opacity: 0;
}

.fadeLogin-enter-active,
.fadeLogin-leave-active {
  transform: translateY(0px);
  overflow: hidden;
  transition: transform 0.3s;
}
.fadeLogin-enter-from,
.fadeLogin-leave-to {
  transform: translateY(-300px);
}
.userTab-enter-active,
.userTab-leave-active {
  transform: translateY(0px);
  overflow: hidden;
  transition: transform 0.3s;
}
.userTab-enter-from,
.userTab-leave-to {
  transform: translateY(-400px);
}
</style>
