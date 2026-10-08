<template>
  <div class="p-4 md:p-8 max-w-5xl mx-auto">
    <RouterLink to="/" class="text-sm text-indigo-600">
      ← Kembali
    </RouterLink>

    <div v-if="store.loading" class="py-12 text-center">
      Memuat...
    </div>

    <div v-else-if="!auction" class="py-12 text-center">
      <h1 class="text-2xl font-bold">
        Lelang tidak ditemukan
      </h1>
    </div>

    <div
      v-else
      class="mt-5 grid lg:grid-cols-[1.5fr_1fr] gap-6"
    >
      <section class="bg-white border rounded-2xl overflow-hidden">
        <div class="h-72 bg-slate-100 flex items-center justify-center">
          <img
            v-if="auction.cover"
            :src="auction.cover"
            class="w-full h-full object-cover"
          />

          <span v-else class="text-6xl">
            🔨
          </span>
        </div>

        <div class="p-6">
          <div class="flex justify-between gap-4">
            <div>
              <h1 class="text-3xl font-extrabold">
                {{ auction.title }}
              </h1>

              <p class="text-sm text-slate-500 mt-2">
                Berakhir {{ formatDate(auction.closed_at) }}
              </p>
            </div>

            <button
              v-if="isMine"
              @click="showChange = true"
              class="px-3 py-2 h-fit rounded-lg border"
            >
              Edit
            </button>
          </div>

          <MarkdownViewer
            class="mt-6"
            :value="auction.description"
          />
        </div>
      </section>

      <aside class="bg-white border rounded-2xl p-6 h-fit">
        <p class="text-sm text-slate-500">
          Harga awal
        </p>

        <p class="text-2xl font-extrabold text-indigo-700">
          {{ formatRupiah(auction.start_bid) }}
        </p>

        <p class="text-sm text-slate-500 mt-5">
          Tawaran tertinggi
        </p>

        <p class="text-xl font-bold">
          {{
            highestBid === null
              ? "-"
              : formatRupiah(highestBid)
          }}
        </p>

        <button
          v-if="!isMine && !closed"
          data-testid="open-bid-modal"
          @click="showBid = true"
          class="w-full mt-6 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
        >
          Ajukan Tawaran
        </button>

        <button
          v-if="canCancel"
          data-testid="cancel-bid-btn"
          @click="cancelBid"
          class="w-full mt-3 px-4 py-3 rounded-xl border border-red-200 text-red-600"
        >
          Batalkan Tawaran
        </button>

        <h2 class="font-bold mt-8 mb-3">
          Riwayat Tawaran
        </h2>

        <div class="space-y-2">
          <div
            v-for="b in bids"
            :key="b.id"
            class="flex justify-between text-sm border-b pb-2"
          >
            <span>
              {{
                b.user?.name ||
                b.user?.username ||
                "Penawar"
              }}
            </span>

            <strong>
              {{ formatRupiah(b.bid) }}
            </strong>
          </div>

          <p
            v-if="!bids.length"
            class="text-sm text-slate-400"
          >
            Belum ada tawaran.
          </p>
        </div>
      </aside>
    </div>

    <BidModal
      :show="showBid"
      :aucation="auction"
      @close="showBid = false"
      @saved="load"
    />

    <ChangeModal
      :show="showChange"
      :aucation="auction"
      @close="showChange = false"
      @saved="load"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
} from "vue";

import {
  RouterLink,
  useRoute,
} from "vue-router";

import {
  useAucationsStore,
} from "../states/aucationsStore";

import {
  useAuthStore,
} from "../../auth/states/authStore";

import {
  formatRupiah,
  formatDate,
  showConfirmDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

import {
  getHighestBid,
  isClosed,
} from "../helpers/aucationHelper";

import MarkdownViewer from "../components/MarkdownViewer.vue";
import BidModal from "../modals/BidModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";

const route = useRoute();
const store = useAucationsStore();
const auth = useAuthStore();

const showBid = ref(false);
const showChange = ref(false);

const auction = computed(() => store.aucation);

const highestBid = computed(() =>
  getHighestBid(auction.value)
);

const bids = computed(() =>
  auction.value?.bids || []
);

const closed = computed(() =>
  isClosed(auction.value)
);

const isMine = computed(() =>
  auction.value?.is_mine ??
  auction.value?.user_id === auth.user?.id
);

const canCancel = computed(() =>
  bids.value.some(
    (b) =>
      b.user_id === auth.user?.id ||
      b.user?.id === auth.user?.id
  )
);

async function load() {
  await store.asyncGetAucation(
    route.params.aucationId
  );
}

async function cancelBid() {
  if (
    await showConfirmDialog(
      "Batalkan tawaran ini?"
    )
  ) {
    await store.deleteBid(
      route.params.aucationId
    );

    await load();

    await showSuccessDialog(
      "Tawaran dibatalkan"
    );
  }
}

onMounted(load);
</script>