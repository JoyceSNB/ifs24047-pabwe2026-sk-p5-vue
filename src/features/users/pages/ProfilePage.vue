<script setup>
import { ref, watch } from "vue";
import { useInput } from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";
import { assetUrl, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const store = useUsersStore();
const name = useInput("");
const email = useInput("");
const photo = ref(null);
const photoError = ref("");
const current = useInput("");
const next = useInput("");
const confirmation = useInput("");
const profileErrors = ref({});
const passwordErrors = ref({});

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      name.reset(profile.name);
      email.reset(profile.email);
    }
  },
  { immediate: true }
);

const report = async (success) => {
  if (success) await showSuccessDialog(store.message);
  else await showErrorDialog(store.message);
  return success;
};

const onProfile = async () => {
  const result = {};
  if (!name.value.value.trim()) result.name = "Nama wajib diisi.";
  if (!email.value.value.trim()) result.email = "Email wajib diisi.";
  profileErrors.value = result;
  if (Object.keys(result).length) return;
  await report(await store.changeProfile(name.value.value.trim(), email.value.value.trim()));
};

const onPhotoChange = (event) => {
  photo.value = event.target.files[0] || null;
  photoError.value = "";
};

const onPhoto = async () => {
  if (!photo.value) {
    photoError.value = "Pilih foto terlebih dahulu.";
    return;
  }
  await report(await store.changePhoto(photo.value));
};

const onPassword = async () => {
  const result = {};
  if (!current.value.value) result.current = "Kata sandi saat ini wajib diisi.";
  if (next.value.value.length < 6) result.next = "Kata sandi baru minimal 6 karakter.";
  if (confirmation.value.value !== next.value.value) result.confirmation = "Konfirmasi tidak sama.";
  passwordErrors.value = result;
  if (Object.keys(result).length) return;
  const success = await report(
    await store.changePassword(current.value.value, next.value.value, confirmation.value.value)
  );
  if (success) {
    current.reset();
    next.reset();
    confirmation.reset();
  }
};

const passwordFields = [
  { id: "password-current", key: "current", label: "Kata sandi saat ini", auto: "current-password", model: current },
  { id: "password-new", key: "next", label: "Kata sandi baru", auto: "new-password", model: next },
  { id: "password-confirmation", key: "confirmation", label: "Ulangi kata sandi baru", auto: "new-password", model: confirmation },
];
</script>

<template>
  <section aria-labelledby="profile-title" class="max-w-2xl">
    <h1 id="profile-title" class="text-3xl font-extrabold text-indigo-950">Profil Saya</h1>

    <div class="mt-6 space-y-6">
      <form class="rounded-2xl bg-white p-6 ring-1 ring-slate-200" novalidate @submit.prevent="onPhoto">
        <h2 class="text-lg font-bold text-slate-900">Foto profil</h2>
        <div class="mt-4 flex items-center gap-4">
          <img v-if="store.profile?.photo" :src="assetUrl(store.profile.photo)" alt="Foto profil saat ini" class="size-20 rounded-full bg-slate-200 object-cover" />
          <div class="flex-1">
            <label for="profile-photo" class="block text-sm font-semibold text-slate-800">Pilih berkas foto</label>
            <input id="profile-photo" type="file" accept="image/*" class="mt-1 block w-full text-sm text-slate-800" @change="onPhotoChange" />
            <p v-if="photoError" class="mt-1 text-sm text-red-700">{{ photoError }}</p>
          </div>
        </div>
        <button type="submit" :disabled="store.isPhotoChange" class="mt-4 rounded-lg bg-indigo-950 px-5 py-2.5 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70">
          {{ store.isPhotoChange ? "Mengunggah..." : "Unggah foto" }}
        </button>
      </form>

      <form class="rounded-2xl bg-white p-6 ring-1 ring-slate-200" novalidate @submit.prevent="onProfile">
        <h2 class="text-lg font-bold text-slate-900">Data akun</h2>
        <div class="mt-4 space-y-4">
          <div>
            <label for="profile-name" class="block text-sm font-semibold text-slate-800">Nama</label>
            <input id="profile-name" type="text" autocomplete="name" :value="name.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" @input="name.onChange" />
            <p v-if="profileErrors.name" class="mt-1 text-sm text-red-700">{{ profileErrors.name }}</p>
          </div>
          <div>
            <label for="profile-email" class="block text-sm font-semibold text-slate-800">Email</label>
            <input id="profile-email" type="email" autocomplete="email" :value="email.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" @input="email.onChange" />
            <p v-if="profileErrors.email" class="mt-1 text-sm text-red-700">{{ profileErrors.email }}</p>
          </div>
        </div>
        <button type="submit" :disabled="store.isProfileChange" class="mt-4 rounded-lg bg-indigo-950 px-5 py-2.5 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70">
          {{ store.isProfileChange ? "Menyimpan..." : "Simpan profil" }}
        </button>
      </form>

      <form class="rounded-2xl bg-white p-6 ring-1 ring-slate-200" novalidate @submit.prevent="onPassword">
        <h2 class="text-lg font-bold text-slate-900">Ganti kata sandi</h2>
        <div class="mt-4 space-y-4">
          <div v-for="field in passwordFields" :key="field.id">
            <label :for="field.id" class="block text-sm font-semibold text-slate-800">{{ field.label }}</label>
            <input :id="field.id" type="password" :autocomplete="field.auto" :value="field.model.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" @input="field.model.onChange" />
            <p v-if="passwordErrors[field.key]" class="mt-1 text-sm text-red-700">{{ passwordErrors[field.key] }}</p>
          </div>
        </div>
        <button type="submit" :disabled="store.isPasswordChange" class="mt-4 rounded-lg bg-indigo-950 px-5 py-2.5 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70">
          {{ store.isPasswordChange ? "Menyimpan..." : "Ganti kata sandi" }}
        </button>
      </form>
    </div>
  </section>
</template>
