<script setup>
import { onMounted, ref } from "vue";
import { X } from "lucide-vue-next";

defineProps({
  title: { type: String, required: true },
  titleId: { type: String, required: true },
});
const emit = defineEmits(["close"]);
const panel = ref(null);

onMounted(() => panel.value.focus());
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4" @click.self="emit('close')">
    <dialog
      open
      ref="panel"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      class="static m-0 max-h-[92vh] w-full max-w-full overflow-y-auto rounded-t-2xl border-0 bg-white p-6 text-slate-900 shadow-xl sm:max-w-xl sm:rounded-2xl"
      @keydown.esc="emit('close')"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <h2 :id="titleId" class="text-xl font-bold text-indigo-950">{{ title }}</h2>
        <button type="button" aria-label="Tutup dialog" class="rounded-lg p-1 text-slate-700 hover:bg-slate-100" @click="emit('close')">
          <X class="size-5" aria-hidden="true" />
        </button>
      </div>
      <slot />
    </dialog>
  </div>
</template>