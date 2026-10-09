import { afterEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createMemoryHistory } from "vue-router";
import App from "./App.vue";
import { createAppRouter } from "./router";
import { putAccessToken } from "./helpers/apiHelper";
import * as userApi from "./features/users/api/userApi";
import * as aucationApi from "./features/aucations/api/aucationApi";

vi.mock("./features/users/api/userApi");
vi.mock("./features/aucations/api/aucationApi");

const boot = async (path) => {
  const router = createAppRouter(createMemoryHistory());
  router.push(path);
  await router.isReady();
  const wrapper = mount(App, { attachTo: document.body, global: { plugins: [createPinia(), router] } });
  await vi.waitFor(() => expect(wrapper.html()).not.toBe("<!--v-if-->"));
  await flushPromises();
  return { wrapper, router };
};

afterEach(() => vi.useRealTimers());

describe("App (integrasi)", () => {
  it("tamu diarahkan ke halaman login", async () => {
    const { wrapper, router } = await boot("/");
    await vi.waitFor(() => expect(wrapper.find("#login-submit-button").exists()).toBe(true));
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
  });

  it("halaman register dapat dibuka tanpa login", async () => {
    const { wrapper } = await boot("/auth/register");
    await vi.waitFor(() => expect(wrapper.find("#register-submit-button").exists()).toBe(true));
  });

  it("pengguna login melihat dashboard dengan data lelang", async () => {
    putAccessToken("token");
    userApi.getMe.mockResolvedValue({ status: "success", message: "ok", data: { user: { id: 1, name: "Budi", email: "b@x.id" } } });
    aucationApi.getAucations.mockResolvedValue({
      status: "success",
      message: "ok",
      data: { aucations: [{ id: 9, user_id: 2, title: "Lukisan", description: "cat minyak", cover: null, start_bid: 1000, closed_at: "2099-01-01 00:00:00", bids: [], author: { name: "Siti" } }] },
    });
    const { wrapper } = await boot("/");
    await vi.waitFor(() => expect(wrapper.text()).toContain("Lukisan"));
    expect(wrapper.find("h1").text()).toBe("Dashboard Lelang");
    expect(wrapper.find('[data-testid="navbar-name"]').text()).toBe("Budi");
  });

  it("rute tidak dikenal menampilkan halaman 404", async () => {
    const { wrapper } = await boot("/tidak/ada");
    await vi.waitFor(() => expect(wrapper.text()).toContain("Halaman tidak ditemukan"));
  });
});
