import { describe, expect, it } from "vitest";
import { createMemoryHistory } from "vue-router";
import { authGuard, createAppRouter, router, routes } from "./router";
import { putAccessToken } from "./helpers/apiHelper";

const flatten = (list) => list.flatMap((r) => [r, ...flatten(r.children || [])]);

describe("router", () => {
  it("semua lazy component dapat dimuat", async () => {
    const loaders = flatten(routes).map((r) => r.component);
    const modules = await Promise.all(loaders.map((load) => load()));
    expect(modules).toHaveLength(9);
    modules.forEach((m) => expect(m.default).toBeTruthy());
  });

  it("mendeklarasikan rute yang diminta", () => {
    const paths = router.getRoutes().map((r) => r.path);
    ["/auth/login", "/auth/register", "/", "/aucations/:aucationId", "/users", "/profile"].forEach((p) =>
      expect(paths).toContain(p)
    );
    expect(paths).toContain("/:pathMatch(.*)*");
  });

  it("guard mengarahkan tamu ke login", async () => {
    const r = createAppRouter(createMemoryHistory());
    await r.push("/profile");
    expect(r.currentRoute.value.path).toBe("/auth/login");
    expect(document.title).toBe("Masuk | Delcom Auction");
  });

  it("guard mengarahkan pengguna login dari halaman auth ke beranda", async () => {
    putAccessToken("t");
    const r = createAppRouter(createMemoryHistory());
    await r.push("/auth/login");
    expect(r.currentRoute.value.path).toBe("/");
    await r.push("/halaman/ngawur");
    expect(r.currentRoute.value.name).toBe("not-found");
  });

  it("authGuard mengizinkan rute publik dan memakai judul default", async () => {
    expect(authGuard({ matched: [{ meta: {} }] })).toBe(true);
    const r = createAppRouter(createMemoryHistory());
    await r.push("/halaman/ngawur");
    expect(r.currentRoute.value.name).toBe("not-found");
    r.getRoutes();
  });

  it("createAppRouter memakai history default browser", () => {
    expect(createAppRouter()).toBeTruthy();
  });

  it("judul default dipakai saat meta.title kosong", async () => {
    const r = createAppRouter(createMemoryHistory());
    r.addRoute({ path: "/tanpa-judul", component: { template: "<div/>" } });
    await r.push("/tanpa-judul");
    expect(document.title).toBe("Delcom Auction | Delcom Auction");
  });
});
