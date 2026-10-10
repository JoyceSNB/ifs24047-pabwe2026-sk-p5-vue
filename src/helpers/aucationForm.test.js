import { describe, expect, it } from "vitest";
import { validateAucationForm } from "./aucationForm";

const valid = {
  title: "Oculus Quest 2",
  description: "Second mulus",
  startBid: "5000000",
  closedAt: "2026-12-31T22:00",
};

describe("validateAucationForm", () => {
  it("mengembalikan objek kosong untuk form yang valid", () => {
    expect(validateAucationForm(valid)).toEqual({});
  });

  it("menandai judul dan deskripsi yang kosong atau hanya spasi", () => {
    const result = validateAucationForm({ ...valid, title: "  ", description: "" });
    expect(result).toEqual({
      title: "Judul wajib diisi.",
      description: "Deskripsi wajib diisi.",
    });
  });

  it("menandai harga awal nol, negatif, atau kosong", () => {
    ["0", "-5", ""].forEach((startBid) => {
      expect(validateAucationForm({ ...valid, startBid })).toEqual({
        startBid: "Harga awal harus lebih dari 0.",
      });
    });
  });

  it("menandai batas waktu yang kosong", () => {
    expect(validateAucationForm({ ...valid, closedAt: "" })).toEqual({
      closedAt: "Batas waktu wajib diisi.",
    });
  });
});