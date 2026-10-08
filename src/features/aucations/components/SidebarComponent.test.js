import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/vue";

import {
  createMemoryHistory,
  createRouter,
} from "vue-router";

import SidebarComponent from "./SidebarComponent.vue";

function createTestRouter(
  initialPath = "/",
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: {
          template: "<div>Home</div>",
        },
      },
      {
        path: "/aucations/:id",
        component: {
          template: "<div>Detail</div>",
        },
      },
      {
        path: "/users",
        component: {
          template: "<div>Users</div>",
        },
      },
      {
        path: "/profile",
        component: {
          template: "<div>Profile</div>",
        },
      },
    ],
  });

  return {
    router,
    initialPath,
  };
}

async function renderSidebar(
  initialPath = "/",
  isSidebarOpen = false,
) {
  const {
    router,
  } = createTestRouter(
    initialPath,
  );

  await router.push(
    initialPath,
  );

  await router.isReady();

  const result = render(
    SidebarComponent,
    {
      props: {
        isSidebarOpen,
      },
      global: {
        plugins: [router],
      },
    },
  );

  return {
    ...result,
    router,
  };
}

describe("SidebarComponent", () => {
  it("renders all navigation items", async () => {
    await renderSidebar(
      "/",
      true,
    );

    expect(
      screen.getByText(
        "Menu Utama",
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Dashboard Lelang",
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Lelang Saya",
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Daftar Pengguna",
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Profil Saya",
      ),
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Praktikum 5 PABWE",
      ),
    ).toBeTruthy();
  });

  it("shows sidebar backdrop when sidebar is open", async () => {
    await renderSidebar(
      "/",
      true,
    );

    expect(
      screen.getByTestId(
        "sidebar-backdrop",
      ),
    ).toBeTruthy();
  });

  it("does not show sidebar backdrop when sidebar is closed", async () => {
    await renderSidebar(
      "/",
      false,
    );

    expect(
      screen.queryByTestId(
        "sidebar-backdrop",
      ),
    ).toBeNull();
  });

  it("emits close-mobile when backdrop is clicked", async () => {
    const {
      emitted,
    } = await renderSidebar(
      "/",
      true,
    );

    await fireEvent.click(
      screen.getByTestId(
        "sidebar-backdrop",
      ),
    );

    expect(
      emitted(
        "close-mobile",
      ),
    ).toBeTruthy();

    expect(
      emitted(
        "close-mobile",
      ),
    ).toHaveLength(1);
  });

  it("marks dashboard as active on home route", async () => {
    await renderSidebar(
      "/",
      true,
    );

    const dashboard =
      screen.getByTestId(
        "nav-dashboard",
      );

    expect(
      dashboard.className,
    ).toContain(
      "bg-indigo-600",
    );

    expect(
      dashboard.className,
    ).toContain(
      "text-white",
    );

    const mine =
      screen.getByTestId(
        "nav-mine",
      );

    expect(
      mine.className,
    ).toContain(
      "text-slate-600",
    );
  });

  it("marks dashboard as active on auction detail route", async () => {
    await renderSidebar(
      "/aucations/123",
      true,
    );

    const dashboard =
      screen.getByTestId(
        "nav-dashboard",
      );

    expect(
      dashboard.className,
    ).toContain(
      "bg-indigo-600",
    );

    expect(
      dashboard.className,
    ).toContain(
      "text-white",
    );
  });

  it("marks mine as active when tab query is me", async () => {
    await renderSidebar(
      "/?tab=me",
      true,
    );

    const mine =
      screen.getByTestId(
        "nav-mine",
      );

    expect(
      mine.className,
    ).toContain(
      "bg-indigo-600",
    );

    expect(
      mine.className,
    ).toContain(
      "text-white",
    );

    const dashboard =
      screen.getByTestId(
        "nav-dashboard",
      );

    expect(
      dashboard.className,
    ).toContain(
      "text-slate-600",
    );
  });

  it("marks users as active on users route", async () => {
    await renderSidebar(
      "/users",
      true,
    );

    const users =
      screen.getByTestId(
        "nav-users",
      );

    expect(
      users.className,
    ).toContain(
      "bg-indigo-600",
    );

    expect(
      users.className,
    ).toContain(
      "text-white",
    );
  });

  it("marks profile as active on profile route", async () => {
    await renderSidebar(
      "/profile",
      true,
    );

    const profile =
      screen.getByTestId(
        "nav-profile",
      );

    expect(
      profile.className,
    ).toContain(
      "bg-indigo-600",
    );

    expect(
      profile.className,
    ).toContain(
      "text-white",
    );
  });

  it("emits close-mobile when dashboard is clicked", async () => {
    const {
      emitted,
    } = await renderSidebar(
      "/",
      true,
    );

    await fireEvent.click(
      screen.getByTestId(
        "nav-dashboard",
      ),
    );

    expect(
      emitted(
        "close-mobile",
      ),
    ).toHaveLength(1);
  });

  it("emits close-mobile when mine is clicked", async () => {
    const {
      emitted,
    } = await renderSidebar(
      "/",
      true,
    );

    await fireEvent.click(
      screen.getByTestId(
        "nav-mine",
      ),
    );

    expect(
      emitted(
        "close-mobile",
      ),
    ).toHaveLength(1);
  });

  it("emits close-mobile when users is clicked", async () => {
    const {
      emitted,
    } = await renderSidebar(
      "/",
      true,
    );

    await fireEvent.click(
      screen.getByTestId(
        "nav-users",
      ),
    );

    expect(
      emitted(
        "close-mobile",
      ),
    ).toHaveLength(1);
  });

  it("emits close-mobile when profile is clicked", async () => {
    const {
      emitted,
    } = await renderSidebar(
      "/",
      true,
    );

    await fireEvent.click(
      screen.getByTestId(
        "nav-profile",
      ),
    );

    expect(
      emitted(
        "close-mobile",
      ),
    ).toHaveLength(1);
  });
});