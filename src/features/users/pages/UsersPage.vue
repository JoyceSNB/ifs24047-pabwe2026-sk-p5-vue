<script setup>
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { assetUrl } from "../../../helpers/toolsHelper";

const store = useUsersStore();
onMounted(() => store.fetchUsers());
</script>

<template>
  <section aria-labelledby="users-title">
    <h1 id="users-title" class="text-3xl font-extrabold text-indigo-950">Daftar Pengguna</h1>
    <p class="mt-1 text-slate-700">Peserta yang terdaftar di Delcom Auction.</p>

    <p v-if="store.isUsers" role="status" class="mt-10 text-slate-700">Memuat pengguna...</p>
    <p v-else-if="!store.users.length" class="mt-10 rounded-xl border border-dashed border-slate-400 p-10 text-center text-slate-700">
      Belum ada pengguna.
    </p>
    <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="user-list">
      <li v-for="user in store.users" :key="user.id" class="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <img v-if="user.photo" :src="assetUrl(user.photo)" alt="" class="size-14 rounded-full bg-slate-200 object-cover" loading="lazy" />
        <span v-else class="flex size-14 items-center justify-center rounded-full bg-indigo-950 text-xl font-bold text-white" aria-hidden="true">{{ user.name.charAt(0) }}</span>
        <div class="min-w-0">
          <h2 class="truncate font-bold text-slate-900">{{ user.name }}</h2>
          <p class="truncate text-sm text-slate-700">{{ user.email }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
