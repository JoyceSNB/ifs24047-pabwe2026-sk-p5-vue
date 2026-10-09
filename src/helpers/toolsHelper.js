import Swal from "sweetalert2";

const swalBase = {
  confirmButtonColor: "#1e1b4b",
  cancelButtonColor: "#475569",
};

export const showSuccessDialog = (message) =>
  Swal.fire({
    ...swalBase,
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1400,
    showConfirmButton: false,
  });

export const showErrorDialog = (message) =>
  Swal.fire({
    ...swalBase,
    icon: "error",
    title: "Terjadi Kesalahan",
    text: message,
    confirmButtonText: "Mengerti",
  });

export const showConfirmDialog = async (message, confirmText = "Ya, lanjutkan") => {
  const result = await Swal.fire({
    ...swalBase,
    icon: "warning",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
};

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value) =>
  new Date(String(value).replace(" ", "T")).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Ubah nilai <input type="datetime-local"> menjadi format API: YYYY-MM-DD HH:mm:ss */
export const toApiDateTime = (value) => `${value.replace("T", " ")}:00`;

/** Ubah format API menjadi nilai <input type="datetime-local"> */
export const toInputDateTime = (value) =>
  String(value).replace(" ", "T").slice(0, 16);

/** URL aset (foto/cover) bisa relatif terhadap host API. */
export const assetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${DELCOM_BASEURL.replace(/\/api\/v1\/?$/, "")}/${path.replace(/^\//, "")}`;
};

export const isAucationClosed = (closedAt, now = Date.now()) =>
  new Date(String(closedAt).replace(" ", "T")).getTime() <= now;

/** Label sisa waktu lelang, mis. "2 hari 3 jam lagi" atau "Ditutup". */
export const getTimeLeft = (closedAt, now = Date.now()) => {
  const diff = new Date(String(closedAt).replace(" ", "T")).getTime() - now;
  if (diff <= 0) return "Ditutup";
  const minutes = Math.floor(diff / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${minutes % 60} menit lagi`;
  return `${Math.max(minutes, 1)} menit lagi`;
};

/** Penawaran bisa berupa angka (id) di daftar atau objek { bid } di detail. */
export const getHighestBid = (bids = []) =>
  bids.reduce((max, item) => Math.max(max, Number(item?.bid) || 0), 0);
