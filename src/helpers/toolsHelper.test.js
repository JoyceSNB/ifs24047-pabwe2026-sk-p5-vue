import { describe, expect, it } from "vitest";
import Swal from "sweetalert2";
import {
  assetUrl,
  formatDate,
  formatRupiah,
  getHighestBid,
  getTimeLeft,
  isAucationClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDateTime,
  toInputDateTime,
} from "./toolsHelper";

describe("dialog SweetAlert2", () => {
  it("showSuccessDialog menampilkan dialog sukses", async () => {
    await showSuccessDialog("Oke");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Oke" }));
  });

  it("showErrorDialog menampilkan dialog error", async () => {
    await showErrorDialog("Gagal");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));
  });

  it("showConfirmDialog mengembalikan pilihan pengguna", async () => {
    expect(await showConfirmDialog("Yakin?")).toBe(true);
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Yakin?", "Hapus")).toBe(false);
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ confirmButtonText: "Hapus" }));
  });
});

describe("format", () => {
  it("formatRupiah", () => {
    expect(formatRupiah(1500000)).toMatch(/Rp\s?1\.500\.000/);
    expect(formatRupiah(undefined)).toMatch(/Rp\s?0/);
  });

  it("formatDate", () => {
    expect(formatDate("2026-12-31 23:59:00")).toMatch(/2026/);
  });

  it("konversi datetime API <-> input", () => {
    expect(toApiDateTime("2026-12-31T23:59")).toBe("2026-12-31 23:59:00");
    expect(toInputDateTime("2026-12-31 23:59:00")).toBe("2026-12-31T23:59");
  });
});

describe("assetUrl", () => {
  it("menangani kosong, absolut, dan relatif", () => {
    expect(assetUrl("")).toBe("");
    expect(assetUrl("https://x.id/a.png")).toBe("https://x.id/a.png");
    expect(assetUrl("img/a.png")).toBe("https://open-api.delcom.org/img/a.png");
    expect(assetUrl("/img/a.png")).toBe("https://open-api.delcom.org/img/a.png");
  });
});

describe("waktu lelang", () => {
  const now = new Date("2026-10-07T10:00:00").getTime();

  it("isAucationClosed", () => {
    expect(isAucationClosed("2026-10-07 09:00:00", now)).toBe(true);
    expect(isAucationClosed("2099-01-01 00:00:00")).toBe(false);
  });

  it("getTimeLeft untuk hari, jam, menit, dan ditutup", () => {
    expect(getTimeLeft("2026-10-09 13:00:00", now)).toBe("2 hari 3 jam lagi");
    expect(getTimeLeft("2026-10-07 12:30:00", now)).toBe("2 jam 30 menit lagi");
    expect(getTimeLeft("2026-10-07 10:20:00", now)).toBe("20 menit lagi");
    expect(getTimeLeft("2026-10-07 09:00:00", now)).toBe("Ditutup");
    expect(getTimeLeft("2099-01-01 00:00:00")).toMatch(/hari/);
  });
});

describe("getHighestBid", () => {
  it("mengambil nominal tertinggi dan aman untuk data id/kosong", () => {
    expect(getHighestBid()).toBe(0);
    expect(getHighestBid([2, 3])).toBe(0);
    expect(getHighestBid([{ bid: 5 }, { bid: 9 }, { bid: 7 }])).toBe(9);
  });
});
