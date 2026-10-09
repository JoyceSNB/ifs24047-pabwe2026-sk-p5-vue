import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/aucationApi";
import Swal from "sweetalert2";

vi.mock("../api/aucationApi");
const stubs = {
  MarkdownEditor: {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template: '<textarea data-testid="md" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
};
const aucation = { id: 7, title: "Lama", description: "Desk lama", start_bid: 10000, closed_at: "2026-12-31 20:30:00" };
const mountIt = (extra = {}) => renderWithProviders(ChangeModal, { props: { aucation }, global: { stubs }, ...extra });

describe("ChangeModal", () => {
  it("terisi data lelang yang ada", async () => {
    const { wrapper } = await mountIt();
    expect(wrapper.find("#change-title").element.value).toBe("Lama");
    expect(wrapper.find('[data-testid="md"]').element.value).toBe("Desk lama");
    expect(wrapper.find("#change-start-bid").element.value).toBe("10000");
    expect(wrapper.find("#change-closed-at").element.value).toBe("2026-12-31T20:30");
  });

  it("validasi ketika dikosongkan", async () => {
    const { wrapper } = await mountIt();
    await wrapper.find("#change-title").setValue("");
    await wrapper.find('[data-testid="md"]').setValue("");
    await wrapper.find("#change-start-bid").setValue("0");
    await wrapper.find("#change-closed-at").setValue("");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.findAll("p.text-red-700")).toHaveLength(4);
    expect(api.changeAucation).not.toHaveBeenCalled();
  });

  it("gagal menampilkan dialog error", async () => {
    api.changeAucation.mockResolvedValue({ status: "fail", message: "Gagal ubah" });
    const { wrapper } = await mountIt();
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Gagal ubah" }));
  });

  it("sukses mengirim perubahan lalu emit saved/close", async () => {
    api.changeAucation.mockResolvedValue({ status: "success", message: "Diubah" });
    const { wrapper } = await mountIt();
    await wrapper.find("#change-title").setValue("Baru");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.changeAucation).toHaveBeenCalledWith(7, {
      title: "Baru",
      description: "Desk lama",
      startBid: 10000,
      closedAt: "2026-12-31 20:30:00",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("label loading dan tombol batal", async () => {
    const { wrapper } = await mountIt({ state: { aucations: { isAucationChange: true } } });
    expect(wrapper.find('button[type="submit"]').text()).toBe("Menyimpan...");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol X pada header menutup dialog", async () => {
    const { wrapper } = await mountIt();
    await wrapper.find('button[aria-label="Tutup dialog"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
