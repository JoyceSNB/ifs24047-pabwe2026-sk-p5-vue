import { defineStore } from "pinia";

import {
  getUsers,
  getUser,
  updateUser,
} from "../api/userApi";

export const useUsersStore = defineStore(
  "users",
  {
    state: () => ({
      users: [],
      user: null,
      loading: false,
    }),

    actions: {
      async fetchUsers(params = {}) {
        this.loading = true;

        try {
          const response =
            await getUsers(params);

          const data =
            response?.data;

          if (Array.isArray(data)) {
            this.users = data;
          } else if (
            Array.isArray(data?.users)
          ) {
            this.users = data.users;
          } else if (
            Array.isArray(
              response?.users,
            )
          ) {
            this.users = response.users;
          } else {
            this.users = [];
          }

          return response;
        } finally {
          this.loading = false;
        }
      },

      async fetchUser(id) {
        const response =
          await getUser(id);

        if (
          response?.data !== undefined
        ) {
          this.user =
            response.data;
        } else if (
          response?.user !== undefined
        ) {
          this.user =
            response.user;
        } else {
          this.user =
            response;
        }

        return response;
      },

      async saveUser(id, body) {
        return updateUser(
          id,
          body,
        );
      },
    },
  },
);