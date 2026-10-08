<template>
  <div class="p-4 md:p-8">
    <div
      class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
    >
      <div>
        <p
          class="text-sm text-indigo-600 font-semibold"
        >
          Marketplace lelang
        </p>

        <h1
          class="text-3xl font-extrabold text-slate-900"
        >
          Lelang
        </h1>

        <p
          class="text-slate-500 mt-1"
        >
          Temukan barang menarik dan
          ajukan tawaran terbaik.
        </p>
      </div>

      <button
        data-testid="open-add-modal"
        @click="showAdd = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold"
      >
        + Tambah Lelang
      </button>
    </div>

    <div
      class="flex gap-2 border-b mb-5"
    >
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="{
          path: '/',
          query: {
            tab: tab.key,
          },
        }"
        class="px-4 py-2.5 text-sm font-semibold border-b-2"
        :class="
          activeTab === tab.key
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500'
        "
      >
        {{ tab.label }}
      </RouterLink>
    </div>

    <div class="mb-6">
      <input
        v-model="search"
        data-testid="auction-search"
        placeholder="Cari lelang..."
        class="w-full md:max-w-md border border-slate-200 rounded-xl px-4 py-3 bg-white"
      />
    </div>

    <div
      v-if="store.loading"
      class="py-12 text-center"
    >
      Memuat...
    </div>

    <div
      v-else-if="filtered.length === 0"
      data-testid="empty-auctions"
      class="py-12 text-center text-slate-500"
    >
      Tidak ada lelang.
    </div>

    <div
      v-else
      class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      <article
        v-for="a in filtered"
        :key="a.id"
        class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md"
      >
        <div
          class="h-40 bg-slate-100 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="a.cover"
            :src="a.cover"
            :alt="a.title || 'Cover lelang'"
            class="w-full h-full object-cover"
          />

          <span
            v-else
            class="text-4xl"
          >
            🔨
          </span>
        </div>

        <div class="p-5">
          <h2
            class="font-bold text-lg line-clamp-1"
          >
            {{ a.title }}
          </h2>

          <p
            class="text-sm text-slate-500 mt-1 line-clamp-2"
          >
            {{ a.description }}
          </p>

          <div
            class="mt-4 flex justify-between items-end"
          >
            <div>
              <p
                class="text-xs text-slate-400"
              >
                Harga awal
              </p>

              <p
                class="font-bold text-indigo-700"
              >
                {{ formatRupiah(a.start_bid) }}
              </p>
            </div>

            <RouterLink
              :to="`/aucations/${a.id}`"
              class="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm"
            >
              Lihat
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <AddModal
      :show="showAdd"
      @close="showAdd = false"
      @saved="load"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch,
} from "vue";

import {
  useRoute,
  RouterLink,
} from "vue-router";

import {
  useAucationsStore,
} from "../states/aucationsStore";

import {
  formatRupiah,
} from "../../../helpers/toolsHelper";

import AddModal from "../modals/AddModal.vue";

const route = useRoute();

const store =
  useAucationsStore();

const search = ref("");

const showAdd = ref(false);

const tabs = [
  {
    key: "open",
    label: "Semua",
  },
  {
    key: "me",
    label: "Lelang Saya",
  },
  {
    key: "closed",
    label: "Ditutup",
  },
];

const activeTab = computed(
  () =>
    route.query.tab || "open",
);

const filtered = computed(() => {
  const query =
    search.value
      .trim()
      .toLowerCase();

  if (!query) {
    return store.aucations;
  }

  return store.aucations.filter(
    (auction) => {
      const title =
        auction.title
          ?.toLowerCase() || "";

      const description =
        auction.description
          ?.toLowerCase() || "";

      return (
        title.includes(query) ||
        description.includes(query)
      );
    },
  );
});

function getAuctionQuery() {
  if (activeTab.value === "me") {
    return {
      is_me: true,
    };
  }

  if (
    activeTab.value === "closed"
  ) {
    return {
      is_closed: false,
    };
  }

  return {
    is_closed: true,
  };
}

async function load() {
  await store.asyncGetAucations(
    getAuctionQuery(),
  );
}

onMounted(load);

watch(
  activeTab,
  () => {
    load();
  },
);
</script>