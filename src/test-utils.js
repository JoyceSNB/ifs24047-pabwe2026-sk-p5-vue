import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

const Blank = { template: "<div />" };

/** Pinia asli dengan state awal opsional, misalnya { aucations: { aucations: [] } }. */
export const createMockPinia = (initialState = {}) => {
  const pinia = createPinia();
  pinia.state.value = initialState;
  setActivePinia(pinia);
  return pinia;
};

/** Router memory dengan rute dummy (atau rute khusus) untuk pengujian komponen. */
export const createTestRouter = (routes) =>
  createRouter({
    history: createMemoryHistory(),
    routes: routes || [{ path: "/:pathMatch(.*)*", component: Blank }],
  });

export async function renderWithProviders(
  component,
  { props = {}, route = "/", state = {}, routes, global = {}, slots = {} } = {}
) {
  const pinia = createMockPinia(state);
  const router = createTestRouter(routes);
  router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    attachTo: document.body,
    global: { ...global, plugins: [pinia, router, ...(global.plugins || [])] },
  });
  return { wrapper, router, pinia };
}
