import {
  describe,
  it,
  expect,
} from "vitest";

import {
  render,
  fireEvent,
} from "@testing-library/vue";

import AucationLayout from "./AucationLayout.vue";

describe("AucationLayout", () => {
  const NavbarStub = {
    template: `
      <header
        data-testid="navbar"
      >
        <button
          data-testid="toggle-sidebar"
          @click="$emit('toggle-sidebar')"
        >
          Toggle
        </button>
      </header>
    `,
  };

  const SidebarStub = {
    props: [
      "isSidebarOpen",
    ],

    emits: [
      "close-mobile",
    ],

    template: `
      <aside
        data-testid="sidebar"
        :data-open="String(isSidebarOpen)"
      >
        <button
          data-testid="close-sidebar"
          @click="$emit('close-mobile')"
        >
          Close
        </button>
      </aside>
    `,
  };

  const RouterViewStub = {
    template: `
      <div
        data-testid="router-view"
      >
        Content
      </div>
    `,
  };

  function renderLayout() {
    return render(
      AucationLayout,
      {
        global: {
          stubs: {
            NavbarComponent:
              NavbarStub,

            SidebarComponent:
              SidebarStub,

            "router-view":
              RouterViewStub,
          },
        },
      },
    );
  }

  it("renders navbar, sidebar, and router view", () => {
    const {
      getByTestId,
    } = renderLayout();

    expect(
      getByTestId("navbar"),
    ).toBeTruthy();

    expect(
      getByTestId("sidebar"),
    ).toBeTruthy();

    expect(
      getByTestId("router-view"),
    ).toBeTruthy();
  });

  it("renders the auction layout structure", () => {
    const {
      container,
    } = renderLayout();

    expect(
      container.querySelector(
        "main",
      ),
    ).toBeTruthy();

    expect(
      container.querySelector(
        ".min-h-screen",
      ),
    ).toBeTruthy();
  });

  it("starts with sidebar closed", () => {
    const {
      getByTestId,
    } = renderLayout();

    expect(
      getByTestId(
        "sidebar",
      ).getAttribute(
        "data-open",
      ),
    ).toBe("false");
  });

  it("opens sidebar when navbar emits toggle-sidebar", async () => {
    const {
      getByTestId,
    } = renderLayout();

    const sidebar =
      getByTestId("sidebar");

    expect(
      sidebar.getAttribute(
        "data-open",
      ),
    ).toBe("false");

    await fireEvent.click(
      getByTestId(
        "toggle-sidebar",
      ),
    );

    expect(
      sidebar.getAttribute(
        "data-open",
      ),
    ).toBe("true");
  });

  it("closes sidebar when sidebar emits close-mobile", async () => {
    const {
      getByTestId,
    } = renderLayout();

    const sidebar =
      getByTestId("sidebar");

    await fireEvent.click(
      getByTestId(
        "toggle-sidebar",
      ),
    );

    expect(
      sidebar.getAttribute(
        "data-open",
      ),
    ).toBe("true");

    await fireEvent.click(
      getByTestId(
        "close-sidebar",
      ),
    );

    expect(
      sidebar.getAttribute(
        "data-open",
      ),
    ).toBe("false");
  });
});