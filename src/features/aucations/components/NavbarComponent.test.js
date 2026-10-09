import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import * as authApi from "../../auth/api/authApi";
import Swal from "sweetalert2";

vi.mock("../../auth/api/authApi");
const routes = [
  { path: "/", component: { template: "<div />" } },
  { path: "/profile", component: { template: "<div />" } },
  { path: "/auth/login", component: { template: "<div />" } },
];

describe("NavbarComponent", () => {
  it("menampilkan placeholder saat profil belum dimuat", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, { routes });
    expect(wrapper.find('[data-testid="navbar-name"]').text()).toBe("Memuat...");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("menampilkan identitas akun aktif beserta foto", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, {
      routes,
      state: { users: { profile: { name: "Budi", email: "b@x.id", photo: "img/b.png" } } },
    });
    expect(wrapper.find('[data-testid="navbar-name"]').text()).toBe("Budi");
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/img/b.png");
  });

  it("emit toggle-sidebar dari tombol menu", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.find('button[aria-label="Buka menu navigasi"]').trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("logout setelah konfirmasi", async () => {
    authApi.logout.mockResolvedValue({ status: "success", message: "bye" });
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.findAll("button").find((b) => b.text().includes("Keluar")).trigger("click");
    await flushPromises();
    expect(authApi.logout).toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("tidak logout bila konfirmasi dibatalkan", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const { wrapper, router } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.findAll("button").find((b) => b.text().includes("Keluar")).trigger("click");
    await flushPromises();
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/");
  });
});
