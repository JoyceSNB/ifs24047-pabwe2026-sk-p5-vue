import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../api/authApi";
import Swal from "sweetalert2";

vi.mock("../api/authApi");
const routes = [
  { path: "/auth/login", component: { template: "<div>login</div>" } },
  { path: "/auth/register", component: RegisterPage },
  { path: "/", component: { template: "<div>home</div>" } },
];

const fill = async (wrapper, { name = "Budi", email = "b@x.id", pass = "123456", confirm = "123456" } = {}) => {
  await wrapper.find("#register-name-input").setValue(name);
  await wrapper.find("#register-email-input").setValue(email);
  await wrapper.find("#register-password-input").setValue(pass);
  await wrapper.find("#register-confirmation-input").setValue(confirm);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("RegisterPage", () => {
  it("validasi semua field", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { routes, route: "/auth/register" });
    await fill(wrapper, { name: "", email: "", pass: "123", confirm: "999" });
    expect(wrapper.text()).toContain("Nama wajib diisi.");
    expect(wrapper.text()).toContain("Email wajib diisi.");
    expect(wrapper.text()).toContain("Kata sandi minimal 6 karakter.");
    expect(wrapper.text()).toContain("Konfirmasi kata sandi tidak sama.");
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("menampilkan error dari API", async () => {
    authApi.register.mockResolvedValue({ status: "fail", message: "Email dipakai" });
    const { wrapper, router } = await renderWithProviders(RegisterPage, { routes, route: "/auth/register" });
    await fill(wrapper);
    expect(authApi.register).toHaveBeenCalledWith("Budi", "b@x.id", "123456");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Email dipakai" }));
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });

  it("pindah ke login setelah sukses", async () => {
    authApi.register.mockResolvedValue({ status: "success", message: "Terdaftar" });
    const { wrapper, router } = await renderWithProviders(RegisterPage, { routes, route: "/auth/register" });
    await fill(wrapper);
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("tombol nonaktif saat memproses", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { routes, state: { auth: { isAuthRegister: true } } });
    expect(wrapper.find("#register-submit-button").text()).toBe("Memproses...");
  });
});
