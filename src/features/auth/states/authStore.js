import { defineStore } from "pinia";
import { computed, ref } from "vue";
import * as authApi from "../api/authApi";
import {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(getAccessToken());
  const isAuthLogin = ref(false);
  const isAuthRegister = ref(false);
  const isAuthLogout = ref(false);
  const message = ref("");
  const errors = ref({});

  const isAuthenticated = computed(() => Boolean(token.value));

  const finish = (response) => {
    message.value = response.message;
    errors.value = response.data?.field || {};
    return response.status === "success";
  };

  async function login(email, password) {
    isAuthLogin.value = true;
    const response = await authApi.login(email, password);
    const success = finish(response);
    if (success) {
      putAccessToken(response.data.token);
      token.value = response.data.token;
    }
    isAuthLogin.value = false;
    return success;
  }

  async function register(name, email, password) {
    isAuthRegister.value = true;
    const response = await authApi.register(name, email, password);
    const success = finish(response);
    isAuthRegister.value = false;
    return success;
  }

  async function logout() {
    isAuthLogout.value = true;
    const response = await authApi.logout();
    const success = finish(response);
    // Token lokal selalu dibersihkan agar pengguna bisa keluar meski API gagal.
    removeAccessToken();
    token.value = null;
    isAuthLogout.value = false;
    return success;
  }

  return {
    token,
    isAuthenticated,
    isAuthLogin,
    isAuthRegister,
    isAuthLogout,
    message,
    errors,
    login,
    register,
    logout,
  };
});
