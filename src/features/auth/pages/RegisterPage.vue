<script setup>
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const name = useInput("");
const email = useInput("");
const password = useInput("");
const confirmation = useInput("");
const errors = ref({});

const isLoading = computed(() => authStore.isAuthRegister);

const validate = () => {
  const result = {};
  if (!name.value.value.trim()) result.name = "Nama wajib diisi.";
  if (!email.value.value.trim()) result.email = "Email wajib diisi.";
  if (password.value.value.length < 6) result.password = "Kata sandi minimal 6 karakter.";
  if (confirmation.value.value !== password.value.value) result.confirmation = "Konfirmasi kata sandi tidak sama.";
  errors.value = result;
  return Object.keys(result).length === 0;
};

const onSubmit = async () => {
  if (!validate()) return;
  const success = await authStore.register(
    name.value.value.trim(),
    email.value.value.trim(),
    password.value.value
  );
  if (!success) {
    await showErrorDialog(authStore.message);
    return;
  }
  await showSuccessDialog(authStore.message);
  router.push("/auth/login");
};

const fields = [
  { id: "register-name-input", key: "name", label: "Nama lengkap", type: "text", auto: "name", model: name },
  { id: "register-email-input", key: "email", label: "Email", type: "email", auto: "email", model: email },
  { id: "register-password-input", key: "password", label: "Kata sandi", type: "password", auto: "new-password", model: password },
  { id: "register-confirmation-input", key: "confirmation", label: "Ulangi kata sandi", type: "password", auto: "new-password", model: confirmation },
];
</script>

<template>
  <section aria-labelledby="register-title">
    <h1 id="register-title" class="text-3xl font-extrabold text-indigo-950">Buat akun</h1>
    <p class="mt-2 text-slate-600">Daftar gratis dan ikut lelang dalam hitungan menit.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
      <div v-for="field in fields" :key="field.id">
        <label :for="field.id" class="block text-sm font-semibold text-slate-800">{{ field.label }}</label>
        <input
          :id="field.id"
          :type="field.type"
          :autocomplete="field.auto"
          :value="field.model.value.value"
          :aria-invalid="Boolean(errors[field.key])"
          :aria-describedby="errors[field.key] ? `${field.id}-error` : undefined"
          class="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-700"
          @input="field.model.onChange"
        />
        <p v-if="errors[field.key]" :id="`${field.id}-error`" class="mt-1 text-sm text-red-700">{{ errors[field.key] }}</p>
      </div>

      <button
        id="register-submit-button"
        type="submit"
        :disabled="isLoading"
        class="w-full rounded-lg bg-indigo-950 px-4 py-3 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70"
      >
        {{ isLoading ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-700">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-indigo-800 underline">Masuk</RouterLink>
    </p>
  </section>
</template>
