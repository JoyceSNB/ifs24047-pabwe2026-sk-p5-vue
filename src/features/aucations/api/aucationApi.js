import { apiRequest } from "../../../helpers/apiHelper";

export const getAucations = ({ isMe, isClosed } = {}) => {
  const params = {};
  if (isMe) params.is_me = 1;
  if (isClosed !== undefined) params.is_closed = isClosed;
  return apiRequest("/aucations", { params });
};

export const getAucation = (id) => apiRequest(`/aucations/${id}`);

const toBody = ({ title, description, startBid, closedAt }) => ({
  title,
  description,
  start_bid: startBid,
  closed_at: closedAt,
});

export const addAucation = (payload) =>
  apiRequest("/aucations", { method: "POST", body: toBody(payload) });

export const changeAucation = (id, payload) =>
  apiRequest(`/aucations/${id}`, { method: "PUT", body: toBody(payload) });

export const changeCover = (id, file) => {
  const formData = new FormData();
  formData.append("cover", file);
  return apiRequest(`/aucations/${id}/cover`, { method: "POST", formData });
};

export const deleteAucation = (id) =>
  apiRequest(`/aucations/${id}`, { method: "DELETE" });

export const addBid = (id, bid) =>
  apiRequest(`/aucations/${id}/bids`, { method: "POST", body: { bid } });

export const deleteBid = (id) =>
  apiRequest(`/aucations/${id}/bids`, { method: "DELETE" });

export const deleteAllAucations = () =>
  apiRequest("/aucations", { method: "DELETE" });
