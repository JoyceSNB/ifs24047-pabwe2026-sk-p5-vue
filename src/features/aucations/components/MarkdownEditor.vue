<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Deskripsi" },
});
const emit = defineEmits(["update:modelValue"]);

const root = ref(null);
let editor = null;

onMounted(async () => {
  const [{ default: Editor }] = await Promise.all([
    import("@toast-ui/editor"),
    import("@toast-ui/editor/dist/toastui-editor.css"),
  ]);
  editor = new Editor({
    el: root.value,
    initialValue: props.modelValue,
    height: "240px",
    initialEditType: "wysiwyg",
    previewStyle: "tab",
    usageStatistics: false,
    hideModeSwitch: true,
  });
  editor.on("change", () => emit("update:modelValue", editor.getMarkdown()));
});

onBeforeUnmount(() => {
  if (editor) editor.destroy();
});
</script>

<template>
  <div role="group" :aria-label="label">
    <div ref="root" data-testid="markdown-editor"></div>
  </div>
</template>
