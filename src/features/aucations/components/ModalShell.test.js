import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ModalShell from "./ModalShell.vue";

const render = () =>
  mount(ModalShell, {
    props: { title: "Judul", titleId: "t-id" },
    slots: { default: "<p>isi</p>" },
    attachTo: document.body,
  });

describe("ModalShell", () => {
  it("menampilkan dialog beraksesibilitas dan fokus ke panel", () => {
    const wrapper = render();
    const dialog = wrapper.find('[role="dialog"]');
    expect(dialog.attributes("aria-labelledby")).toBe("t-id");
    expect(wrapper.find("#t-id").text()).toBe("Judul");
    expect(wrapper.text()).toContain("isi");
    expect(document.activeElement).toBe(dialog.element);
  });

  it("emit close lewat tombol, Escape, dan klik backdrop", async () => {
    const wrapper = render();
    await wrapper.find('button[aria-label="Tutup dialog"]').trigger("click");
    await wrapper.find('[role="dialog"]').trigger("keydown.esc");
    await wrapper.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});
