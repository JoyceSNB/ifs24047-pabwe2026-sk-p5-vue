import { describe, it, expect, vi, beforeEach } from "vitest";

// App ditiru agar tes ini hanya memeriksa perakitan aplikasi di main.js
vi.mock("./App.vue", () => ({
  default: { name: "App", template: "<div data-testid=\"app-root\">Delcom Auction</div>" },
}));

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("should mount the application into the #app element", async () => {
    await import("./main.js");
    // Tunggu navigasi awal router selesai agar tidak berjalan setelah lingkungan tes ditutup
    const { router } = await import("./router");
    await router.isReady();

    expect(document.querySelector("#app")).not.toBeNull();
    expect(document.querySelector("#app").innerHTML).toContain("Delcom Auction");
  });
});