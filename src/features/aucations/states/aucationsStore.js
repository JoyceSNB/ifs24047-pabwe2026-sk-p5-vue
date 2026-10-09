import { defineStore } from "pinia";
import { ref } from "vue";
import * as aucationApi from "../api/aucationApi";

export const useAucationsStore = defineStore("aucations", () => {
  const aucations = ref([]);
  const aucation = ref(null);
  const isAucation = ref(false);

  const isAucationAdd = ref(false);
  const isAucationAdded = ref(false);
  const isAucationChange = ref(false);
  const isAucationChanged = ref(false);
  const isAucationChangeCover = ref(false);
  const isAucationChangedCover = ref(false);
  const isAucationDelete = ref(false);
  const isAucationDeleted = ref(false);
  const isBidAdd = ref(false);
  const isBidAdded = ref(false);
  const isBidDelete = ref(false);
  const isBidDeleted = ref(false);
  const isAucationDeleteAll = ref(false);
  const isAucationDeletedAll = ref(false);

  const message = ref("");
  const errors = ref({});

  const finish = (response) => {
    message.value = response.message;
    errors.value = response.data?.field || {};
    return response.status === "success";
  };

  /** Jalankan mutasi dan lacak status proses + status berhasil. */
  async function mutate(loading, done, request) {
    loading.value = true;
    done.value = false;
    const success = finish(await request());
    done.value = success;
    loading.value = false;
    return success;
  }

  async function fetchAucations(filters = {}) {
    isAucation.value = true;
    const response = await aucationApi.getAucations(filters);
    if (finish(response)) aucations.value = response.data.aucations;
    isAucation.value = false;
  }

  async function fetchAucation(id) {
    isAucation.value = true;
    const response = await aucationApi.getAucation(id);
    // Data lama dipertahankan selama memuat ulang agar halaman tidak berkedip.
    aucation.value = finish(response) ? response.data.aucation : null;
    isAucation.value = false;
  }

  const addAucation = (payload) =>
    mutate(isAucationAdd, isAucationAdded, () =>
      aucationApi.addAucation(payload)
    );

  const changeAucation = (id, payload) =>
    mutate(isAucationChange, isAucationChanged, () =>
      aucationApi.changeAucation(id, payload)
    );

  const changeCover = (id, file) =>
    mutate(isAucationChangeCover, isAucationChangedCover, () =>
      aucationApi.changeCover(id, file)
    );

  const deleteAucation = (id) =>
    mutate(isAucationDelete, isAucationDeleted, () =>
      aucationApi.deleteAucation(id)
    );

  const addBid = (id, bid) =>
    mutate(isBidAdd, isBidAdded, () => aucationApi.addBid(id, bid));

  const deleteBid = (id) =>
    mutate(isBidDelete, isBidDeleted, () => aucationApi.deleteBid(id));

  const deleteAllAucations = () =>
    mutate(isAucationDeleteAll, isAucationDeletedAll, () =>
      aucationApi.deleteAllAucations()
    );

  return {
    aucations,
    aucation,
    isAucation,
    isAucationAdd,
    isAucationAdded,
    isAucationChange,
    isAucationChanged,
    isAucationChangeCover,
    isAucationChangedCover,
    isAucationDelete,
    isAucationDeleted,
    isBidAdd,
    isBidAdded,
    isBidDelete,
    isBidDeleted,
    isAucationDeleteAll,
    isAucationDeletedAll,
    message,
    errors,
    fetchAucations,
    fetchAucation,
    addAucation,
    changeAucation,
    changeCover,
    deleteAucation,
    addBid,
    deleteBid,
    deleteAllAucations,
  };
});
