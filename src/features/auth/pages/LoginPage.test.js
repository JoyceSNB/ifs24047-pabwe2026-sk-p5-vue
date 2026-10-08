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
  waitFor,
} from "@testing-library/vue";

import {
  createRouter,
  createMemoryHistory,
} from "vue-router";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import LoginPage from "./LoginPage.vue";

import { useAuthStore } from "../states/authStore";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
}));

import * as toolsHelper from "../../../helpers/toolsHelper";

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/auth/login",
        component: {
          template: "<div>Login</div>",
        },
      },
      {
        path: "/auth/register",
        component: {
          template: "<div>Register</div>",
        },
      },
      {
        path: "/",
        component: {
          template: "<div>Dashboard</div>",
        },
      },
    ],
  });
}

async function renderLoginPage() {
  const pinia = createPinia();

  setActivePinia(pinia);

  const router = createTestRouter();

  await router.push("/auth/login");
  await router.isReady();

  const result = render(LoginPage, {
    global: {
      plugins: [
        pinia,
        router,
      ],
    },
  });

  return {
    ...result,
    pinia,
    router,
    auth: useAuthStore(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("renders login form", async () => {
    await renderLoginPage();

    expect(
      screen.getByText(
        "Masuk ke Delcom Auction",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Username",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Password",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Masuk",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Daftar",
      }),
    ).toHaveAttribute(
      "href",
      "/auth/register",
    );
  });

  it("shows error when username and password are empty", async () => {
    await renderLoginPage();

    await fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      }),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Username dan password wajib diisi",
    );
  });

  it("shows error when username is empty", async () => {
    const context =
      await renderLoginPage();

    const signInSpy = vi.spyOn(
      context.auth,
      "signIn",
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Password",
      ),
      "password123",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Username dan password wajib diisi",
    );

    expect(
      signInSpy,
    ).not.toHaveBeenCalled();
  });

  it("shows error when password is empty", async () => {
    const context =
      await renderLoginPage();

    const signInSpy = vi.spyOn(
      context.auth,
      "signIn",
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Username",
      ),
      "budi",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Username dan password wajib diisi",
    );

    expect(
      signInSpy,
    ).not.toHaveBeenCalled();
  });

  it("logs in successfully and navigates to dashboard", async () => {
    const context =
      await renderLoginPage();

    const signInSpy = vi
      .spyOn(context.auth, "signIn")
      .mockResolvedValue({
        data: {
          token: "token-123",
          user: {
            id: 1,
            name: "Budi",
          },
        },
      });

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Username",
      ),
      "budi",
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Password",
      ),
      "password123",
    );

    await fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      }),
    );

    await waitFor(() => {
      expect(
        signInSpy,
      ).toHaveBeenCalledWith(
        "budi",
        "password123",
      );
    });

    await waitFor(() => {
      expect(
        context.router.currentRoute.value.path,
      ).toBe("/");
    });

    expect(
      toolsHelper.showErrorDialog,
    ).not.toHaveBeenCalled();
  });

  it("shows processing state while login is pending", async () => {
    const context =
      await renderLoginPage();

    let resolveLogin;

    const pendingLogin =
      new Promise((resolve) => {
        resolveLogin = resolve;
      });

    const signInSpy = vi
      .spyOn(context.auth, "signIn")
      .mockReturnValue(
        pendingLogin,
      );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Username",
      ),
      "budi",
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Password",
      ),
      "password123",
    );

    await fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      }),
    );

    await waitFor(() => {
      expect(
        signInSpy,
      ).toHaveBeenCalledWith(
        "budi",
        "password123",
      );
    });

    expect(
      screen.getByRole("button", {
        name: "Memproses...",
      }),
    ).toBeDisabled();

    resolveLogin({
      data: {
        token: "token-123",
        user: {
          id: 1,
          name: "Budi",
        },
      },
    });

    await waitFor(() => {
      expect(
        context.router.currentRoute.value.path,
      ).toBe("/");
    });
  });

  it("shows API error when login fails", async () => {
    const context =
      await renderLoginPage();

    const signInError =
      new Error(
        "Username atau password salah",
      );

    vi.spyOn(
      context.auth,
      "signIn",
    ).mockRejectedValue(
      signInError,
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Username",
      ),
      "budi",
    );

    await fireEvent.update(
      screen.getByPlaceholderText(
        "Password",
      ),
      "wrong-password",
    );

    await fireEvent.click(
      screen.getByRole("button", {
        name: "Masuk",
      }),
    );

    await waitFor(() => {
      expect(
        toolsHelper.showErrorDialog,
      ).toHaveBeenCalledWith(
        "Username atau password salah",
      );
    });

    expect(
      context.router.currentRoute.value.path,
    ).toBe("/auth/login");
  });
});