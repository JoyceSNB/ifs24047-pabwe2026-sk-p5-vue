import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
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

const fill = async (wrapper, { title = "Jam Tangan", desc = "Antik", bid = "50000", closed = "2026-12-31T23:59" } = {}) => {
  await wrapper.find("#add-title").setValue(title);
  await wrapper.find('[data-testid="md"]').setValue(desc);
  await wrapper.find("#add-start-bid").setValue(bid);
  await wrapper.find("#add-closed-at").setValue(closed);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("AddModal", () => {
  it("menampilkan error validasi", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { global: { stubs } });
    await fill(wrapper, { title: "", desc: "", bid: "0", closed: "" });
    ["Judul wajib diisi.", "Deskripsi wajib diisi.", "Harga awal harus lebih dari 0.", "Batas waktu wajib diisi."].forEach((m) =>
      expect(wrapper.text()).toContain(m)
    );
    expect(api.addAucation).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error bila API gagal", async () => {
    api.addAucation.mockResolvedValue({ status: "fail", message: "Gagal tambah" });
    const { wrapper } = await renderWithProviders(AddModal, { global: { stubs } });
    await fill(wrapper);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Gagal tambah" }));
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("mengirim data yang benar dan emit saved + close", async () => {
    api.addAucation.mockResolvedValue({ status: "success", message: "Ditambahkan" });
    const { wrapper } = await renderWithProviders(AddModal, { global: { stubs } });
    await fill(wrapper);
    expect(api.addAucation).toHaveBeenCalledWith({
      title: "Jam Tangan",
      description: "Antik",
      startBid: 50000,
      closedAt: "2026-12-31 23:59:00",
    });
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol batal dan label loading", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { global: { stubs }, state: { aucations: { isAucationAdd: true } } });
    expect(wrapper.find('button[type="submit"]').text()).toBe("Menyimpan...");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("tombol X pada header menutup dialog", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { global: { stubs } });
    await wrapper.find('button[aria-label="Tutup dialog"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
