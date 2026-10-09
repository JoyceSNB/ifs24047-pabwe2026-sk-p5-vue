<script setup>
import { computed, ref } from "vue";
import ModalShell from "../components/ModalShell.vue";
import { useInput } from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucationId: { type: [Number, String], required: true },
  startBid: { type: Number, required: true },
  highestBid: { type: Number, default: 0 },
});
const emit = defineEmits(["close", "saved"]);
const store = useAucationsStore();
const bid = useInput("");
const error = ref("");

const hint = computed(() =>
  props.highestBid > 0
    ? `Penawaran tertinggi saat ini ${formatRupiah(props.highestBid)}. Tawaranmu harus lebih tinggi.`
    : `Belum ada penawaran. Minimal ${formatRupiah(props.startBid)}.`
);

const isValid = (value) =>
  props.highestBid > 0 ? value > props.highestBid : value >= props.startBid;

const onSubmit = async () => {
  const value = Number(bid.value.value);
  if (!isValid(value)) {
    error.value = props.highestBid > 0
      ? `Nominal tawaran harus lebih tinggi dari ${formatRupiah(props.highestBid)}.`
      : `Nominal tawaran minimal ${formatRupiah(props.startBid)}.`;
    return;
  }
  error.value = "";
  const success = await store.addBid(props.aucationId, value);
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
  <ModalShell title="Ajukan Penawaran" title-id="bid-modal-title" @close="emit('close')">
    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <p class="text-sm text-slate-700" data-testid="bid-hint">{{ hint }}</p>
      <div>
        <label for="bid-amount" class="block text-sm font-semibold text-slate-800">Nominal tawaran (Rp)</label>
        <input id="bid-amount" type="number" min="0" :value="bid.value.value" class="mt-1 w-full rounded-lg border border-slate-400 px-3 py-2.5" :aria-invalid="Boolean(error)" @input="bid.onChange" />
        <p v-if="error" class="mt-1 text-sm text-red-700" role="alert">{{ error }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="rounded-lg px-4 py-2.5 font-semibold text-slate-800 hover:bg-slate-100" @click="emit('close')">Batal</button>
        <button type="submit" :disabled="store.isBidAdd" class="rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-70">
          {{ store.isBidAdd ? "Mengirim..." : "Kirim tawaran" }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>
