import { describe, expect, it } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan banner, area main, dan konten rute", async () => {
    const { wrapper } = await renderWithProviders(AuthLayout);
    expect(wrapper.find('[data-testid="auth-banner"]').exists()).toBe(true);
    expect(wrapper.find("main#main").exists()).toBe(true);
    expect(wrapper.text()).toContain("Delcom Auction");
  });
});
