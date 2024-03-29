import { isLoading } from "@/store/isloading";
import { createRouter, createWebHistory } from "vue-router";
import "jquery";
import $ from "jquery";
import { onMountApp } from "@/store/onMountApp";
import { ref, watch } from "vue";
import { isAdmin } from "@/store/isAdmin";
import { trackRouter } from "vue-gtag-next";
import { settings } from "firebase/analytics";
import { postLoaded } from "@/store/postLoaded";
import { storeRouterAnalytics } from "@/components/myAnalytics";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () =>
        import(/* webpackChunkName: "Landing" */ "../views/Landing.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () =>
        import(/* webpackChunkName: "Login" */ "../views/Login.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () =>
        import(/* webpackChunkName: "Register" */ "../views/Register.vue"),
    },
    {
      path: "/forgotpassword",
      name: "forgotpassword",
      component: () =>
        import(
          /* webpackChunkName: "Forgotpassword" */ "../views/Forgotpassword.vue"
        ),
    },
    {
      path: "/EditPostsList",
      name: "editpostslist",
      beforeEnter: guardRouteUser,
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/EditPostsList.vue"),
    },
    {
      path: "/AdminPage",
      name: "adminpage",
      beforeEnter: guardRouteAdmin,
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/AdminPage.vue"),
    },
    {
      path: "/CreatePost/:createSlug",
      name: "createpost",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/CreatePost.vue"),
    },
    {
      path: "/Profile",
      name: "profile",
      beforeEnter: guardRouteUser,

      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/Profile.vue"),
      meta: { title: "Home" },
    },
    {
      path: "/rulebook",
      name: "rulebook",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "Rulebook" */ "../views/Rulebook.vue"),
    },
    {
      path: "/News",
      name: "news",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/News.vue"),
    },
    {
      path: "/bsl",
      name: "bsl",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "BSL" */ "../views/Blog.vue"),
    },
    {
      path: "/custom-teams",
      name: "custom-teams",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(
          /* webpackChunkName: "Custom-teams" */ "../views/Custom-teams.vue"
        ),
    },
    {
      path: "/contact",
      name: "contact",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "Contact" */ "../views/Contact.vue"),
    },
    {
      path: "/pathMatch(.*)*",
      name: "not-found",
      component: () =>
        import(
          /* webpackChunkName: "PageNotFound" */ "../views/PageNotFound.vue"
        ),
    },
    {
      path: "/news/:newsSlug",
      name: "newspost",
      component: () =>
        import(/* webpackChunkName: "NewsPosts" */ "../views/NewsPost.vue"),
    },
    {
      path: "/blog/:blogSlug",
      name: "blogpost",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/BlogPost.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/PageNotFound.vue"),
    },
    {
      path: "/test",
      name: "test",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/Test.vue"),
    },
    {
      path: "/regactivation/:activationToken",
      name: "regactivation",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/RegActivation.vue"),
    },
  ],
});

trackRouter(router);

storeRouterAnalytics(router);

router.beforeEach((to, from, next) => {
  const isLoadingCheck = isLoading();
  isLoadingCheck.state = true
  const postLoad = postLoaded();
  const { postStateFalse } = postLoad;
  postStateFalse();
  if (to.name === "bsl" || to.name === "news" || to.name === "profile") {
    next();
  } else if (to.name === "blogpost" || to.name === "newspost") {
    next();
  } else {
    isLoadingCheck.state = false
    next();
  }
});

router.afterEach((to, from) => {
  const mountApp = onMountApp();
  const isLoadingCheck = isLoading();
  isLoadingCheck.state = true

  if (to.path === "/editpostslist") {
  } else {
    setTimeout(() => {
      if (mountApp.state) {
        isLoadingCheck.state = false
      }
    }, 300);
  }
});

router.beforeEach((to, from, next) => {
  var isAuthenticated = JSON.parse(
    localStorage.getItem("isLoggedIn") as string
  );
  if (
    (to.name == "profile" && !isAuthenticated) ||
    (to.name == "editpostslist" && !isAuthenticated) ||
    (to.name == "createpost" && !isAuthenticated)
  )
    next({ name: "login" });
  else if (to.name == "adminpage") {
    setTimeout(() => {
      next();
    }, 10);
  } else next();
});

function guardRouteUser(to, from, next) {
  var isAuthenticated = JSON.parse(
    localStorage.getItem("isLoggedIn") as string
  );

  if (isAuthenticated) {
    next(); // allow to enter route
  } else {
    next("/login"); // go to '/login';
  }
}
function guardRouteAdmin(to, from, next) {
  const isAdminCheck = isAdmin();

  setTimeout(() => {
    if (isAdminCheck.state) {
      next(); // allow to enter route
    } else {
      next("/"); // go to '/login';
    }
  }, 600);
}

export default router;
