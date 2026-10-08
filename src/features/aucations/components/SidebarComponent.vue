<template>
  <div>
    <div
      v-if="isSidebarOpen"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      @click="$emit('close-mobile')"
    ></div>

    <aside
      class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-4 transition-transform md:translate-x-0"
      :class="
        isSidebarOpen
          ? 'translate-x-0'
          : '-translate-x-full'
      "
    >
      <div class="mb-6 px-3">
        <p
          class="text-xs font-bold uppercase tracking-wider text-slate-400"
        >
          Menu Utama
        </p>

        <p
          class="mt-2 text-sm font-extrabold text-indigo-700"
        >
          Delcom Auction
        </p>

        <p
          class="mt-1 text-xs font-semibold text-slate-500"
        >
          Praktikum 5 PABWE
        </p>
      </div>

      <nav class="space-y-1">
        <RouterLink
          to="/"
          data-testid="nav-dashboard"
          class="block px-3 py-2.5 rounded-xl text-sm font-semibold"
          :class="
            isDashboardActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          "
          @click="$emit('close-mobile')"
        >
          Dashboard Lelang
        </RouterLink>

        <RouterLink
          :to="{
            path: '/',
            query: {
              tab: 'me',
            },
          }"
          data-testid="nav-mine"
          class="block px-3 py-2.5 rounded-xl text-sm font-semibold"
          :class="
            isMineActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          "
          @click="$emit('close-mobile')"
        >
          Lelang Saya
        </RouterLink>

        <RouterLink
          to="/users"
          data-testid="nav-users"
          class="block px-3 py-2.5 rounded-xl text-sm font-semibold"
          :class="
            isUsersActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          "
          @click="$emit('close-mobile')"
        >
          Daftar Pengguna
        </RouterLink>

        <RouterLink
          to="/profile"
          data-testid="nav-profile"
          class="block px-3 py-2.5 rounded-xl text-sm font-semibold"
          :class="
            isProfileActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          "
          @click="$emit('close-mobile')"
        >
          Profil Saya
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import {
  computed,
} from "vue";

import {
  RouterLink,
  useRoute,
} from "vue-router";

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "close-mobile",
]);

const route = useRoute();

const isDashboardActive =
  computed(() => {
    if (route.path === "/") {
      return route.query.tab !== "me";
    }

    return route.path.startsWith(
      "/aucations/",
    );
  });

const isMineActive =
  computed(() => {
    return (
      route.path === "/" &&
      route.query.tab === "me"
    );
  });

const isUsersActive =
  computed(() => {
    return route.path.startsWith(
      "/users",
    );
  });

const isProfileActive =
  computed(() => {
    return route.path.startsWith(
      "/profile",
    );
  });
</script>