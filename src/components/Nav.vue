<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ref, watch, onMounted } from "vue";
import { useTheme } from "../store/theme";
import $ from "jquery";
import gsap from "gsap";
import LoginTab from "@/components/LoginTab.vue";
import UserTab from "@/components/UserTab.vue";
import { modalActive } from "@/store/modalActive";
import { signedIn } from "@/store/signedIn";
import { userTabClick } from "@/store/userTabClick";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Englishflag from "@/assets/logos/English_language.svg";
import Hungaryflag from "@/assets/logos/Hungary_Flag.svg";
import { isAdmin } from "@/store/isAdmin";
import { newUser } from "@/store/newUser"
import db from "../firebase/firebaseInit";
import { getDoc, doc } from "firebase/firestore";


const notificationArray = ref([]) as any
const notifCounter = ref(0)
const isActivated = ref()
const showNotif = ref(false)

watch(notificationArray.value, (newValue) => {
  if (!isActivated.value) {
    notifCounter.value = notificationArray.value.length + 1
  } else {
    notifCounter.value = notificationArray.value.length

  }
})
const checkNewUser = newUser()

const isAdminCheck = isAdmin();


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


const loginActivated = ref(false);
const signedInCheck = signedIn();
const activateLoginTab = ref(false);

const displayName = ref();

const userTabClicked = userTabClick();

watch(userTabClicked, () => {
  showNotif.value = false
})
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
  if (userTabClicked) {
    userTabClicked.state = false;
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
watch(signedInCheck, (newValue) => {
  if (signedInCheck.state) {
    activateLoginTab.value = false;
  } else {
    userTabClicked.state = false;
  }
});

//WEATHER
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

const city = ref();
const temp = ref();

const getWeather2 = () => {
  $.getJSON(getIP).done(function (location) {
    $.getJSON(openWeatherMap, {
      lat: location.latitude,
      lon: location.longitude,
      units: "metric",
      APPID: "20fd3e315880d30f3beed6621ed06ee1",
    }).done(function (weather) {
      city.value = location.city;
      temp.value = Math.round(weather.main.temp);
    });
  });
};


//WEATHER HOVERING
const weatherHovered = () => {
  weatherHov.value = true;
};
const weatherUnHovered = () => {
  weatherHov.value = false;
};

//ACTIVATION LOGIN TAB
const userDisplayName = ref()
const navRef = ref();
const UserTabHeight = ref();







onMounted(() => {
  getWeather2();
  timeCurrent();
  loginActivated.value = JSON.parse(localStorage.getItem("loggedInBefore")!);

  gsap.from(".nav-links a", {
    delay: 0.5,
    duration: 0.2,
    stagger: 0.05,
    y: -100,
  }).then(() => {
    showNotif.value = true
  });;
  gsap.from(".weather-time", { delay: 0.8, opacity: 0 })
  gsap.from(".theme-changer-wrapper", { delay: 0.8, opacity: 0 })


  firebase.auth().onAuthStateChanged(async (user) => {


    if (!checkNewUser.state) {

      //Check if User logged in

      if (user) {
        signedInCheck.state = true;
        loginActivated.value = true;
        activateLoginTab.value = false;


        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        userDisplayName.value = userDoc.data()!['displayName'].toString();
        isActivated.value = userDoc.data()!['activated'];

        if (!isActivated.value) {
          var test = { 'test': 'test' }
          notificationArray.value.push(test)

        }
        //Creating initials
        var getInitials = function (nameValue) {
          var parts = nameValue.split(" ");
          var initials = "";
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].length > 0 && parts[i] !== "") {
              initials += parts[i][0];
            }
          }
          return initials;
        };


        //Get initials
        if (userDisplayName.value != undefined) {
          displayName.value = getInitials(userDisplayName.value);
        }

      } else {
        signedInCheck.state = false;
      }
    }
  });

  const intervalId = setInterval(function () {
    timeWeatherUp.value = true;
    setTimeout(function () {
      timeWeatherUp.value = false;
    }, 2000);
  }, 15000);
});

const notifClickedRef = ref(false)
const notifClicked = (value) => {
  notifClickedRef.value = true
}

</script>

