import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/aucationApi";
import Swal from "sweetalert2";

vi.mock("../api/aucationApi");
const mountIt = (aucation = { id: 3, cover: "img/c.png" }, extra = {}) =>
  renderWithProviders(ChangeCoverModal, { props: { aucation }, ...extra });

const pick = async (wrapper, file) => {
  const input = wrapper.find("#cover-file");
  Object.defineProperty(input.element, "files", { value: file ? [file] : [], configurable: true });
  await input.trigger("change");
};
const image = () => new File(["x"], "c.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  it("menampilkan cover saat ini, atau tanpa pratinjau bila belum ada", async () => {
    const withCover = await mountIt();
    expect(withCover.wrapper.find('[data-testid="cover-preview"]').attributes("src")).toBe("https://open-api.delcom.org/img/c.png");
    const without = await mountIt({ id: 3 });
    expect(without.wrapper.find('[data-testid="cover-preview"]').exists()).toBe(false);
  });

  it("menolak submit tanpa file atau dengan file non-gambar", async () => {
    const { wrapper } = await mountIt();
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Pilih berkas gambar");
    await pick(wrapper, new File(["x"], "a.pdf", { type: "application/pdf" }));
    await wrapper.find("form").trigger("submit");
    expect(wrapper.text()).toContain("Pilih berkas gambar");
    await pick(wrapper, null);
    expect(api.changeCover).not.toHaveBeenCalled();
  });

  it("pratinjau live saat memilih gambar lalu berhasil unggah", async () => {
    api.changeCover.mockResolvedValue({ status: "success", message: "Cover diganti" });
    const { wrapper } = await mountIt();
    const file = image();
    await pick(wrapper, file);
    expect(wrapper.find('[data-testid="cover-preview"]').attributes("src")).toBe("blob:preview");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(api.changeCover).toHaveBeenCalledWith(3, file);
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
    wrapper.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("gagal unggah menampilkan dialog error", async () => {
    api.changeCover.mockResolvedValue({ status: "fail", message: "Gagal cover" });
    const { wrapper } = await mountIt();
    await pick(wrapper, image());
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Gagal cover" }));
  });

  it("label loading, batal, dan tanpa revoke bila tidak ada file", async () => {
    const { wrapper } = await mountIt(undefined, { state: { aucations: { isAucationChangeCover: true } } });
    expect(wrapper.find('button[type="submit"]').text()).toBe("Mengunggah...");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    wrapper.unmount();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("tombol X pada header menutup dialog", async () => {
    const { wrapper } = await mountIt();
    await wrapper.find('button[aria-label="Tutup dialog"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
