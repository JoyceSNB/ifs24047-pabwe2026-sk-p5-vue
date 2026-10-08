<template>
  <form
    class="space-y-4"
    @submit.prevent="submit"
  >
    <div>
      <h1 class="text-2xl font-extrabold">
        Buat Akun
      </h1>

      <p class="mt-1 text-sm text-slate-500">
        Daftarkan akun baru untuk menggunakan
        Delcom Auction.
      </p>
    </div>

    <input
      v-model="name"
      class="w-full border rounded-xl p-3"
      placeholder="Nama"
      autocomplete="name"
    />

    <input
      v-model="email"
      type="email"
      class="w-full border rounded-xl p-3"
      placeholder="Email"
      autocomplete="email"
    />

    <input
      v-model="password"
      type="password"
      class="w-full border rounded-xl p-3"
      placeholder="Password"
      autocomplete="new-password"
    />

    <input
      v-model="confirm"
      type="password"
      class="w-full border rounded-xl p-3"
      placeholder="Ulangi Password"
      autocomplete="new-password"
    />

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-indigo-600 text-white rounded-xl p-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{
        loading
          ? "Mendaftarkan..."
          : "Daftar"
      }}
    </button>

    <p class="text-sm text-center">
      Sudah punya akun?

      <RouterLink
        class="text-indigo-600 font-semibold"
        to="/auth/login"
      >
        Masuk
      </RouterLink>
    </p>
  </form>
</template>

<script setup>
import { ref } from "vue";

import {
  RouterLink,
  useRouter,
} from "vue-router";

import { useAuthStore } from "../states/authStore";

import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");

const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function submit() {
  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value
  ) {
    await showErrorDialog(
      "Semua field wajib diisi",
    );

    return;
  }

  if (
    password.value !== confirm.value
  ) {
    await showErrorDialog(
      "Password tidak sama",
    );

    return;
  }

  loading.value = true;

  try {
    await auth.signUp(
      email.value.trim(),
      password.value,
      name.value.trim(),
    );

    await showSuccessDialog(
      "Registrasi berhasil",
    );

    await router.push(
      "/auth/login",
    );
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error,
    );

    const message =
      error?.message ||
      "Registrasi gagal. Silakan coba lagi.";

    await showErrorDialog(message);
  } finally {
    loading.value = false;
  }
}
</script>