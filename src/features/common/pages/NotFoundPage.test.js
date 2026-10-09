import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan tautan beranda", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.find("h1").text()).toBe("Halaman tidak ditemukan");
    expect(wrapper.text()).toContain("404");
    expect(wrapper.find("a").attributes("href")).toBe("/");
  });
});
