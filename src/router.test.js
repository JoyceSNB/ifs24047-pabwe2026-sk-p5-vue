import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import { createMemoryHistory } from "vue-router";

import { createAppRouter } from "./router";

import {
  getAccessToken,
  putAccessToken,
} from "./helpers/apiHelper";

function createTestRouter() {
  return createAppRouter(createMemoryHistory());
}

async function navigate(path) {
  const router = createTestRouter();

  await router.push(path);
  await router.isReady();

  return router;
}

beforeEach(() => {
  localStorage.clear();
  putAccessToken(null);
});

describe("createAppRouter", () => {
  it("creates router with auth login route", async () => {
    const router = await navigate("/auth/login");

    expect(router.currentRoute.value.path).toBe(
      "/auth/login",
    );

    expect(
      router.currentRoute.value.matched.length,
    ).toBe(2);
  });

  it("creates router with auth register route", async () => {
    const router = await navigate("/auth/register");

    expect(router.currentRoute.value.path).toBe(
      "/auth/register",
    );

    expect(
      router.currentRoute.value.matched.length,
    ).toBe(2);
  });

  it("redirects unauthenticated user from dashboard to login", async () => {
    putAccessToken(null);

    const router = await navigate("/");

    expect(getAccessToken()).toBeNull();

    expect(router.currentRoute.value.path).toBe(
      "/auth/login",
    );
  });

  it("allows authenticated user to access dashboard", async () => {
    putAccessToken("access-token");

    const router = await navigate("/");

    expect(getAccessToken()).toBe(
      "access-token",
    );

    expect(router.currentRoute.value.path).toBe(
      "/",
    );
  });

  it("allows authenticated user to access auction detail", async () => {
    putAccessToken("access-token");

    const router = await navigate(
      "/aucations/123",
    );

    expect(
      router.currentRoute.value.path,
    ).toBe("/aucations/123");

    expect(
      router.currentRoute.value.params.aucationId,
    ).toBe("123");
  });

  it("allows authenticated user to access users page", async () => {
    putAccessToken("access-token");

    const router = await navigate("/users");

    expect(
      router.currentRoute.value.path,
    ).toBe("/users");
  });

  it("allows authenticated user to access profile page", async () => {
    putAccessToken("access-token");

    const router = await navigate("/profile");

    expect(
      router.currentRoute.value.path,
    ).toBe("/profile");
  });

  it("redirects authenticated user away from auth login", async () => {
    putAccessToken("access-token");

    const router = await navigate(
      "/auth/login",
    );

    expect(
      getAccessToken(),
    ).toBe("access-token");

    expect(
      router.currentRoute.value.path,
    ).toBe("/");
  });

  it("redirects authenticated user away from auth register", async () => {
    putAccessToken("access-token");

    const router = await navigate(
      "/auth/register",
    );

    expect(
      getAccessToken(),
    ).toBe("access-token");

    expect(
      router.currentRoute.value.path,
    ).toBe("/");
  });

  it("allows unauthenticated user to access auth login", async () => {
    putAccessToken(null);

    const router = await navigate(
      "/auth/login",
    );

    expect(
      getAccessToken(),
    ).toBeNull();

    expect(
      router.currentRoute.value.path,
    ).toBe("/auth/login");
  });

  it("allows unauthenticated user to access auth register", async () => {
    putAccessToken(null);

    const router = await navigate(
      "/auth/register",
    );

    expect(
      getAccessToken(),
    ).toBeNull();

    expect(
      router.currentRoute.value.path,
    ).toBe("/auth/register");
  });

  it("matches unknown paths with not found route", async () => {
    putAccessToken("access-token");

    const router = await navigate(
      "/this-route-does-not-exist",
    );

    expect(
      router.currentRoute.value.path,
    ).toBe(
      "/this-route-does-not-exist",
    );

    expect(
      router.currentRoute.value.matched.length,
    ).toBe(1);

    expect(
      router.currentRoute.value.matched[0].path,
    ).toBe("/:pathMatch(.*)*");
  });

  it("supports a custom history implementation", async () => {
    putAccessToken("access-token");

    const history = createMemoryHistory();

    const router = createAppRouter(history);

    await router.push("/users");
    await router.isReady();

    expect(
      router.currentRoute.value.path,
    ).toBe("/users");
  });
});