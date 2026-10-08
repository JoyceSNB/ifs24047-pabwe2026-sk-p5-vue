<template>
  <div
    class="min-h-screen bg-slate-50"
  >
    <NavbarComponent
      @toggle-sidebar="
        sidebarOpen = !sidebarOpen
      "
    />

    <SidebarComponent
      :is-sidebar-open="sidebarOpen"
      @close-mobile="
        sidebarOpen = false
      "
    />

    <main
      class="min-h-screen pt-16 md:ml-64"
    >
      <div
        class="min-h-[calc(100vh-4rem)]"
      >
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import {
  ref,
} from "vue";

import NavbarComponent from "../components/NavbarComponent.vue";

import SidebarComponent from "../components/SidebarComponent.vue";

const sidebarOpen =
  ref(false);
</script>