import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownEditor from "./MarkdownEditor.vue";

const state = vi.hoisted(() => ({ instances: [] }));
vi.mock("@toast-ui/editor", () => ({
  default: class {
    constructor(options) {
      this.options = options;
      this.destroy = vi.fn();
      state.instances.push(this);
    }
    on(event, callback) {
      this.callback = callback;
    }
    getMarkdown() {
      return "**tebal**";
    }
  },
}));

describe("MarkdownEditor", () => {
  it("membuat editor, meneruskan perubahan, dan menghancurkannya", async () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "awal" } });
    await vi.waitFor(() => expect(state.instances).toHaveLength(1));
    const [editor] = state.instances;
    expect(editor.options.initialValue).toBe("awal");
    editor.callback();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["**tebal**"]);
    wrapper.unmount();
    expect(editor.destroy).toHaveBeenCalled();
  });

  it("aman di-unmount sebelum editor selesai dimuat", () => {
    const wrapper = mount(MarkdownEditor);
    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe("Deskripsi");
    wrapper.unmount();
  });
});
