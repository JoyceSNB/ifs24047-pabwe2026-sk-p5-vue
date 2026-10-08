import { defineStore } from "pinia";

import {
  login,
  register,
} from "../api/authApi";

import {
  getAccessToken,
  putAccessToken,
} from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAccessToken(),

    user: JSON.parse(
      localStorage.getItem("delcom_user") || "null",
    ),

    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async signIn(username, password) {
      this.loading = true;

      try {
        const response = await login(
          username,
          password,
        );

        this.token =
          response?.data?.token ??
          response?.token ??
          null;

        this.user =
          response?.data?.user ??
          response?.user ??
          null;

        putAccessToken(this.token);

        if (this.user) {
          localStorage.setItem(
            "delcom_user",
            JSON.stringify(this.user),
          );
        }

        return response;
      } finally {
        this.loading = false;
      }
    },

    async signUp(username, password, name) {
      return register(
        username,
        password,
        name,
      );
    },

    logout() {
      this.token = null;
      this.user = null;

      putAccessToken(null);

      localStorage.removeItem(
        "delcom_user",
      );
    },
  },
});