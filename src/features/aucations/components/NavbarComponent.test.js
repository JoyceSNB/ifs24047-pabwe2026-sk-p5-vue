import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/vue";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import {
  createRouter,
  createMemoryHistory,
} from "vue-router";

import NavbarComponent from "./NavbarComponent.vue";

import {
  useAuthStore,
} from "../../auth/states/authStore";

function createTestRouter() {
  const router =
    createRouter({
      history:
        createMemoryHistory(),

      routes: [
        {
          path: "/",
          component: {
            template:
              "<div>Home</div>",
          },
        },

        {
          path: "/auth/login",
          component: {
            template:
              "<div>Login</div>",
          },
        },

        {
          path: "/profile",
          component: {
            template:
              "<div>Profile</div>",
          },
        },
      ],
    });

  return router;
}

function renderNavbar(
  user = null,
) {
  const pinia =
    createPinia();

  setActivePinia(
    pinia,
  );

  const auth =
    useAuthStore();

  auth.user = user;

  const router =
    createTestRouter();

  return render(
    NavbarComponent,
    {
      global: {
        plugins: [
          pinia,
          router,
        ],
      },
    },
  );
}

describe(
  "NavbarComponent",
  () => {
    beforeEach(() => {
      vi.restoreAllMocks();

      localStorage.clear();
    });

    it(
      "renders brand",
      () => {
        renderNavbar();

        expect(
          screen.getByText(
            "Delcom Auction",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "renders user name when user has name",
      () => {
        renderNavbar({
          name: "Budi",
          username: "budi123",
        });

        expect(
          screen.getByText(
            "Budi",
          ),
        ).toBeTruthy();

        expect(
          screen.queryByText(
            "budi123",
          ),
        ).toBeNull();
      },
    );

    it(
      "uses username when user has no name",
      () => {
        renderNavbar({
          username:
            "budi123",
        });

        expect(
          screen.getByText(
            "budi123",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "uses default user name when user is null",
      () => {
        renderNavbar(null);

        expect(
          screen.getByText(
            "Pengguna",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "uses default user name when user is undefined",
      () => {
        renderNavbar(
          undefined,
        );

        expect(
          screen.getByText(
            "Pengguna",
          ),
        ).toBeTruthy();
      },
    );

    it(
      "emits toggle-sidebar when mobile menu button is clicked",
      async () => {
        const pinia =
          createPinia();

        setActivePinia(
          pinia,
        );

        const router =
          createTestRouter();

        const {
          emitted,
        } =
          render(
            NavbarComponent,
            {
              global: {
                plugins: [
                  pinia,
                  router,
                ],
              },
            },
          );

        const menuButton =
          screen.getByTestId(
            "toggle-sidebar-btn",
          );

        expect(
          menuButton,
        ).toBeTruthy();

        await fireEvent.click(
          menuButton,
        );

        expect(
          emitted(
            "toggle-sidebar",
          ),
        ).toBeTruthy();

        expect(
          emitted(
            "toggle-sidebar",
          ),
        ).toHaveLength(1);
      },
    );

    it(
      "calls auth logout when Keluar is clicked",
      async () => {
        const pinia =
          createPinia();

        setActivePinia(
          pinia,
        );

        const auth =
          useAuthStore();

        auth.user = {
          name: "Budi",
        };

        const logoutSpy =
          vi.spyOn(
            auth,
            "logout",
          );

        const router =
          createTestRouter();

        const pushSpy =
          vi.spyOn(
            router,
            "push",
          );

        render(
          NavbarComponent,
          {
            global: {
              plugins: [
                pinia,
                router,
              ],
            },
          },
        );

        await fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Keluar",
            },
          ),
        );

        expect(
          logoutSpy,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          pushSpy,
        ).toHaveBeenCalledWith(
          "/auth/login",
        );
      },
    );

    it(
      "clears authentication state after logout",
      async () => {
        const pinia =
          createPinia();

        setActivePinia(
          pinia,
        );

        const auth =
          useAuthStore();

        auth.token =
          "test-token";

        auth.user = {
          name: "Budi",
        };

        const router =
          createTestRouter();

        render(
          NavbarComponent,
          {
            global: {
              plugins: [
                pinia,
                router,
              ],
            },
          },
        );

        await fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: "Keluar",
            },
          ),
        );

        expect(
          auth.token,
        ).toBeNull();

        expect(
          auth.user,
        ).toBeNull();
      },
    );

    it(
      "renders logout button",
      () => {
        renderNavbar({
          name: "Budi",
        });

        expect(
          screen.getByRole(
            "button",
            {
              name: "Keluar",
            },
          ),
        ).toBeTruthy();
      },
    );
  },
);