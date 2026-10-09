<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { Gavel, LayoutDashboard, UserRound, Users } from "lucide-vue-next";

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);
const route = useRoute();

const items = [
  { label: "Dashboard Lelang", to: "/", icon: LayoutDashboard },
  { label: "Lelang Saya", to: "/?tab=mine", icon: Gavel },
  { label: "Daftar Pengguna", to: "/users", icon: Users },
  { label: "Profil Saya", to: "/profile", icon: UserRound },
];

const links = computed(() =>
  items.map((item) => ({ ...item, active: route.fullPath === item.to }))
);
</script>

<template>
  <div>
    <button v-if="open" type="button" aria-label="Tutup menu navigasi" class="fixed inset-0 top-16 z-30 bg-slate-900/50 lg:hidden" @click="emit('close')"></button>
    <aside
      :class="[open ? 'flex' : 'hidden', 'fixed bottom-0 left-0 top-16 z-40 w-64 flex-col border-r border-slate-300 bg-white p-4 lg:flex']"
      data-testid="sidebar"
    >
      <nav aria-label="Navigasi utama">
        <ul class="space-y-1">
          <li v-for="item in links" :key="item.to">
            <RouterLink
              :to="item.to"
              :aria-current="item.active ? 'page' : undefined"
              :class="[item.active ? 'bg-indigo-950 text-white' : 'text-slate-800 hover:bg-slate-100', 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold']"
              @click="emit('close')"
            >
              <component :is="item.icon" class="size-5" aria-hidden="true" />
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
