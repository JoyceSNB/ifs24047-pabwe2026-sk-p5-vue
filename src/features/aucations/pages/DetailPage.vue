<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Clock, ImageOff } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import BidModal from "../modals/BidModal.vue";
import {
  assetUrl,
  formatDate,
  formatRupiah,
  getHighestBid,
  getTimeLeft,
  isAucationClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const usersStore = useUsersStore();

const modal = ref("");
const item = computed(() => store.aucation);
const isOwner = computed(() => usersStore.profile?.id === item.value?.user_id);
const isClosed = computed(() => isAucationClosed(item.value.closed_at));
const highest = computed(() => getHighestBid(item.value.bids));
const history = computed(() => [...item.value.bids].sort((a, b) => b.bid - a.bid));

const load = () => store.fetchAucation(route.params.aucationId);

const report = async (success, then) => {
  if (!success) return showErrorDialog(store.message);
  await showSuccessDialog(store.message);
  await then();
};

const onDelete = async () => {
  if (!(await showConfirmDialog("Lelang ini akan dihapus permanen.", "Ya, hapus"))) return;
  await report(await store.deleteAucation(item.value.id), () => router.push("/"));
};

const onCancelBid = async () => {
  if (!(await showConfirmDialog("Batalkan penawaranmu pada lelang ini?", "Ya, batalkan"))) return;
  await report(await store.deleteBid(item.value.id), load);
};

const onSaved = () => load();

onMounted(() => {
  // Kosongkan data lelang sebelumnya agar tidak tampil sekilas saat berpindah item.
  store.$patch({ aucation: null });
  load();
});
</script>

<template>
  <section aria-labelledby="detail-title">
    <RouterLink to="/" class="text-sm font-semibold text-indigo-800 underline">Kembali ke dashboard</RouterLink>

    <p v-if="store.isAucation && !item" role="status" class="mt-10 text-slate-700">Memuat detail lelang...</p>
    <p v-else-if="!item" class="mt-10 rounded-xl border border-dashed border-slate-400 p-10 text-center text-slate-700">
      Lelang tidak ditemukan.
    </p>

    <div v-else class="mt-6 grid gap-8 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <img v-if="item.cover" :src="assetUrl(item.cover)" :alt="`Cover ${item.title}`" class="h-72 w-full rounded-2xl object-cover sm:h-96" />
        <div v-else class="flex h-72 w-full items-center justify-center rounded-2xl bg-slate-200 text-slate-700 sm:h-96">
          <ImageOff class="size-14" aria-hidden="true" />
          <span class="sr-only">Tidak ada cover</span>
        </div>

        <h1 id="detail-title" class="mt-6 text-3xl font-extrabold text-indigo-950">{{ item.title }}</h1>
        <p class="mt-1 text-slate-700">oleh {{ item.author.name }}</p>

        <h2 class="mt-8 text-lg font-bold text-slate-900">Deskripsi</h2>
        <div class="mt-2 rounded-xl bg-white p-4 ring-1 ring-slate-200">
          <MarkdownViewer :content="item.description" />
        </div>
      </div>

      <aside class="space-y-6 lg:col-span-2" aria-label="Informasi penawaran">
        <div class="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between"><dt class="text-slate-700">Harga awal</dt><dd class="font-semibold">{{ formatRupiah(item.start_bid) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-700">Tawaran tertinggi</dt><dd class="text-lg font-extrabold text-amber-800" data-testid="highest-bid">{{ highest ? formatRupiah(highest) : "Belum ada" }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-700">Ditutup</dt><dd class="font-semibold">{{ formatDate(item.closed_at) }}</dd></div>
          </dl>
          <p class="mt-4 flex items-center gap-2 font-semibold" :class="isClosed ? 'text-red-700' : 'text-emerald-800'">
            <Clock class="size-5" aria-hidden="true" />
            {{ getTimeLeft(item.closed_at) }}
          </p>

          <div v-if="isOwner" class="mt-6 flex flex-wrap gap-3">
            <button type="button" class="rounded-lg bg-indigo-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-900" @click="modal = 'change'">Ubah data</button>
            <button type="button" class="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-400 hover:bg-slate-50" @click="modal = 'cover'">Ganti cover</button>
            <button type="button" class="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-300 hover:bg-red-50" @click="onDelete">Hapus</button>
          </div>
          <div v-else-if="!isClosed" class="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" class="rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800" @click="modal = 'bid'">Ajukan penawaran</button>
            <button v-if="item.my_bid" type="button" class="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-300 hover:bg-red-50" @click="onCancelBid">Batalkan tawaranku</button>
          </div>
          <p v-if="item.my_bid" class="mt-4 text-sm text-slate-800" data-testid="my-bid">Tawaranmu: <strong>{{ formatRupiah(item.my_bid.bid) }}</strong></p>
        </div>

        <div class="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
          <h2 class="text-lg font-bold text-slate-900">Riwayat penawaran</h2>
          <p v-if="!history.length" class="mt-2 text-sm text-slate-700">Belum ada yang menawar.</p>
          <ol v-else class="mt-3 divide-y divide-slate-200" data-testid="bid-history">
            <li v-for="entry in history" :key="entry.id" class="flex items-center justify-between py-2 text-sm">
              <span class="font-semibold">{{ formatRupiah(entry.bid) }}</span>
              <time :datetime="entry.created_at" class="text-slate-700">{{ formatDate(entry.created_at) }}</time>
            </li>
          </ol>
        </div>
      </aside>
    </div>

    <ChangeModal v-if="modal === 'change'" :aucation="item" @close="modal = ''" @saved="onSaved" />
    <ChangeCoverModal v-if="modal === 'cover'" :aucation="item" @close="modal = ''" @saved="onSaved" />
    <BidModal v-if="modal === 'bid'" :aucation-id="item.id" :start-bid="item.start_bid" :highest-bid="highest" @close="modal = ''" @saved="onSaved" />
  </section>
</template>
