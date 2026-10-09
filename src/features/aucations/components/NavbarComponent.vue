<script setup>
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { Gavel, LogOut, Menu } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { assetUrl, showConfirmDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits(["toggle-sidebar"]);
const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile || { name: "Memuat...", email: "" });
const photo = computed(() => assetUrl(profile.value.photo));

const onLogout = async () => {
  if (!(await showConfirmDialog("Kamu yakin ingin keluar dari akun?", "Ya, keluar"))) return;
  await authStore.logout();
  router.push("/auth/login");
};
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-indigo-900 bg-indigo-950 px-4 text-white">
    <div class="flex items-center gap-3">
      <button type="button" aria-label="Buka menu navigasi" class="rounded-lg p-2 hover:bg-indigo-900 lg:hidden" @click="emit('toggle-sidebar')">
        <Menu class="size-6" aria-hidden="true" />
      </button>
      <RouterLink to="/" class="flex items-center gap-2 text-lg font-bold">
        <Gavel class="size-6 text-amber-400" aria-hidden="true" />
        Delcom Auction
      </RouterLink>
    </div>

    <div class="flex items-center gap-3">
      <RouterLink to="/profile" class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-indigo-900">
        <img v-if="photo" :src="photo" alt="" class="size-8 rounded-full object-cover" />
        <span class="hidden max-w-40 truncate text-sm font-semibold sm:inline" data-testid="navbar-name">{{ profile.name }}</span>
      </RouterLink>
      <button type="button" class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-indigo-900" @click="onLogout">
        <LogOut class="size-4" aria-hidden="true" />
        Keluar
      </button>
    </div>
  </header>
</template>
