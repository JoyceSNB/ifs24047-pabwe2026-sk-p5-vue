<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  content: { type: String, default: "" },
});

const root = ref(null);
let viewer = null;

onMounted(async () => {
  const [{ default: Viewer }] = await Promise.all([
    import("@toast-ui/editor/viewer"),
    import("@toast-ui/editor/dist/toastui-editor-viewer.css"),
  ]);
  viewer = new Viewer({ el: root.value, initialValue: props.content });
});

watch(
  () => props.content,
  (value) => {
    if (viewer) viewer.setMarkdown(value);
  }
);

onBeforeUnmount(() => {
  if (viewer) viewer.destroy();
});
</script>

<template>
  <div ref="root" class="markdown-viewer" data-testid="markdown-viewer"></div>
</template>
