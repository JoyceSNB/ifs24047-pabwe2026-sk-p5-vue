<template>
  <div class="p-6">
    <h1
      class="text-2xl font-bold mb-4 text-gray-800"
    >
      Daftar Pengguna
    </h1>

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div
        v-for="user in store.users"
        :key="user.id"
        class="p-4 border rounded-lg bg-white shadow flex items-center gap-4"
      >
        <img
          class="w-12 h-12 rounded-full object-cover"
          :src="
            user.photo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name ||
                user.username ||
                'Pengguna',
            )}`
          "
          :alt="
            user.name ||
            user.username ||
            'Pengguna'
          "
        />

        <div>
          <p class="font-semibold">
            {{
              user.name ||
              user.username ||
              "Pengguna"
            }}
          </p>

          <p
            v-if="user.username"
            class="text-sm text-gray-500"
          >
            @{{ user.username }}
          </p>

          <p
            v-else-if="user.email"
            class="text-sm text-gray-500"
          >
            {{ user.email }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

import { useUsersStore } from "../states/usersStore";

const store = useUsersStore();

onMounted(() => {
  store.fetchUsers();
});
</script>