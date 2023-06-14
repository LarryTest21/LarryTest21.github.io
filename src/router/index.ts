import { useLoaderState } from "@/store/isloading";
import { createRouter, createWebHistory } from "vue-router";
import "jquery";
import $ from "jquery";
import { onMountApp } from "@/store/onMountApp";

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
      path: "/EditPosts",
      name: "editposts",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/EditPosts.vue"),
    },
    {
      path: "/CreatePost",
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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "News" */ "@/views/Profile.vue"),
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
      component: () => import(/* webpackChunkName: "BSL" */ "../views/BSL.vue"),
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
      name: "hey",
      component: () =>
        import(/* webpackChunkName: "NewsPosts" */ "../views/NewsPosts.vue"),
    },
    {
      path: "/blog/:blogSlug",
      name: "post",
      component: () =>
        import(/* webpackChunkName: "BlogPost" */ "../views/BlogPost.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isLoading = useLoaderState();
  const { changeStateTrue } = isLoading;

  if (to.path === "/bsl" || to.path === "/news" || to.path === "/profile") {
    next();
  } else {
    changeStateTrue();
    setTimeout(() => {
      next();
    }, 10);
  }
});

router.afterEach((to, from) => {
  const mountApp = onMountApp();

  const isLoading = useLoaderState();
  const { changeStateFalse } = isLoading;

  setTimeout(() => {
    if (mountApp.state) {
      changeStateFalse();
    }
  }, 300);
});

export default router;
