import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import BidModal from "./BidModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/aucationApi";
import Swal from "sweetalert2";

vi.mock("../api/aucationApi");
const mountIt = (props = {}, extra = {}) =>
  renderWithProviders(BidModal, { props: { aucationId: 4, startBid: 10000, highestBid: 0, ...props }, ...extra });
const submit = async (wrapper, value) => {
  await wrapper.find("#bid-amount").setValue(value);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("BidModal", () => {
  it("menampilkan petunjuk sesuai ada/tidaknya penawaran", async () => {
    const empty = await mountIt();
    expect(empty.wrapper.find('[data-testid="bid-hint"]').text()).toMatch(/Belum ada penawaran/);
    const filled = await mountIt({ highestBid: 25000 });
    expect(filled.wrapper.find('[data-testid="bid-hint"]').text()).toMatch(/lebih tinggi/);
  });

  it("menolak tawaran di bawah harga awal bila belum ada bid", async () => {
    const { wrapper } = await mountIt();
    await submit(wrapper, "9999");
    expect(wrapper.find('[role="alert"]').text()).toMatch(/minimal/);
    expect(api.addBid).not.toHaveBeenCalled();
  });

  it("menolak tawaran yang tidak lebih tinggi dari tertinggi saat ini", async () => {
    const { wrapper } = await mountIt({ highestBid: 25000 });
    await submit(wrapper, "25000");
    expect(wrapper.find('[role="alert"]').text()).toMatch(/lebih tinggi dari/);
    expect(api.addBid).not.toHaveBeenCalled();
  });

  it("mengirim tawaran valid dan emit saved/close", async () => {
    api.addBid.mockResolvedValue({ status: "success", message: "Bid masuk" });
    const { wrapper } = await mountIt({ highestBid: 25000 });
    await submit(wrapper, "26000");
    expect(api.addBid).toHaveBeenCalledWith(4, 26000);
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("bid pertama sama dengan harga awal diterima", async () => {
    api.addBid.mockResolvedValue({ status: "success", message: "ok" });
    const { wrapper } = await mountIt();
    await submit(wrapper, "10000");
    expect(api.addBid).toHaveBeenCalledWith(4, 10000);
  });

  it("gagal menampilkan dialog error", async () => {
    api.addBid.mockResolvedValue({ status: "fail", message: "Bid ditolak" });
    const { wrapper } = await mountIt();
    await submit(wrapper, "20000");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Bid ditolak" }));
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("label loading dan tombol batal", async () => {
    const { wrapper } = await mountIt({}, { state: { aucations: { isBidAdd: true } } });
    expect(wrapper.find('button[type="submit"]').text()).toBe("Mengirim...");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol X pada header menutup dialog", async () => {
    const { wrapper } = await mountIt();
    await wrapper.find('button[aria-label="Tutup dialog"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
