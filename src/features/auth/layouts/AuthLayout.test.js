import { describe, it, expect } from "vitest";
import { render } from "@testing-library/vue";
import { createRouter, createMemoryHistory } from "vue-router";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("mounts", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/auth/login",
          component: {
            template: "<div>Login</div>",
          },
        },
      ],
    });

    await router.push("/auth/login");
    await router.isReady();

    const { container } = render(AuthLayout, {
      global: {
        plugins: [router],
      },
    });

    expect(container).toBeTruthy();
  });
});