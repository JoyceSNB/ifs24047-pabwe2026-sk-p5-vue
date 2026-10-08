import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import {
  useAucationsStore,
} from "./aucationsStore";

import * as api from "../api/aucationApi";

vi.mock(
  "../api/aucationApi",
  () => ({
    getAucations:
      vi.fn(),

    getAucation:
      vi.fn(),

    addAucation:
      vi.fn(),

    updateAucation:
      vi.fn(),

    addBid:
      vi.fn(),

    deleteBid:
      vi.fn(),

    deleteAucation:
      vi.fn(),
  }),
);

describe(
  "aucationsStore",
  () => {
    let store;

    beforeEach(() => {
      setActivePinia(
        createPinia(),
      );

      store =
        useAucationsStore();

      vi.clearAllMocks();
    });

    it(
      "has the correct initial state",
      () => {
        expect(
          store.aucations,
        ).toEqual([]);

        expect(
          store.aucation,
        ).toBeNull();

        expect(
          store.loading,
        ).toBe(false);

        expect(
          store.error,
        ).toBeNull();

        expect(
          store.isAucationAdd,
        ).toBe(false);

        expect(
          store.isAucationAdded,
        ).toBe(false);

        expect(
          store.isAucationChange,
        ).toBe(false);

        expect(
          store.isAucationChanged,
        ).toBe(false);

        expect(
          store.isBidAdd,
        ).toBe(false);

        expect(
          store.isBidAdded,
        ).toBe(false);
      },
    );

    it(
      "sets auction add flag",
      () => {
        store.setIsAucationAdd(
          true,
        );

        expect(
          store.isAucationAdd,
        ).toBe(true);
      },
    );

    it(
      "sets auction added flag",
      () => {
        store.setIsAucationAdded(
          true,
        );

        expect(
          store.isAucationAdded,
        ).toBe(true);
      },
    );

    it(
      "sets auction change flag",
      () => {
        store.setIsAucationChange(
          true,
        );

        expect(
          store.isAucationChange,
        ).toBe(true);
      },
    );

    it(
      "sets auction changed flag",
      () => {
        store.setIsAucationChanged(
          true,
        );

        expect(
          store.isAucationChanged,
        ).toBe(true);
      },
    );

    it(
      "sets bid add flag",
      () => {
        store.setIsBidAdd(
          true,
        );

        expect(
          store.isBidAdd,
        ).toBe(true);
      },
    );

    it(
      "sets bid added flag",
      () => {
        store.setIsBidAdded(
          true,
        );

        expect(
          store.isBidAdded,
        ).toBe(true);
      },
    );

    it(
      "gets auctions when response data is an array",
      async () => {
        const auctions = [
          {
            id: 1,
            title: "Laptop",
          },
        ];

        const response = {
          data: auctions,
        };

        api.getAucations.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncGetAucations(
            {
              search: "laptop",
            },
          );

        expect(
          api.getAucations,
        ).toHaveBeenCalledWith(
          {
            search: "laptop",
          },
        );

        expect(
          store.aucations,
        ).toEqual(
          auctions,
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.loading,
        ).toBe(false);

        expect(
          store.error,
        ).toBeNull();
      },
    );

    it(
      "gets auctions when response data contains aucations array",
      async () => {
        const auctions = [
          {
            id: 2,
            title: "Sepeda",
          },
        ];

        const response = {
          data: {
            aucations:
              auctions,
          },
        };

        api.getAucations.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncGetAucations();

        expect(
          api.getAucations,
        ).toHaveBeenCalledWith(
          {},
        );

        expect(
          store.aucations,
        ).toEqual(
          auctions,
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "gets auctions when response directly contains aucations array",
      async () => {
        const auctions = [
          {
            id: 3,
            title: "Kamera",
          },
        ];

        const response = {
          aucations:
            auctions,
        };

        api.getAucations.mockResolvedValue(
          response,
        );

        await store.asyncGetAucations();

        expect(
          store.aucations,
        ).toEqual(
          auctions,
        );

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "uses empty array when auction response has no supported array",
      async () => {
        store.aucations = [
          {
            id: 99,
          },
        ];

        api.getAucations.mockResolvedValue(
          {
            data: {
              message:
                "Tidak ada data",
            },
          },
        );

        await store.asyncGetAucations();

        expect(
          store.aucations,
        ).toEqual([]);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "stores auction list error and rethrows it",
      async () => {
        const error =
          new Error(
            "Gagal mengambil lelang",
          );

        api.getAucations.mockRejectedValue(
          error,
        );

        await expect(
          store.asyncGetAucations(),
        ).rejects.toBe(error);

        expect(
          store.error,
        ).toBe(error);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "gets auction detail from response data",
      async () => {
        const auction = {
          id: 1,
          title: "Laptop Gaming",
        };

        const response = {
          data: auction,
        };

        api.getAucation.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncGetAucation(
            1,
          );

        expect(
          api.getAucation,
        ).toHaveBeenCalledWith(
          1,
        );

        expect(
          store.aucation,
        ).toEqual(
          auction,
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "gets auction detail from response aucation",
      async () => {
        const auction = {
          id: 2,
          title: "Sepeda",
        };

        const response = {
          aucation:
            auction,
        };

        api.getAucation.mockResolvedValue(
          response,
        );

        await store.asyncGetAucation(
          2,
        );

        expect(
          store.aucation,
        ).toEqual(
          auction,
        );
      },
    );

    it(
      "gets auction detail from raw response",
      async () => {
        const response = {
          id: 3,
          title: "Kamera",
        };

        api.getAucation.mockResolvedValue(
          response,
        );

        await store.asyncGetAucation(
          3,
        );

        expect(
          store.aucation,
        ).toEqual(
          response,
        );
      },
    );

    it(
      "stores auction detail error and rethrows it",
      async () => {
        const error =
          new Error(
            "Lelang tidak ditemukan",
          );

        api.getAucation.mockRejectedValue(
          error,
        );

        await expect(
          store.asyncGetAucation(
            999,
          ),
        ).rejects.toBe(error);

        expect(
          store.error,
        ).toBe(error);

        expect(
          store.loading,
        ).toBe(false);
      },
    );

    it(
      "adds an auction successfully",
      async () => {
        const response = {
          data: {
            id: 10,
          },
        };

        api.addAucation.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncSetIsAucationAdd(
            "Laptop",
            "Laptop gaming",
            5000000,
            "2026-12-31 23:59:00",
          );

        expect(
          api.addAucation,
        ).toHaveBeenCalledWith(
          "Laptop",
          "Laptop gaming",
          5000000,
          "2026-12-31 23:59:00",
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.isAucationAdded,
        ).toBe(true);

        expect(
          store.isAucationAdd,
        ).toBe(true);

        expect(
          store.error,
        ).toBeNull();
      },
    );

    it(
      "handles auction add failure",
      async () => {
        const error =
          new Error(
            "Gagal menambah lelang",
          );

        api.addAucation.mockRejectedValue(
          error,
        );

        const result =
          await store.asyncSetIsAucationAdd(
            "Laptop",
            "Laptop gaming",
            5000000,
            "2026-12-31 23:59:00",
          );

        expect(
          result,
        ).toBeNull();

        expect(
          store.error,
        ).toBe(error);

        expect(
          store.isAucationAdded,
        ).toBe(false);

        expect(
          store.isAucationAdd,
        ).toBe(true);
      },
    );

    it(
      "updates an auction successfully",
      async () => {
        const response = {
          data: {
            id: 10,
          },
        };

        api.updateAucation.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncSetIsAucationChange(
            10,
            "Laptop Baru",
            "Deskripsi baru",
            6000000,
            "2026-12-31 23:59:00",
          );

        expect(
          api.updateAucation,
        ).toHaveBeenCalledWith(
          10,
          "Laptop Baru",
          "Deskripsi baru",
          6000000,
          "2026-12-31 23:59:00",
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.isAucationChanged,
        ).toBe(true);

        expect(
          store.isAucationChange,
        ).toBe(true);

        expect(
          store.error,
        ).toBeNull();
      },
    );

    it(
      "handles auction update failure",
      async () => {
        const error =
          new Error(
            "Gagal mengubah lelang",
          );

        api.updateAucation.mockRejectedValue(
          error,
        );

        const result =
          await store.asyncSetIsAucationChange(
            10,
            "Laptop",
            "Deskripsi",
            5000000,
            "2026-12-31 23:59:00",
          );

        expect(
          result,
        ).toBeNull();

        expect(
          store.error,
        ).toBe(error);

        expect(
          store.isAucationChanged,
        ).toBe(false);

        expect(
          store.isAucationChange,
        ).toBe(true);
      },
    );

    it(
      "adds a bid successfully",
      async () => {
        const response = {
          data: {
            id: 20,
          },
        };

        api.addBid.mockResolvedValue(
          response,
        );

        const result =
          await store.asyncSetIsBidAdd(
            10,
            7000000,
          );

        expect(
          api.addBid,
        ).toHaveBeenCalledWith(
          10,
          7000000,
        );

        expect(
          result,
        ).toBe(response);

        expect(
          store.isBidAdded,
        ).toBe(true);

        expect(
          store.isBidAdd,
        ).toBe(true);

        expect(
          store.error,
        ).toBeNull();
      },
    );

    it(
      "handles bid add failure",
      async () => {
        const error =
          new Error(
            "Gagal menambahkan bid",
          );

        api.addBid.mockRejectedValue(
          error,
        );

        const result =
          await store.asyncSetIsBidAdd(
            10,
            7000000,
          );

        expect(
          result,
        ).toBeNull();

        expect(
          store.error,
        ).toBe(error);

        expect(
          store.isBidAdded,
        ).toBe(false);

        expect(
          store.isBidAdd,
        ).toBe(true);
      },
    );

    it(
      "deletes a bid",
      async () => {
        const response = {
          success: true,
        };

        api.deleteBid.mockResolvedValue(
          response,
        );

        const result =
          await store.deleteBid(
            10,
          );

        expect(
          api.deleteBid,
        ).toHaveBeenCalledWith(
          10,
        );

        expect(
          result,
        ).toBe(response);
      },
    );

    it(
      "deletes an auction",
      async () => {
        const response = {
          success: true,
        };

        api.deleteAucation.mockResolvedValue(
          response,
        );

        const result =
          await store.deleteAucation(
            10,
          );

        expect(
          api.deleteAucation,
        ).toHaveBeenCalledWith(
          10,
        );

        expect(
          result,
        ).toBe(response);
      },
    );
  },
);