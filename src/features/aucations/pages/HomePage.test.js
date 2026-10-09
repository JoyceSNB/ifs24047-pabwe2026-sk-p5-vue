import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/aucationApi";
import Swal from "sweetalert2";

vi.mock("../api/aucationApi");

const list = [
  { id: 1, user_id: 1, title: "Jam Antik", description: "emas murni", cover: "img/a.png", start_bid: 10000, closed_at: "2099-01-01 00:00:00", bids: [{ bid: 15000 }, { bid: 20000 }], author: { name: "Budi" } },
  { id: 2, user_id: 2, title: "Sepatu Kulit", description: "kulit sapi", cover: null, start_bid: 5000, closed_at: "2000-01-01 00:00:00", bids: [], author: { name: "Siti" } },
];
const ok = (aucations = list) => ({ status: "success", message: "ok", data: { aucations } });
const blank = { template: "<div />" };
const routes = [{ path: "/", component: blank }, { path: "/aucations/:id", component: blank }];
const state = { users: { profile: { id: 1 } } };
const addModalStub = {
  emits: ["close", "saved"],
  template: '<div data-testid="add-modal"><button data-testid="m-close" @click="$emit(\'close\')">c</button><button data-testid="m-saved" @click="$emit(\'saved\')">s</button></div>',
};
const render = (extra = {}) =>
  renderWithProviders(HomePage, { routes, state, global: { stubs: { AddModal: addModalStub } }, ...extra });
const titles = (wrapper) => wrapper.findAll("h2").map((h) => h.text());
const tab = (wrapper, label) => wrapper.findAll("button[aria-pressed]").find((b) => b.text() === label);

describe("HomePage", () => {
  it("menampilkan kartu lelang lengkap dengan harga, tawaran, dan countdown", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    expect(titles(wrapper)).toEqual(["Jam Antik", "Sepatu Kulit"]);
    const text = wrapper.text();
    expect(text).toMatch(/2 penawaran · Rp\s?20\.000/);
    expect(text).toContain("Belum ada");
    expect(text).toContain("Ditutup");
    expect(text).toMatch(/hari/);
    expect(wrapper.find('img[alt="Cover Jam Antik"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Tidak ada cover");
    expect(wrapper.findAll('a[href^="/aucations/"]')).toHaveLength(2);
    expect(wrapper.findAll('button[aria-label^="Hapus lelang"]')).toHaveLength(1);
  });

  it("menampilkan status memuat dan status kosong", async () => {
    api.getAucations.mockReturnValue(new Promise(() => {}));
    const loading = await render();
    expect(loading.wrapper.find('[role="status"]').text()).toMatch(/Memuat/);
    api.getAucations.mockResolvedValue(ok([]));
    const empty = await render();
    await flushPromises();
    expect(empty.wrapper.text()).toContain("Belum ada lelang yang cocok");
  });

  it("tanpa profil tidak ada tombol hapus", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await renderWithProviders(HomePage, { routes });
    await flushPromises();
    expect(wrapper.findAll('button[aria-label^="Hapus lelang"]')).toHaveLength(0);
  });

  it("tab filter: berlangsung, ditutup, semua, dan lelang saya", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper, router } = await render();
    await flushPromises();

    await tab(wrapper, "Lelang Berlangsung").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe("open");
    expect(titles(wrapper)).toEqual(["Jam Antik"]);

    await tab(wrapper, "Lelang Ditutup").trigger("click");
    await flushPromises();
    expect(titles(wrapper)).toEqual(["Sepatu Kulit"]);

    await tab(wrapper, "Semua Lelang").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBeUndefined();
    expect(titles(wrapper)).toHaveLength(2);

    await tab(wrapper, "Lelang Saya").trigger("click");
    await flushPromises();
    expect(api.getAucations).toHaveBeenLastCalledWith({ isMe: true });
    expect(wrapper.text()).toContain("Hapus semua lelang saya");
  });

  it("query tab tidak valid kembali ke semua; tab mine kosong tanpa tombol hapus semua", async () => {
    api.getAucations.mockResolvedValue(ok([]));
    const invalid = await render({ route: "/?tab=ngawur" });
    await flushPromises();
    expect(tab(invalid.wrapper, "Semua Lelang").attributes("aria-pressed")).toBe("true");
    const mine = await render({ route: "/?tab=mine" });
    await flushPromises();
    expect(mine.wrapper.text()).not.toContain("Hapus semua lelang saya");
  });

  it("pencarian langsung berdasarkan judul atau deskripsi", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    await wrapper.find("#search-input").setValue("kulit");
    expect(titles(wrapper)).toEqual(["Sepatu Kulit"]);
    await wrapper.find("#search-input").setValue("tidak ada");
    expect(wrapper.text()).toContain("Belum ada lelang yang cocok");
  });

  it("hapus lelang: batal, sukses, dan gagal", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    const del = () => wrapper.find('button[aria-label="Hapus lelang Jam Antik"]').trigger("click");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await del();
    await flushPromises();
    expect(api.deleteAucation).not.toHaveBeenCalled();

    api.deleteAucation.mockResolvedValue({ status: "success", message: "Terhapus" });
    await del();
    await flushPromises();
    expect(api.deleteAucation).toHaveBeenCalledWith(1);
    expect(api.getAucations).toHaveBeenCalledTimes(2);

    api.deleteAucation.mockResolvedValue({ status: "fail", message: "Gagal hapus" });
    await del();
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Gagal hapus" }));
    expect(api.getAucations).toHaveBeenCalledTimes(2);
  });

  it("hapus semua lelang: batal, sukses, dan gagal", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await render({ route: "/?tab=mine" });
    await flushPromises();
    const delAll = () => wrapper.findAll("button").find((b) => b.text().includes("Hapus semua")).trigger("click");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await delAll();
    await flushPromises();
    expect(api.deleteAllAucations).not.toHaveBeenCalled();

    api.deleteAllAucations.mockResolvedValue({ status: "success", message: "Semua terhapus" });
    await delAll();
    await flushPromises();
    expect(api.deleteAllAucations).toHaveBeenCalled();
    expect(api.getAucations).toHaveBeenCalledTimes(2);

    api.deleteAllAucations.mockResolvedValue({ status: "fail", message: "Gagal semua" });
    await delAll();
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Gagal semua" }));
  });

  it("modal tambah lelang: buka, simpan (muat ulang), dan tutup", async () => {
    api.getAucations.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
    await wrapper.findAll("button").find((b) => b.text().includes("Tambah Lelang")).trigger("click");
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="m-saved"]').trigger("click");
    await flushPromises();
    expect(api.getAucations).toHaveBeenCalledTimes(2);
    await wrapper.find('[data-testid="m-close"]').trigger("click");
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
  });

  it("memperbarui countdown secara berkala dan membersihkan timer", async () => {
    vi.useFakeTimers();
    try {
      api.getAucations.mockResolvedValue(ok());
      const { wrapper } = await render();
      await flushPromises();
      vi.advanceTimersByTime(30000);
      await flushPromises();
      expect(titles(wrapper)).toHaveLength(2);
      wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
