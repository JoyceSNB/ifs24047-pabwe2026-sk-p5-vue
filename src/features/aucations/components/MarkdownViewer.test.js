import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownViewer from "./MarkdownViewer.vue";

const state = vi.hoisted(() => ({ instances: [] }));
vi.mock("@toast-ui/editor/viewer", () => ({
  default: class {
    constructor(options) {
      this.options = options;
      this.setMarkdown = vi.fn();
      this.destroy = vi.fn();
      state.instances.push(this);
    }
  },
}));

describe("MarkdownViewer", () => {
  it("merender konten, memperbarui saat props berubah, dan membersihkan", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "# Halo" } });
    await vi.waitFor(() => expect(state.instances).toHaveLength(1));
    const [viewer] = state.instances;
    expect(viewer.options.initialValue).toBe("# Halo");
    await wrapper.setProps({ content: "baru" });
    expect(viewer.setMarkdown).toHaveBeenCalledWith("baru");
    wrapper.unmount();
    expect(viewer.destroy).toHaveBeenCalled();
  });

  it("aman bila konten berubah/di-unmount sebelum viewer siap", async () => {
    const wrapper = mount(MarkdownViewer);
    await wrapper.setProps({ content: "x" });
    expect(() => wrapper.unmount()).not.toThrow();
  });
});