<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Clock, Gavel, ImageOff, Plus, Search, Trash2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import AddModal from "../modals/AddModal.vue";
import {
  assetUrl,
  formatRupiah,
  getHighestBid,
  getTimeLeft,
  isAucationClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const tabs = [
  { key: "all", label: "Semua Lelang" },
  { key: "mine", label: "Lelang Saya" },
  { key: "open", label: "Lelang Berlangsung" },
  { key: "closed", label: "Lelang Ditutup" },
];

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const usersStore = useUsersStore();

const keyword = ref("");
const showAdd = ref(false);
const now = ref(Date.now());
let timer = null;

const activeTab = computed(() =>
  tabs.some((t) => t.key === route.query.tab) ? route.query.tab : "all"
);

const load = () =>
  store.fetchAucations(activeTab.value === "mine" ? { isMe: true } : {});

const visible = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return store.aucations
    .filter((item) => {
      const closed = isAucationClosed(item.closed_at, now.value);
      if (activeTab.value === "open") return !closed;
      if (activeTab.value === "closed") return closed;
      return true;
    })
    .filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(q));
});

const isOwner = (item) => usersStore.profile?.id === item.user_id;

const selectTab = (key) =>
  router.replace({ path: "/", query: key === "all" ? {} : { tab: key } });

const onDelete = async (item) => {
  if (!(await showConfirmDialog(`Hapus lelang "${item.title}"?`, "Ya, hapus"))) return;
  if (await store.deleteAucation(item.id)) {
    await showSuccessDialog(store.message);
    await load();
  } else {
    await showErrorDialog(store.message);
  }
};

const onDeleteAll = async () => {
  if (!(await showConfirmDialog("Semua lelang milikmu akan dihapus permanen.", "Ya, hapus semua"))) return;
  if (await store.deleteAllAucations()) {
    await showSuccessDialog(store.message);
    await load();
  } else {
    await showErrorDialog(store.message);
  }
};

const onSaved = () => load();

onMounted(() => {
  load();
  timer = setInterval(() => {
    now.value = Date.now();
  }, 30000);
});
onBeforeUnmount(() => clearInterval(timer));
watch(activeTab, load);
</script>

<template>
  <section aria-labelledby="home-title">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 id="home-title" class="text-3xl font-extrabold text-indigo-950">Dashboard Lelang</h1>
        <p class="mt-1 text-slate-700">Temukan barang incaranmu atau pasang lelang baru.</p>
      </div>
      <button type="button" class="flex items-center gap-2 rounded-lg bg-indigo-950 px-4 py-2.5 font-semibold text-white hover:bg-indigo-900" @click="showAdd = true">
        <Plus class="size-5" aria-hidden="true" />
        Tambah Lelang
      </button>
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
      <fieldset aria-label="Filter lelang" class="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :aria-pressed="activeTab === tab.key"
          :class="[activeTab === tab.key ? 'bg-indigo-950 text-white' : 'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50', 'rounded-full px-4 py-2 text-sm font-semibold']"
          @click="selectTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </fieldset>

      <div class="relative w-full sm:w-72">
        <label for="search-input" class="sr-only">Cari lelang</label>
        <Search class="pointer-events-none absolute left-3 top-3 size-5 text-slate-600" aria-hidden="true" />
        <input id="search-input" v-model="keyword" type="search" placeholder="Cari judul atau deskripsi" class="w-full rounded-lg border border-slate-400 bg-white py-2.5 pl-10 pr-3" />
      </div>
    </div>

    <div v-if="activeTab === 'mine' && visible.length" class="mt-4">
      <button type="button" class="flex items-center gap-2 text-sm font-semibold text-red-700 underline" @click="onDeleteAll">
        <Trash2 class="size-4" aria-hidden="true" />
        Hapus semua lelang saya
      </button>
    </div>

    <output v-if="store.isAucation" class="mt-10 block text-slate-700">Memuat lelang...</output>
    <p v-else-if="!visible.length" class="mt-10 rounded-xl border border-dashed border-slate-400 p-10 text-center text-slate-700">
      Belum ada lelang yang cocok dengan filter ini.
    </p>

    <ul v-else class="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-testid="aucation-list">
      <li v-for="item in visible" :key="item.id" class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <img v-if="item.cover" :src="assetUrl(item.cover)" :alt="`Cover ${item.title}`" class="h-44 w-full object-cover" loading="lazy" />
        <div v-else class="flex h-44 items-center justify-center bg-slate-200 text-slate-700">
          <ImageOff class="size-10" aria-hidden="true" />
          <span class="sr-only">Tidak ada cover</span>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <h2 class="text-lg font-bold text-indigo-950">{{ item.title }}</h2>
          <p class="text-sm text-slate-700">oleh {{ item.author.name }}</p>

          <dl class="mt-4 space-y-1 text-sm">
            <div class="flex justify-between"><dt class="text-slate-700">Harga awal</dt><dd class="font-semibold">{{ formatRupiah(item.start_bid) }}</dd></div>
            <div class="flex justify-between">
              <dt class="text-slate-700">Tawaran</dt>
              <dd class="font-bold text-amber-800">
                {{ item.bids.length ? `${item.bids.length} penawaran` : "Belum ada" }}{{ getHighestBid(item.bids) ? ` · ${formatRupiah(getHighestBid(item.bids))}` : "" }}
              </dd>
            </div>
          </dl>

          <p class="mt-4 flex items-center gap-2 text-sm font-semibold" :class="isAucationClosed(item.closed_at, now) ? 'text-red-700' : 'text-emerald-800'">
            <Clock class="size-4" aria-hidden="true" />
            {{ getTimeLeft(item.closed_at, now) }}
          </p>

          <div class="mt-5 flex items-center gap-3 pt-1">
            <RouterLink :to="`/aucations/${item.id}`" class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-900">
              <Gavel class="size-4" aria-hidden="true" />
              Lihat detail
            </RouterLink>
            <button v-if="isOwner(item)" type="button" :aria-label="`Hapus lelang ${item.title}`" class="rounded-lg p-2.5 text-red-700 ring-1 ring-red-300 hover:bg-red-50" @click="onDelete(item)">
              <Trash2 class="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="onSaved" />
  </section>
</template>