import {
  createRouter,
  createWebHistory,
} from "vue-router";

import {
  getAccessToken,
} from "./helpers/apiHelper";

const AuthLayout =
  () =>
    import(
      "./features/auth/layouts/AuthLayout.vue"
    );

const LoginPage =
  () =>
    import(
      "./features/auth/pages/LoginPage.vue"
    );

const RegisterPage =
  () =>
    import(
      "./features/auth/pages/RegisterPage.vue"
    );

const AucationLayout =
  () =>
    import(
      "./features/aucations/layouts/AucationLayout.vue"
    );

const HomePage =
  () =>
    import(
      "./features/aucations/pages/HomePage.vue"
    );

const DetailPage =
  () =>
    import(
      "./features/aucations/pages/DetailPage.vue"
    );

const UsersPage =
  () =>
    import(
      "./features/users/pages/UsersPage.vue"
    );

const ProfilePage =
  () =>
    import(
      "./features/users/pages/ProfilePage.vue"
    );

const NotFoundPage =
  () =>
    import(
      "./features/common/pages/NotFoundPage.vue"
    );

const routes = [
  {
    path: "/auth",
    component: AuthLayout,

    children: [
      {
        path: "login",
        name: "Login",
        component: LoginPage,
      },

      {
        path: "register",
        name: "Register",
        component: RegisterPage,
      },
    ],
  },

  {
    path: "/",
    component: AucationLayout,

    meta: {
      requiresAuth: true,
    },

    children: [
      {
        path: "",
        name: "Home",
        component: HomePage,
      },

      {
        path: "aucations/:aucationId",
        name: "DetailAucation",
        component: DetailPage,
      },

      {
        path: "users",
        name: "Users",
        component: UsersPage,
      },

      {
        path: "profile",
        name: "Profile",
        component: ProfilePage,
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
  },
];

export function createAppRouter(
  history = createWebHistory(),
) {
  const router =
    createRouter({
      history,
      routes,
    });

  router.beforeEach(
    (to) => {
      const token =
        getAccessToken();

      const isAuthRoute =
        to.path.startsWith(
          "/auth",
        );

      if (
        to.meta.requiresAuth &&
        !token
      ) {
        return {
          name: "Login",
        };
      }

      if (
        isAuthRoute &&
        token
      ) {
        return {
          name: "Home",
        };
      }

      return true;
    },
  );

  return router;
}

const router =
  createAppRouter();

export default router;