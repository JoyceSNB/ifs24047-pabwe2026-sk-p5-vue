import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AucationLayout from "./AucationLayout.vue";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../../users/api/userApi";

vi.mock("../../users/api/userApi");
const routes = ["/", "/users", "/profile", "/auth/login"].map((path) => ({ path, component: { template: "<p>konten</p>" } }));

describe("AucationLayout", () => {
  it("menyusun navbar, sidebar, dan area konten serta memuat profil", async () => {
    userApi.getMe.mockResolvedValue({ status: "success", message: "ok", data: { user: { id: 1, name: "Siti", email: "s@x.id" } } });
    const { wrapper } = await renderWithProviders(AucationLayout, { routes });
    await flushPromises();
    expect(userApi.getMe).toHaveBeenCalled();
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true);
    expect(wrapper.find("main#main").text()).toContain("konten");
    expect(wrapper.find('[data-testid="navbar-name"]').text()).toBe("Siti");
  });

  it("membuka dan menutup drawer sidebar", async () => {
    userApi.getMe.mockResolvedValue({ status: "fail", message: "x" });
    const { wrapper } = await renderWithProviders(AucationLayout, { routes });
    await flushPromises();
    await wrapper.find('button[aria-label="Buka menu navigasi"]').trigger("click");
    const overlay = wrapper.find('button[aria-label="Tutup menu navigasi"]');
    expect(overlay.exists()).toBe(true);
    await overlay.trigger("click");
    expect(wrapper.find('button[aria-label="Tutup menu navigasi"]').exists()).toBe(false);
  });
});
