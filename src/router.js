import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";

export const routes = [
  {
    path: "/auth",
    component: () => import("./features/auth/layouts/AuthLayout.vue"),
    meta: { guestOnly: true },
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("./features/auth/pages/LoginPage.vue"),
        meta: { title: "Masuk" },
      },
      {
        path: "register",
        name: "register",
        component: () => import("./features/auth/pages/RegisterPage.vue"),
        meta: { title: "Daftar" },
      },
    ],
  },
  {
    path: "/",
    component: () => import("./features/aucations/layouts/AucationLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("./features/aucations/pages/HomePage.vue"),
        meta: { title: "Dashboard Lelang" },
      },
      {
        path: "aucations/:aucationId",
        name: "aucation-detail",
        component: () => import("./features/aucations/pages/DetailPage.vue"),
        meta: { title: "Detail Lelang" },
      },
      {
        path: "users",
        name: "users",
        component: () => import("./features/users/pages/UsersPage.vue"),
        meta: { title: "Daftar Pengguna" },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("./features/users/pages/ProfilePage.vue"),
        meta: { title: "Profil Saya" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./features/common/pages/NotFoundPage.vue"),
    meta: { title: "Halaman Tidak Ditemukan" },
  },
];

/** Guard rute: halaman privat butuh token, halaman auth hanya untuk tamu. */
const redirectTarget = (to, isLoggedIn) => {
  if (to.matched.some((r) => r.meta.requiresAuth) && !isLoggedIn) return "login";
  if (to.matched.some((r) => r.meta.guestOnly) && isLoggedIn) return "home";
  return "";
};

export const authGuard = (to) => {
  const target = redirectTarget(to, Boolean(getAccessToken()));
  return target ? { name: target } : true;
};

export const createAppRouter = (history = createWebHistory()) => {
  const instance = createRouter({ history, routes });
  instance.beforeEach(authGuard);
  instance.afterEach((to) => {
    const title = typeof to.meta.title === "string" ? to.meta.title : "Delcom Auction";
    document.title = `${title} | Delcom Auction`;
  });
  return instance;
};

export const router = createAppRouter();