/**
 * Validasi form lelang, dipakai bersama oleh AddModal dan ChangeModal.
 * Mengembalikan objek galat per kolom; objek kosong berarti form valid.
 */
export const validateAucationForm = ({ title, description, startBid, closedAt }) => {
  const result = {};
  if (!title.trim()) result.title = "Judul wajib diisi.";
  if (!description.trim()) result.description = "Deskripsi wajib diisi.";
  if (Number(startBid) <= 0) result.startBid = "Harga awal harus lebih dari 0.";
  if (!closedAt) result.closedAt = "Batas waktu wajib diisi.";
  return result;
};