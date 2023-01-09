import { useLoaderState } from "@/store/isloading";

import { createRouter, createWebHistory } from "vue-router";
import { createApp } from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/Landing.vue"),
    },
    {
      path: "/rulebook",
      name: "rulebook",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/Rulebook.vue"),
    },
    {
      path: "/News",
      name: "news",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "@/views/News.vue"),
    },
    {
      path: "/bsl",
      name: "bsl",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/BSL.vue"),
    },
    {
      path: "/custom-teams",
      name: "custom-teams",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/Custom-teams.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/Contact.vue"),
    },
    {
      path: "/pathMatch(.*)*",
      name: "not-found",
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/PageNotFound.vue"),
    },
    {
      path: "/:newsSlug",
      name: "post",
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/Pages.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isLoading = useLoaderState();
  const { changeStateTrue } = isLoading;

  changeStateTrue();
  setTimeout(() => {
    next();
  }, 10);
});
router.afterEach((to, from) => {
  const isLoading = useLoaderState();
  const { changeStateFalse } = isLoading;

  setTimeout(() => {
    changeStateFalse();
  }, 300);
});

export default router;