<template>
  <header class="fullNav" ref="navRef">
    <div class="notif-wrapper" v-if="notifCounter">
    </div>

    <div class="wrapper">
      <nav :class="currentTheme">
        <ul class="nav-links">
          <RouterLink to="/">
            <div class="nav-logo">
              <img class="logo" :src="Logo" />
            </div>
          </RouterLink>
          <a class="user-wrapper">
            <transition name="notif">
              <div class="notif-counter" v-if="notifCounter != 0 && showNotif">{{ notifCounter }}</div>

            </transition>

            <TransitionGroup name="user">
              <a key="1" v-if="signedInCheck.state" class="user"
                @click.native.prevent="userTabClicked.state = !userTabClicked.state">
                {{ displayName }}
              </a>
              <a key="2" v-if="!signedInCheck.state && loginActivated" to="/login" class="login"
                @click.stop.prevent="activeLogin()" :class="activateLoginTab ? 'active' : ''">
                <li>Login</li>
              </a>

            </TransitionGroup>
          </a>
          <RouterLink to="/rulebook">
            <li>Rulebook</li>
          </RouterLink>
          <RouterLink to="/news">
            <li>News</li>
          </RouterLink>
          <RouterLink to="/bsl">
            <li>BSL</li>
          </RouterLink>
          <RouterLink to="/custom-teams">
            <li>Custom Teams</li>
          </RouterLink>
          <RouterLink to="/contact">
            <li>Contact</li>
          </RouterLink>
        </ul>

        <div class="wt-wrapper">
          <div @mouseover="weatherHovered" @mouseleave="weatherUnHovered" :class="[
            'weather-time',
            { active: weatherHov },
            timeWeatherUp ? 'up' : 'down',
          ]">
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
            <input v-model="theme_checked" type="checkbox" class="button" @click="themechange()" :class="currentTheme" />
            <span class="slider round"></span>
          </label>
        </div>

        <transition name="fadeLogin">
          <LoginTab v-if="activateLoginTab && !signedInCheck.state" v-click-away="closeLoginTab"
            @emitRegister="activateLoginTab = !activateLoginTab" />
        </transition>
        <transition name="userTab">
          <UserTab class="usertab" ref="UserTabHeight" v-if="signedInCheck.state && userTabClicked.state" @notifClicked="notifClicked"
            v-click-away="closeProfileTab" :isAdminCheck="isAdminCheck.state" :notifCounter="notifCounter"
            :notificationArray="notificationArray" :isActivated="isActivated" />
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
      box-shadow: 4px 8px 5px 0px rgba(0, 0, 0, 0.3);
      gap: 40px;
      height: 100%;
      width: 100vw;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      transition: all 0.5s ease-out;
      overflow: hidden;

      .nav-links {
        height: 100%;
        width: 80%;
        display: flex;
        margin-block-start: 0;
        padding-inline-start: 0;

        a {
          position: relative;
          color: var(--color-nav-txt);
          text-decoration: none;
          font-size: 1.5rem;
          text-transform: uppercase;
          font-family: Chango;
          padding: 0 2rem;
          transition: font 0.1s, background-color 0.3s;
          overflow: hidden;

          li {
            list-style-type: none;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            transition: all 0.2s;
            overflow: hidden;

          }
        }

        a::after {
          content: "";
          height: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          transform: translateX(-35px);
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

        a:first-child {
          padding: 0;
          left: 0;
        }

        a:nth-child(2).router-link-exact-active::after {
          height: 0;
          width: 0;
        }

        a:nth-child(2):hover::after {
          display: none;
        }

        .user-wrapper:hover {

          background: transparent;
          color: var(--vt-nav-txt);

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
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
          position: relative;
          width: 70px;
          height: 100%;
          padding: 3px;
          margin: 0 50px;

          .notif-counter {
            position: absolute;
            background-color: rgb(32, 97, 1);
            color: var(--color-nav-bg);
            font-family: Roboto Condensed;
            font-weight: 700;
            font-size: 1.5rem;
            z-index: 0;
            width: 35px;
            height: 35px;
            padding: 1px 5px;
            border-radius: 50%;
            top: 0;
            right: -25px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 3px;
            animation: fading 2s ease-in-out infinite;
          }

          @keyframes fading {
            0% {
              opacity: 0;
            }

            10% {
              opacity: 1;
            }

            90% {
              opacity: 1;
            }

            100% {
              opacity: 0;
            }
          }

          a {
            cursor: pointer;
            padding: 0;
          }

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
            position: relative;
            transition: opacity 0.2s;
            align-self: center;
            border-radius: 50%;
            display: flex;
            width: 100%;
            height: 100%;
            align-items: center;
            justify-content: center;
            background-color: var(--color-nav-txt);
            color: var(--color-nav-bg);

            a {
              position: absolute;
            }
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
    cursor: pointer;

    svg {
      border-radius: 10px;
      width: 50%;
      height: 50%;
    }
  }

  .theme-changer-wrapper {
    height: 100%;
    width: 150px;
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

  input:checked+.slider {
    background-color: rgb(235, 235, 235);
  }

  input:checked+.slider:before {
    background-color: rgba(0, 54, 107, 1);
  }

  input:focus+.slider {
    box-shadow: 0 0 1px rgb(1, 67, 131);
  }

  input:checked+.slider:before {
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
  transition: transform 0.3s;
}

.fadeLogin-enter-from,
.fadeLogin-leave-to {
  transform: translateY(-300px);
}

.userTab-enter-active,
.userTab-leave-active {
  transform: translateY(0px);
  opacity: 1;
  transition: transform 0.3s;
}

.userTab-enter-from,
.userTab-leave-to {
  transform: translateY(-400px);
}

.notif-enter-active,
.notif-leave-active {
  transform: translateY(0px);
  opacity: 1;
  overflow: hidden;
  transition: transform 0.3s;
}

.notif-enter-from,
.notif-leave-to {
  transform: translateY(-400px);
}
</style>
@/store/userTabClick