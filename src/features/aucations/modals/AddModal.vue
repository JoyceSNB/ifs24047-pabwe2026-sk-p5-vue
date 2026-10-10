<script setup>
import { ref } from "vue";
import ModalShell from "../components/ModalShell.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import { validateAucationForm } from "../../../helpers/aucationForm";
import { showErrorDialog, showSuccessDialog, toApiDateTime } from "../../../helpers/toolsHelper";

const emit = defineEmits(["close", "saved"]);
const store = useAucationsStore();
const title = useInput("");
const startBid = useInput("");
const closedAt = useInput("");
const description = ref("");
const errors = ref({});

const validate = () => {
  errors.value = validateAucationForm({
    title: title.value.value,
    description: description.value,
    startBid: startBid.value.value,
    closedAt: closedAt.value.value,
  });
  return Object.keys(errors.value).length === 0;
};

const onSubmit = async () => {
  if (!validate()) return;
  const success = await store.addAucation({
    title: title.value.value.trim(),
    description: description.value,
    startBid: Number(startBid.value.value),
    closedAt: toApiDateTime(closedAt.value.value),
  });
  if (!success) {
    await showErrorDialog(store.message);
    return;
  }
  await showSuccessDialog(store.message);
  emit("saved");
  emit("close");
};
</script>

<template>
  <ModalShell title="Tambah Lelang Baru" title-id="add-modal-title" @close="emit('close')">
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <div>
        <label for="add-title" class="block text-sm font-semibold text-slate-800">Judul barang</label>
        <input id="add-title" type="text" :value="title.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" :aria-invalid="Boolean(errors.title)" @input="title.onChange" />
        <p v-if="errors.title" class="mt-1 text-sm text-red-700">{{ errors.title }}</p>
      </div>

      <div>
        <p class="mb-1 text-sm font-semibold text-slate-800">Deskripsi (Markdown)</p>
        <MarkdownEditor v-model="description" label="Deskripsi barang lelang" />
        <p v-if="errors.description" class="mt-1 text-sm text-red-700">{{ errors.description }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="add-start-bid" class="block text-sm font-semibold text-slate-800">Harga awal (Rp)</label>
          <input id="add-start-bid" type="number" min="0" :value="startBid.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" :aria-invalid="Boolean(errors.startBid)" @input="startBid.onChange" />
          <p v-if="errors.startBid" class="mt-1 text-sm text-red-700">{{ errors.startBid }}</p>
        </div>
        <div>
          <label for="add-closed-at" class="block text-sm font-semibold text-slate-800">Ditutup pada</label>
          <input id="add-closed-at" type="datetime-local" :value="closedAt.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" :aria-invalid="Boolean(errors.closedAt)" @input="closedAt.onChange" />
          <p v-if="errors.closedAt" class="mt-1 text-sm text-red-700">{{ errors.closedAt }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-lg px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-100" @click="emit('close')">Batal</button>
        <button type="submit" :disabled="store.isAucationAdd" class="rounded-lg bg-indigo-950 px-5 py-2.5 font-semibold text-white hover:bg-indigo-900 disabled:opacity-70">
          {{ store.isAucationAdd ? "Menyimpan..." : "Simpan lelang" }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>