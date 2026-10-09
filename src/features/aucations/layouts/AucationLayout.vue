<script setup>
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";

const usersStore = useUsersStore();
const isSidebarOpen = ref(false);

onMounted(() => usersStore.fetchProfile());
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />
    <main id="main" class="px-4 py-8 sm:px-8 lg:ml-64">
      <RouterView />
    </main>
  </div>
</template>
