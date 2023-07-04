import { useLoaderState } from "@/store/isloading";
import { createRouter, createWebHistory } from "vue-router";
import "jquery";
import $ from "jquery";
import { onMountApp } from "@/store/onMountApp";
import { ref, watch } from "vue";
import { postLoaded } from "@/store/postLoaded";

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
      beforeEnter: guardRoute,
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/EditPostsList.vue"),
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
      beforeEnter: guardRoute,

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
      name: "post",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/BlogPost.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/PageNotFound.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isLoading = useLoaderState();
  const { changeStateTrue } = isLoading;

  if (to.name === "bsl" || to.name === "news" || to.name === "profile") {
    next();
  } else if (to.name === "post" || to.name === "newspost") {
    next();
  } else {
    changeStateTrue();
    next();
  }
});

router.afterEach((to) => {
  const mountApp = onMountApp();
  const isLoading = useLoaderState();
  const { changeStateFalse } = isLoading;

  if (to.path === "/editpostslist") {
  } else {
    setTimeout(() => {
      if (mountApp.state) {
        changeStateFalse();
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
  else next();
});

function guardRoute(to, from, next) {
  var isAuthenticated = JSON.parse(
    localStorage.getItem("isLoggedIn") as string
  );

  if (isAuthenticated) {
    next(); // allow to enter route
  } else {
    next("/login"); // go to '/login';
  }
}

export default router;
