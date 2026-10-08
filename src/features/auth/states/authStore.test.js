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

import { useAuthStore } from "./authStore";

import {
  login,
  register,
} from "../api/authApi";

import {
  getAccessToken,
  putAccessToken,
} from "../../../helpers/apiHelper";

vi.mock("../api/authApi", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("../../../helpers/apiHelper", () => ({
  getAccessToken: vi.fn(),
  putAccessToken: vi.fn(),
}));

describe("authStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    getAccessToken.mockReturnValue(null);

    setActivePinia(createPinia());
  });

  it("initializes with token from local storage", () => {
    getAccessToken.mockReturnValue("stored-token");

    const store = useAuthStore();

    expect(store.token).toBe("stored-token");
    expect(store.user).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.isAuthenticated).toBe(true);
  });

  it("initializes with stored user", () => {
    localStorage.setItem(
      "delcom_user",
      JSON.stringify({
        id: 1,
        name: "Budi",
      }),
    );

    const store = useAuthStore();

    expect(store.user).toEqual({
      id: 1,
      name: "Budi",
    });
    expect(store.isAuthenticated).toBe(false);
  });

  it("reports authenticated when token exists", () => {
    getAccessToken.mockReturnValue("token-123");

    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(true);
  });

  it("reports unauthenticated when token does not exist", () => {
    getAccessToken.mockReturnValue(null);

    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(false);
  });

  it("signs in using token and user from response.data", async () => {
    const response = {
      data: {
        token: "token-data",
        user: {
          id: 10,
          name: "Budi",
        },
      },
    };

    login.mockResolvedValue(response);

    const store = useAuthStore();

    expect(store.loading).toBe(false);

    const result = await store.signIn(
      "budi",
      "password123",
    );

    expect(login).toHaveBeenCalledWith(
      "budi",
      "password123",
    );

    expect(result).toBe(response);

    expect(store.token).toBe("token-data");

    expect(store.user).toEqual({
      id: 10,
      name: "Budi",
    });

    expect(store.loading).toBe(false);

    expect(putAccessToken).toHaveBeenCalledWith(
      "token-data",
    );

    expect(
      localStorage.getItem("delcom_user"),
    ).toBe(
      JSON.stringify({
        id: 10,
        name: "Budi",
      }),
    );
  });

  it("signs in using fallback token and user from response root", async () => {
    const response = {
      token: "token-root",
      user: {
        id: 20,
        name: "Siti",
      },
    };

    login.mockResolvedValue(response);

    const store = useAuthStore();

    const result = await store.signIn(
      "siti",
      "password456",
    );

    expect(result).toBe(response);

    expect(store.token).toBe("token-root");

    expect(store.user).toEqual({
      id: 20,
      name: "Siti",
    });

    expect(putAccessToken).toHaveBeenCalledWith(
      "token-root",
    );

    expect(
      localStorage.getItem("delcom_user"),
    ).toBe(
      JSON.stringify({
        id: 20,
        name: "Siti",
      }),
    );
  });

  it("signs in with null token and null user when response contains neither", async () => {
    const response = {};

    login.mockResolvedValue(response);

    const store = useAuthStore();

    const result = await store.signIn(
      "unknown",
      "password",
    );

    expect(result).toBe(response);

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.loading).toBe(false);

    expect(putAccessToken).toHaveBeenCalledWith(
      null,
    );

    expect(
      localStorage.getItem("delcom_user"),
    ).toBeNull();
  });

  it("does not store user when sign in response has no user", async () => {
    const response = {
      token: "token-only",
    };

    login.mockResolvedValue(response);

    const store = useAuthStore();

    await store.signIn(
      "user",
      "password",
    );

    expect(store.token).toBe("token-only");
    expect(store.user).toBeNull();

    expect(
      localStorage.getItem("delcom_user"),
    ).toBeNull();
  });

  it("clears loading state when sign in succeeds", async () => {
    let resolveLogin;

    const loginPromise = new Promise(
      (resolve) => {
        resolveLogin = resolve;
      },
    );

    login.mockReturnValue(loginPromise);

    const store = useAuthStore();

    const signInPromise = store.signIn(
      "budi",
      "password",
    );

    expect(store.loading).toBe(true);

    resolveLogin({
      data: {
        token: "token",
        user: {
          id: 1,
          name: "Budi",
        },
      },
    });

    await signInPromise;

    expect(store.loading).toBe(false);
  });

  it("clears loading state when sign in fails", async () => {
    const error = new Error(
      "Login gagal",
    );

    login.mockRejectedValue(error);

    const store = useAuthStore();

    await expect(
      store.signIn(
        "budi",
        "wrong-password",
      ),
    ).rejects.toThrow(
      "Login gagal",
    );

    expect(store.loading).toBe(false);
  });

  it("signs up by calling register API", async () => {
    const response = {
      message: "Registrasi berhasil",
    };

    register.mockResolvedValue(response);

    const store = useAuthStore();

    const result = await store.signUp(
      "budi",
      "password123",
      "Budi",
    );

    expect(register).toHaveBeenCalledWith(
      "budi",
      "password123",
      "Budi",
    );

    expect(result).toBe(response);
  });

  it("propagates sign up error", async () => {
    register.mockRejectedValue(
      new Error("Username sudah digunakan"),
    );

    const store = useAuthStore();

    await expect(
      store.signUp(
        "budi",
        "password123",
        "Budi",
      ),
    ).rejects.toThrow(
      "Username sudah digunakan",
    );
  });

  it("logs out and clears authentication data", () => {
    getAccessToken.mockReturnValue(
      "existing-token",
    );

    localStorage.setItem(
      "delcom_user",
      JSON.stringify({
        id: 1,
        name: "Budi",
      }),
    );

    const store = useAuthStore();

    expect(store.isAuthenticated).toBe(true);

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();

    expect(
      putAccessToken,
    ).toHaveBeenCalledWith(null);

    expect(
      localStorage.getItem("delcom_user"),
    ).toBeNull();

    expect(store.isAuthenticated).toBe(false);
  });
});