<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 text-white shadow-md"
  >
    <div
      class="h-full px-4 md:px-6 flex items-center justify-between"
    >
      <!-- Left -->
      <div
        class="flex items-center gap-3"
      >
        <!-- Mobile menu -->
        <button
          type="button"
          aria-label="Buka menu"
          data-testid="toggle-sidebar-btn"
          class="md:hidden w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          @click="$emit('toggle-sidebar')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Brand -->
        <RouterLink
          to="/"
          class="flex items-center gap-2.5"
        >
          <div
            class="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
          >
            <img
              src="/logo.svg"
              alt="Delcom Auction"
              class="w-7 h-7"
            />
          </div>

          <span
            class="font-extrabold text-base md:text-lg tracking-tight"
          >
            Delcom Auction
          </span>
        </RouterLink>
      </div>

      <!-- Right -->
      <div
        class="flex items-center gap-2 md:gap-3"
      >
        <!-- Profile -->
        <RouterLink
          to="/profile"
          data-testid="profile-navbar-link"
          title="Buka Profil Saya"
          class="group flex items-center gap-2 rounded-xl px-2.5 md:px-3 py-2 bg-white/10 hover:bg-white/20 transition"
        >
          <div
            class="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden shrink-0"
          >
            <span
              class="text-xs font-bold uppercase"
            >
              {{ userInitial }}
            </span>
          </div>

          <div
            class="hidden sm:block text-left leading-tight"
          >
            <p
              class="text-sm font-bold whitespace-nowrap"
            >
              {{ displayName }}
            </p>
          </div>
        </RouterLink>

        <!-- Logout -->
        <button
          type="button"
          data-testid="logout-btn"
          class="flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 px-3 md:px-4 py-2 text-sm font-bold shadow-sm transition"
          @click="handleLogout"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <path
              d="M18 15l3-3m0 0l-3-3m3 3H9"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span
            class="hidden sm:inline"
          >
            Keluar
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import {
  computed,
} from "vue";

import {
  RouterLink,
  useRouter,
} from "vue-router";

import {
  useAuthStore,
} from "../../auth/states/authStore";

defineEmits([
  "toggle-sidebar",
]);

const auth =
  useAuthStore();

const router =
  useRouter();

const displayName =
  computed(() => {
    return (
      auth.user?.name ||
      auth.user?.username ||
      "Pengguna"
    );
  });

const userInitial =
  computed(() => {
    return displayName.value
      .charAt(0)
      .toUpperCase();
  });

async function handleLogout() {
  auth.logout();

  await router.push(
    "/auth/login",
  );
}
</script>