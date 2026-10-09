import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "./authStore";
import * as authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi");

describe("authStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("state awal membaca token dari localStorage", () => {
    putAccessToken("lama");
    const store = useAuthStore();
    expect(store.token).toBe("lama");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login sukses menyimpan token", async () => {
    authApi.login.mockResolvedValue({ status: "success", message: "ok", data: { token: "t1" } });
    const store = useAuthStore();
    expect(await store.login("a", "b")).toBe(true);
    expect(store.token).toBe("t1");
    expect(getAccessToken()).toBe("t1");
    expect(store.isAuthLogin).toBe(false);
  });

  it("login gagal menyimpan pesan dan error validasi", async () => {
    authApi.login.mockResolvedValue({ status: "fail", message: "salah", data: { field: { email: ["x"] } } });
    const store = useAuthStore();
    expect(await store.login("a", "b")).toBe(false);
    expect(store.message).toBe("salah");
    expect(store.errors).toEqual({ email: ["x"] });
    expect(store.isAuthenticated).toBe(false);
  });

  it("login gagal tanpa data field", async () => {
    authApi.login.mockResolvedValue({ status: "fail", message: "Kredensial akun tidak ditemukan" });
    const store = useAuthStore();
    await store.login("a", "b");
    expect(store.errors).toEqual({});
  });

  it("register", async () => {
    authApi.register.mockResolvedValue({ status: "success", message: "daftar" });
    const store = useAuthStore();
    expect(await store.register("n", "e", "p")).toBe(true);
    expect(store.isAuthRegister).toBe(false);
    authApi.register.mockResolvedValue({ status: "fail", message: "dobel" });
    expect(await store.register("n", "e", "p")).toBe(false);
  });

  it("logout selalu membersihkan token lokal", async () => {
    putAccessToken("t");
    authApi.logout.mockResolvedValue({ status: "fail", message: "x" });
    const store = useAuthStore();
    expect(await store.logout()).toBe(false);
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(false);
  });
});
