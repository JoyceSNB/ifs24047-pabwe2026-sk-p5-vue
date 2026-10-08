import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/vue";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import UsersPage from "./UsersPage.vue";

import {
  useUsersStore,
} from "../states/usersStore";

describe(
  "UsersPage",
  () => {
    let pinia;
    let store;

    beforeEach(() => {
      vi.restoreAllMocks();

      pinia =
        createPinia();

      setActivePinia(
        pinia,
      );

      store =
        useUsersStore();

      vi
        .spyOn(
          store,
          "fetchUsers",
        )
        .mockResolvedValue();
    });

    function renderPage() {
      return render(
        UsersPage,
        {
          global: {
            plugins: [
              pinia,
            ],
          },
        },
      );
    }

    it(
      "renders page title",
      () => {
        renderPage();

        expect(
          screen.getByRole(
            "heading",
            {
              name:
                "Daftar Pengguna",
            },
          ),
        ).toBeTruthy();
      },
    );

    it(
      "calls fetchUsers when page is mounted",
      () => {
        renderPage();

        expect(
          store.fetchUsers,
        ).toHaveBeenCalledTimes(
          1,
        );
      },
    );

    it(
      "renders users with their names and usernames",
      () => {
        store.users = [
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

        renderPage();

        expect(
          screen.getByText(
            "Budi",
          ),
        ).toBeTruthy();

        expect(
          screen.getByText(
            "@budi123",
          ),
        ).toBeTruthy();

        expect(
          screen.getByText(
            "Siti",
          ),
        ).toBeTruthy();

        expect(
          screen.getByText(
            "@siti123",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "uses username when user name is missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "",
            username:
              "budi123",
          },
        ];

        renderPage();

        expect(
          screen.getByText(
            "budi123",
          ),
        ).toBeTruthy();

        expect(
          screen.getByText(
            "@budi123",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "renders email when username is missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "Budi",
            username: "",
            email:
              "budi@example.com",
          },
        ];

        renderPage();

        expect(
          screen.getByText(
            "Budi",
          ),
        ).toBeTruthy();

        expect(
          screen.getByText(
            "budi@example.com",
          ),
        ).toBeTruthy();

        expect(
          screen.queryByText(
            "@",
          ),
        ).toBeNull();
      },
    );

    it(
      "uses email when username is missing even when name is empty",
      () => {
        store.users = [
          {
            id: 1,
            name: "",
            username: "",
            email:
              "anonymous@example.com",
          },
        ];

        renderPage();

        expect(
          screen.getByText(
            "anonymous@example.com",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "renders fallback user name when name and username are missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "",
            username: "",
            email: "",
          },
        ];

        renderPage();

        expect(
          screen.getAllByText(
            "Pengguna",
          ).length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "renders an empty user list without user cards",
      () => {
        store.users = [];

        renderPage();

        expect(
          screen.queryByText(
            "@budi123",
          ),
        ).toBeNull();

        expect(
          screen.queryByText(
            "budi@example.com",
          ),
        ).toBeNull();
      },
    );

    it(
      "uses photo when user photo exists",
      () => {
        store.users = [
          {
            id: 1,
            name: "Budi",
            username:
              "budi123",
            photo:
              "https://example.com/budi.jpg",
          },
        ];

        renderPage();

        const image =
          screen.getByRole(
            "img",
          );

        expect(
          image.getAttribute(
            "src",
          ),
        ).toBe(
          "https://example.com/budi.jpg",
        );

        expect(
          image.getAttribute(
            "alt",
          ),
        ).toBe(
          "Budi",
        );
      },
    );

    it(
      "generates avatar URL when user photo is missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "Budi Santoso",
            username:
              "budi123",
            photo: "",
          },
        ];

        renderPage();

        const image =
          screen.getByRole(
            "img",
          );

        expect(
          image.getAttribute(
            "src",
          ),
        ).toContain(
          "https://ui-avatars.com/api/?name=",
        );

        expect(
          image.getAttribute(
            "src",
          ),
        ).toContain(
          "Budi%20Santoso",
        );
      },
    );

    it(
      "uses username for generated avatar when name is missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "",
            username:
              "budi123",
            photo: "",
          },
        ];

        renderPage();

        const image =
          screen.getByRole(
            "img",
          );

        expect(
          image.getAttribute(
            "src",
          ),
        ).toContain(
          "budi123",
        );

        expect(
          image.getAttribute(
            "alt",
          ),
        ).toBe(
          "budi123",
        );
      },
    );

    it(
      "uses Pengguna for generated avatar when name and username are missing",
      () => {
        store.users = [
          {
            id: 1,
            name: "",
            username: "",
            photo: "",
          },
        ];

        renderPage();

        const image =
          screen.getByRole(
            "img",
          );

        expect(
          image.getAttribute(
            "src",
          ),
        ).toContain(
          "Pengguna",
        );

        expect(
          image.getAttribute(
            "alt",
          ),
        ).toBe(
          "Pengguna",
        );
      },
    );
  },
);