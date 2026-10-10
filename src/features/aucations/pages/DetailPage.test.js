import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/aucationApi";
import Swal from "sweetalert2";

vi.mock("../api/aucationApi");

const base = {
  id: 1,
  user_id: 1,
  title: "Jam Antik",
  description: "**emas**",
  cover: "img/a.png",
  start_bid: 10000,
  closed_at: "2099-01-01 00:00:00",
  author: { name: "Budi" },
  my_bid: null,
  bids: [
    { id: 1, bid: 15000, created_at: "2026-10-01 10:00:00" },
    { id: 2, bid: 20000, created_at: "2026-10-02 10:00:00" },
  ],
};
const ok = (overrides = {}) => ({ status: "success", message: "ok", data: { aucation: { ...base, ...overrides } } });
const routes = [
  { path: "/", component: { template: "<div />" } },
  { path: "/aucations/:aucationId", component: DetailPage },
];
const modalStub = (id) => ({
  props: ["aucation", "aucationId", "startBid", "highestBid"],
  emits: ["close", "saved"],
  template: `<div data-testid="${id}">{{ aucationId }}|{{ startBid }}|{{ highestBid }}<button data-testid="${id}-close" @click="$emit('close')">c</button><button data-testid="${id}-saved" @click="$emit('saved')">s</button></div>`,
});
const stubs = {
  MarkdownViewer: { props: ["content"], template: '<div data-testid="viewer">{{ content }}</div>' },
  ChangeModal: modalStub("change-modal"),
  ChangeCoverModal: modalStub("cover-modal"),
  BidModal: modalStub("bid-modal"),
};
const render = (profileId = 1) =>
  renderWithProviders(DetailPage, {
    routes,
    route: "/aucations/1",
    state: { users: { profile: { id: profileId } } },
    global: { stubs },
  });
const button = (wrapper, label) => wrapper.findAll("button").find((b) => b.text() === label);

describe("DetailPage", () => {
  it("menampilkan status memuat dan lelang tidak ditemukan", async () => {
    api.getAucation.mockReturnValue(new Promise(() => {}));
    const loading = await render();
    expect(loading.wrapper.find("output").exists()).toBe(true);
    api.getAucation.mockResolvedValue({ status: "fail", message: "x" });
    const missing = await render();
    await flushPromises();
    expect(missing.wrapper.text()).toContain("Lelang tidak ditemukan.");
  });

  it("pemilik: detail, riwayat bid terurut, dan aksi kelola", async () => {
    api.getAucation.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    expect(api.getAucation).toHaveBeenCalledWith("1");
    expect(wrapper.find("h1").text()).toBe("Jam Antik");
    expect(wrapper.find('[data-testid="viewer"]').text()).toBe("**emas**");
    expect(wrapper.find('img[alt="Cover Jam Antik"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="highest-bid"]').text()).toMatch(/Rp\s?20\.000/);
    const entries = wrapper.findAll('[data-testid="bid-history"] li');
    expect(entries[0].text()).toMatch(/20\.000/);
    expect(entries[1].text()).toMatch(/15\.000/);
    expect(button(wrapper, "Ubah data")).toBeTruthy();
    expect(button(wrapper, "Ajukan penawaran")).toBeUndefined();
  });

  it("pemilik membuka dan menutup modal ubah & cover", async () => {
    api.getAucation.mockResolvedValue(ok());
    const { wrapper } = await render();
    await flushPromises();
    await button(wrapper, "Ubah data").trigger("click");
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="change-modal-saved"]').trigger("click");
    await flushPromises();
    expect(api.getAucation).toHaveBeenCalledTimes(2);
    await wrapper.find('[data-testid="change-modal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(false);

    await button(wrapper, "Ganti cover").trigger("click");
    expect(wrapper.find('[data-testid="cover-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="cover-modal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="cover-modal"]').exists()).toBe(false);
  });

  it("pemilik menghapus lelang: batal, gagal, lalu sukses kembali ke dashboard", async () => {
    api.getAucation.mockResolvedValue(ok());
    const { wrapper, router } = await render();
    await flushPromises();

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(api.deleteAucation).not.toHaveBeenCalled();

    api.deleteAucation.mockResolvedValue({ status: "fail", message: "Gagal hapus" });
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Gagal hapus" }));
    expect(router.currentRoute.value.path).toBe("/aucations/1");

    api.deleteAucation.mockResolvedValue({ status: "success", message: "Terhapus" });
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(api.deleteAucation).toHaveBeenCalledWith(1);
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("peserta: ajukan penawaran dengan data bid terkini", async () => {
    api.getAucation.mockResolvedValue(ok());
    const { wrapper } = await render(2);
    await flushPromises();
    expect(button(wrapper, "Ubah data")).toBeUndefined();
    await button(wrapper, "Ajukan penawaran").trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').text()).toContain("1|10000|20000");
    await wrapper.find('[data-testid="bid-modal-saved"]').trigger("click");
    await flushPromises();
    expect(api.getAucation).toHaveBeenCalledTimes(2);
    await wrapper.find('[data-testid="bid-modal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="bid-modal"]').exists()).toBe(false);
  });

  it("tanpa cover dan tanpa bid menampilkan placeholder", async () => {
    api.getAucation.mockResolvedValue(ok({ cover: null, bids: [] }));
    const { wrapper } = await render(2);
    await flushPromises();
    expect(wrapper.text()).toContain("Tidak ada cover");
    expect(wrapper.text()).toContain("Belum ada yang menawar.");
    expect(wrapper.find('[data-testid="highest-bid"]').text()).toBe("Belum ada");
    expect(wrapper.find('[data-testid="my-bid"]').exists()).toBe(false);
    expect(button(wrapper, "Batalkan tawaranku")).toBeUndefined();
  });

  it("peserta dengan bid: tampil tawaranku dan batalkan (batal, gagal, sukses)", async () => {
    api.getAucation.mockResolvedValue(ok({ my_bid: { id: 2, bid: 20000 } }));
    const { wrapper } = await render(2);
    await flushPromises();
    expect(wrapper.find('[data-testid="my-bid"]').text()).toMatch(/Rp\s?20\.000/);

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await button(wrapper, "Batalkan tawaranku").trigger("click");
    await flushPromises();
    expect(api.deleteBid).not.toHaveBeenCalled();

    api.deleteBid.mockResolvedValue({ status: "fail", message: "Gagal batal" });
    await button(wrapper, "Batalkan tawaranku").trigger("click");
    await flushPromises();
    expect(api.getAucation).toHaveBeenCalledTimes(1);

    api.deleteBid.mockResolvedValue({ status: "success", message: "Dibatalkan" });
    await button(wrapper, "Batalkan tawaranku").trigger("click");
    await flushPromises();
    expect(api.deleteBid).toHaveBeenCalledWith(1);
    expect(api.getAucation).toHaveBeenCalledTimes(2);
  });

  it("lelang yang sudah ditutup tidak bisa ditawar", async () => {
    api.getAucation.mockResolvedValue(ok({ closed_at: "2000-01-01 00:00:00", my_bid: { id: 1, bid: 15000 } }));
    const { wrapper } = await render(2);
    await flushPromises();
    expect(wrapper.text()).toContain("Ditutup");
    expect(button(wrapper, "Ajukan penawaran")).toBeUndefined();
    expect(button(wrapper, "Batalkan tawaranku")).toBeUndefined();
    expect(wrapper.find('[data-testid="my-bid"]').exists()).toBe(true);
  });
});
