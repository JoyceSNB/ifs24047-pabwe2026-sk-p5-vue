<script setup>
import { onBeforeUnmount, ref } from "vue";
import ModalShell from "../components/ModalShell.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { assetUrl, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucation: { type: Object, required: true },
});
const emit = defineEmits(["close", "saved"]);
const store = useAucationsStore();
const file = ref(null);
const preview = ref(assetUrl(props.aucation.cover));
const error = ref("");

const onFileChange = (event) => {
  const [selected] = event.target.files;
  file.value = selected || null;
  error.value = "";
  if (selected) preview.value = URL.createObjectURL(selected);
};

const onSubmit = async () => {
  if (!file.value || !file.value.type.startsWith("image/")) {
    error.value = "Pilih berkas gambar (JPG, PNG, atau WEBP).";
    return;
  }
  const success = await store.changeCover(props.aucation.id, file.value);
  if (!success) {
    await showErrorDialog(store.message);
    return;
  }
  await showSuccessDialog(store.message);
  emit("saved");
  emit("close");
};

onBeforeUnmount(() => {
  if (file.value) URL.revokeObjectURL(preview.value);
});
</script>

<template>
  <ModalShell title="Ganti Cover Lelang" title-id="cover-modal-title" @close="emit('close')">
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <img v-if="preview" :src="preview" alt="Pratinjau cover lelang" class="h-56 w-full rounded-lg bg-slate-100 object-cover" data-testid="cover-preview" />
      <div>
        <label for="cover-file" class="block text-sm font-semibold text-slate-800">Berkas gambar</label>
        <input id="cover-file" type="file" accept="image/*" class="mt-1 block w-full text-sm text-slate-800" :aria-invalid="Boolean(error)" @change="onFileChange" />
        <p v-if="error" class="mt-1 text-sm text-red-700">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-lg px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-100" @click="emit('close')">Batal</button>
        <button type="submit" :disabled="store.isAucationChangeCover" class="rounded-lg bg-indigo-950 px-5 py-2.5 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70">
          {{ store.isAucationChangeCover ? "Mengunggah..." : "Unggah cover" }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>
