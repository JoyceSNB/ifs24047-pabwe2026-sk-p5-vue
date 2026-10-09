import { describe, expect, it } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

const page = { template: "<div />" };
const routes = ["/", "/users", "/profile"].map((path) => ({ path, component: page }));

describe("SidebarComponent", () => {
  it("memuat empat menu navigasi", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes });
    const labels = wrapper.findAll("a").map((a) => a.text());
    expect(labels).toEqual(["Dashboard Lelang", "Lelang Saya", "Daftar Pengguna", "Profil Saya"]);
    expect(wrapper.find("nav").attributes("aria-label")).toBe("Navigasi utama");
  });

  it("menandai menu aktif sesuai rute dan query", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes, route: "/?tab=mine" });
    const current = wrapper.findAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].text()).toBe("Lelang Saya");
  });

  it("drawer tertutup tidak menampilkan overlay", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes });
    expect(wrapper.find('button[aria-label="Tutup menu navigasi"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("hidden");
  });

  it("drawer terbuka menampilkan overlay dan emit close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes, props: { open: true } });
    expect(wrapper.find('[data-testid="sidebar"]').classes()).toContain("flex");
    await wrapper.find('button[aria-label="Tutup menu navigasi"]').trigger("click");
    await wrapper.find("a").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
