import {
  apiFetch,
} from "../../../helpers/apiHelper";

function normalizeAucationParams(
  params = {},
) {
  const query = {
    ...params,
  };

  /*
   * Delcom Auction API:
   *
   * is_me:
   *   1 = lelang milik user yang sedang login
   *
   * is_closed:
   *   1 = lelang masih terbuka
   *   0 = lelang sudah ditutup
   *
   * UI kita menggunakan boolean agar lebih mudah dibaca,
   * kemudian API layer mengubahnya menjadi format Delcom.
   */

  if (
    query.is_me === true
  ) {
    query.is_me = 1;
  } else if (
    query.is_me === false
  ) {
    delete query.is_me;
  }

  if (
    query.is_closed === true
  ) {
    query.is_closed = 0;
  } else if (
    query.is_closed === false
  ) {
    query.is_closed = 1;
  }

  return query;
}

export const getAucations = (
  params = {},
) =>
  apiFetch("/aucations", {
    query:
      normalizeAucationParams(
        params,
      ),
  });

export const getAucation = (
  id,
) =>
  apiFetch(
    `/aucations/${id}`,
  );

export const addAucation = (
  title,
  description,
  start_bid,
  closed_at,
) =>
  apiFetch("/aucations", {
    method: "POST",

    body: {
      title,
      description,
      start_bid,
      closed_at,
    },
  });

export const updateAucation = (
  id,
  title,
  description,
  start_bid,
  closed_at,
) =>
  apiFetch(
    `/aucations/${id}`,
    {
      method: "PUT",

      body: {
        title,
        description,
        start_bid,
        closed_at,
      },
    },
  );

export const changeCover = (
  id,
  file,
) => {
  const formData =
    new FormData();

  formData.append(
    "cover",
    file,
  );

  return apiFetch(
    `/aucations/${id}/cover`,
    {
      method: "POST",
      body: formData,
    },
  );
};

export const deleteAucation = (
  id,
) =>
  apiFetch(
    `/aucations/${id}`,
    {
      method: "DELETE",
    },
  );

export const addBid = (
  id,
  bid,
) =>
  apiFetch(
    `/aucations/${id}/bids`,
    {
      method: "POST",

      body: {
        bid,
      },
    },
  );

export const deleteBid = (
  id,
) =>
  apiFetch(
    `/aucations/${id}/bids`,
    {
      method: "DELETE",
    },
  );

export const deleteAllMyAucations =
  () =>
    apiFetch(
      "/aucations",
      {
        method: "DELETE",
      },
    );