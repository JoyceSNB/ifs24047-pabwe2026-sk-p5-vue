<script setup>
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const email = useInput("");
const kataSandi = useInput("");
const errors = ref({});

const isLoading = computed(() => authStore.isAuthLogin);

const validate = () => {
  const result = {};
  if (!email.value.value.trim()) result.email = "Email wajib diisi.";
  if (!kataSandi.value.value) result.password = "Kata sandi wajib diisi.";
  errors.value = result;
  return Object.keys(result).length === 0;
};

const onSubmit = async () => {
  if (!validate()) return;
  const success = await authStore.login(email.value.value.trim(), kataSandi.value.value);
  if (!success) {
    await showErrorDialog(authStore.message);
    return;
  }
  await showSuccessDialog(authStore.message);
  router.push("/");
};
</script>

<template>
  <section aria-labelledby="login-title">
    <h1 id="login-title" class="text-3xl font-extrabold text-indigo-950">Masuk</h1>
    <p class="mt-2 text-slate-600">Masuk untuk mulai menawar dan memasang lelang.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="login-email-input" class="block text-sm font-semibold text-slate-800">Email</label>
        <input
          id="login-email-input"
          type="email"
          autocomplete="email"
          :value="email.value.value"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'login-email-error' : undefined"
          class="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-700"
          @input="email.onChange"
        />
        <p v-if="errors.email" id="login-email-error" class="mt-1 text-sm text-red-700">{{ errors.email }}</p>
      </div>

      <div>
        <label for="login-password-input" class="block text-sm font-semibold text-slate-800">Kata sandi</label>
        <input
          id="login-password-input"
          type="password"
          autocomplete="current-password"
          :value="kataSandi.value.value"
          :aria-invalid="Boolean(errors.password)"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
          class="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-700"
          @input="kataSandi.onChange"
        />
        <p v-if="errors.password" id="login-password-error" class="mt-1 text-sm text-red-700">{{ errors.password }}</p>
      </div>

      <button
        id="login-submit-button"
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-lg bg-indigo-950 px-4 py-3 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70"
      >
        {{ isLoading ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-700">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-indigo-800 underline">Daftar sekarang</RouterLink>
    </p>
  </section>
</template>