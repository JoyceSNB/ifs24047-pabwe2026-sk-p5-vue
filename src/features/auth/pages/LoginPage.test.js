import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";
import Swal from "sweetalert2";

vi.mock("../api/authApi");
const routes = [
  { path: "/", component: { template: "<div>home</div>" } },
  { path: "/auth/login", component: LoginPage },
  { path: "/auth/register", component: { template: "<div>register</div>" } },
];

describe("LoginPage", () => {
  it("memiliki selector yang dibutuhkan penilaian", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { routes });
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-password-input").exists()).toBe(true);
    expect(wrapper.find("#login-submit-button").exists()).toBe(true);
    expect(wrapper.find("h1").text()).toBe("Masuk");
  });

  it("menampilkan error validasi saat form kosong", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { routes });
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Email wajib diisi.");
    expect(wrapper.text()).toContain("Kata sandi wajib diisi.");
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error saat login gagal", async () => {
    authApi.login.mockResolvedValue({ status: "fail", message: "Akun salah" });
    const { wrapper, router } = await renderWithProviders(LoginPage, { routes });
    await wrapper.find("#login-email-input").setValue(" a@b.c ");
    await wrapper.find("#login-password-input").setValue("rahasia");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(authApi.login).toHaveBeenCalledWith("a@b.c", "rahasia");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Akun salah" }));
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("berpindah ke dashboard saat login berhasil", async () => {
    authApi.login.mockResolvedValue({ status: "success", message: "Masuk", data: { token: "t" } });
    const { wrapper, router } = await renderWithProviders(LoginPage, { routes, route: "/auth/login" });
    await wrapper.find("#login-email-input").setValue("a@b.c");
    await wrapper.find("#login-password-input").setValue("rahasia");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" }));
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("menonaktifkan tombol saat proses login berjalan", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { routes, state: { auth: { isAuthLogin: true } } });
    const button = wrapper.find("#login-submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Memproses...");
  });
});
