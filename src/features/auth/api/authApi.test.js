import { describe, expect, it, vi } from "vitest";
import { login, logout, register } from "./authApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn(async () => ({ status: "success" })) }));

describe("authApi", () => {
  it("login memanggil POST /auth/login", async () => {
    await login("a@b.c", "123456");
    expect(apiRequest).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.c", password: "123456" } });
  });

  it("register memanggil POST /auth/register", async () => {
    await register("Nama", "a@b.c", "123456");
    expect(apiRequest).toHaveBeenCalledWith("/auth/register", { method: "POST", body: { name: "Nama", email: "a@b.c", password: "123456" } });
  });

  it("logout memanggil POST /auth/logout", async () => {
    await logout();
    expect(apiRequest).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});
