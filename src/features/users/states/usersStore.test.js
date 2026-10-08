import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import {
  useUsersStore,
} from "./usersStore";

import {
  getUsers,
  getUser,
  updateUser,
} from "../api/userApi";

vi.mock(
  "../api/userApi",
  () => ({
    getUsers: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
  }),
);

describe(
  "usersStore",
  () => {
    let store;

    beforeEach(() => {
      vi.clearAllMocks();

      setActivePinia(
        createPinia(),
      );

      store =
        useUsersStore();
    });

    it(
      "has the correct initial state",
      () => {
        expect(
          store.users,
        ).toEqual([]);

        expect(
          store.user,
        ).toBeNull();

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "fetches users and stores response.data when it is an array",
      async () => {
        const users = [
          {
            id: 1,
            name: "Budi",
          },
          {
            id: 2,
            name: "Siti",
          },
        ];

        const response = {
          data: users,
        };

        getUsers.mockResolvedValue(
          response,
        );

        const result =
          await store.fetchUsers(
            {
              page: 1,
            },
          );

        expect(
          getUsers,
        ).toHaveBeenCalledWith(
          {
            page: 1,
          },
        );

        expect(
          store.users,
        ).toEqual(users);

        expect(
          result,
        ).toBe(response);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "fetches users and stores response.data.users when nested users is an array",
      async () => {
        const users = [
          {
            id: 1,
            name: "Budi",
            username:
              "budi123",
          },
          {
            id: 2,
            name: "Siti",
            username:
              "siti123",
          },
        ];

        const response = {
          data: {
            users,
          },
        };

        getUsers.mockResolvedValue(
          response,
        );

        const result =
          await store.fetchUsers();

        expect(
          getUsers,
        ).toHaveBeenCalledWith(
          {},
        );

        expect(
          store.users,
        ).toEqual(users);

        expect(
          result,
        ).toBe(response);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "fetches users and stores response.users when it is an array",
      async () => {
        const users = [
          {
            id: 1,
            name: "Budi",
          },
        ];

        const response = {
          users,
        };

        getUsers.mockResolvedValue(
          response,
        );

        await store.fetchUsers();

        expect(
          store.users,
        ).toEqual(users);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "stores an empty array when users response has no supported shape",
      async () => {
        store.users = [
          {
            id: 99,
            name: "Old User",
          },
        ];

        const response = {
          data: {
            invalid: true,
          },
        };

        getUsers.mockResolvedValue(
          response,
        );

        await store.fetchUsers();

        expect(
          store.users,
        ).toEqual([]);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "sets loading to false when fetchUsers fails",
      async () => {
        const error =
          new Error(
            "Failed to fetch users",
          );

        getUsers.mockRejectedValue(
          error,
        );

        await expect(
          store.fetchUsers(),
        ).rejects.toThrow(
          "Failed to fetch users",
        );

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "fetches a user and stores response.data",
      async () => {
        const user = {
          id: 1,
          name: "Budi",
        };

        const response = {
          data: user,
        };

        getUser.mockResolvedValue(
          response,
        );

        const result =
          await store.fetchUser(
            1,
          );

        expect(
          getUser,
        ).toHaveBeenCalledWith(
          1,
        );

        expect(
          store.user,
        ).toEqual(user);

        expect(
          result,
        ).toBe(response);
      },
    );

    it(
      "fetches a user and stores response.user",
      async () => {
        const user = {
          id: 2,
          name: "Siti",
        };

        const response = {
          user,
        };

        getUser.mockResolvedValue(
          response,
        );

        await store.fetchUser(
          2,
        );

        expect(
          getUser,
        ).toHaveBeenCalledWith(
          2,
        );

        expect(
          store.user,
        ).toEqual(user);
      },
    );

    it(
      "fetches a user and stores the raw response when no nested user exists",
      async () => {
        const response = {
          id: 3,
          name: "Andi",
        };

        getUser.mockResolvedValue(
          response,
        );

        await store.fetchUser(
          3,
        );

        expect(
          getUser,
        ).toHaveBeenCalledWith(
          3,
        );

        expect(
          store.user,
        ).toEqual(response);
      },
    );

    it(
      "saves a user",
      async () => {
        const body = {
          name: "Budi Updated",
          email:
            "budi@example.com",
        };

        const response = {
          data: {
            id: 1,
            ...body,
          },
        };

        updateUser.mockResolvedValue(
          response,
        );

        const result =
          await store.saveUser(
            1,
            body,
          );

        expect(
          updateUser,
        ).toHaveBeenCalledWith(
          1,
          body,
        );

        expect(
          result,
        ).toBe(response);
      },
    );
  },
);