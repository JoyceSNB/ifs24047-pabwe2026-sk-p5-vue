import { defineStore } from "pinia";

import * as api from "../api/aucationApi";

export const useAucationsStore =
  defineStore("aucations", {
    state: () => ({
      aucations: [],
      aucation: null,
      loading: false,
      error: null,

      isAucationAdd: false,
      isAucationAdded: false,

      isAucationChange: false,
      isAucationChanged: false,

      isBidAdd: false,
      isBidAdded: false,
    }),

    actions: {
      setIsAucationAdd(value) {
        this.isAucationAdd = value;
      },

      setIsAucationAdded(value) {
        this.isAucationAdded = value;
      },

      setIsAucationChange(value) {
        this.isAucationChange =
          value;
      },

      setIsAucationChanged(value) {
        this.isAucationChanged =
          value;
      },

      setIsBidAdd(value) {
        this.isBidAdd = value;
      },

      setIsBidAdded(value) {
        this.isBidAdded = value;
      },

      async asyncGetAucations(
        params = {},
      ) {
        this.loading = true;
        this.error = null;

        try {
          const response =
            await api.getAucations(
              params,
            );

          const data =
            response?.data;

          if (
            Array.isArray(data)
          ) {
            this.aucations = data;
          } else if (
            Array.isArray(
              data?.aucations,
            )
          ) {
            this.aucations =
              data.aucations;
          } else if (
            Array.isArray(
              response?.aucations,
            )
          ) {
            this.aucations =
              response.aucations;
          } else {
            this.aucations = [];
          }

          return response;
        } catch (error) {
          this.error = error;
          throw error;
        } finally {
          this.loading = false;
        }
      },

      async asyncGetAucation(id) {
        this.loading = true;
        this.error = null;

        try {
          const response =
            await api.getAucation(id);

          this.aucation =
            response?.data ??
            response?.aucation ??
            response;

          return response;
        } catch (error) {
          this.error = error;
          throw error;
        } finally {
          this.loading = false;
        }
      },

      async asyncSetIsAucationAdd(
        title,
        description,
        startBid,
        closedAt,
      ) {
        this.isAucationAdded = false;
        this.error = null;

        try {
          const response =
            await api.addAucation(
              title,
              description,
              startBid,
              closedAt,
            );

          this.isAucationAdded =
            true;

          return response;
        } catch (error) {
          this.error = error;
          return null;
        } finally {
          this.isAucationAdd =
            true;
        }
      },

      async asyncSetIsAucationChange(
        id,
        title,
        description,
        startBid,
        closedAt,
      ) {
        this.isAucationChanged =
          false;
        this.error = null;

        try {
          const response =
            await api.updateAucation(
              id,
              title,
              description,
              startBid,
              closedAt,
            );

          this.isAucationChanged =
            true;

          return response;
        } catch (error) {
          this.error = error;
          return null;
        } finally {
          this.isAucationChange =
            true;
        }
      },

      async asyncSetIsBidAdd(
        id,
        amount,
      ) {
        this.isBidAdded = false;
        this.error = null;

        try {
          const response =
            await api.addBid(
              id,
              amount,
            );

          this.isBidAdded = true;

          return response;
        } catch (error) {
          this.error = error;
          return null;
        } finally {
          this.isBidAdd = true;
        }
      },

      async deleteBid(id) {
        return api.deleteBid(id);
      },

      async deleteAucation(id) {
        return api.deleteAucation(id);
      },
    },
  });