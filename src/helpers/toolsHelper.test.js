import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import Swal from "sweetalert2";

import {
  formatRupiah,
  formatDate,
  toDateTimeLocal,
  showSuccessDialog,
  showErrorDialog,
  showWarningDialog,
  showConfirmDialog,
} from "./toolsHelper";

describe("toolsHelper", () => {
  let swalFireMock;

  beforeEach(() => {
    vi.restoreAllMocks();

    swalFireMock = vi
      .spyOn(Swal, "fire")
      .mockResolvedValue({
        isConfirmed: false,
      });
  });

  describe("formatRupiah", () => {
    it("formats a normal number as Indonesian Rupiah", () => {
      expect(
        formatRupiah(200000),
      ).toContain("200.000");
    });

    it("formats zero when value is zero", () => {
      expect(
        formatRupiah(0),
      ).toContain("0");
    });

    it("formats invalid value as zero", () => {
      expect(
        formatRupiah("abc"),
      ).toContain("0");
    });

    it("formats numeric string", () => {
      expect(
        formatRupiah("150000"),
      ).toContain("150.000");
    });

    it("formats null as zero", () => {
      expect(
        formatRupiah(null),
      ).toContain("0");
    });

    it("formats undefined as zero", () => {
      expect(
        formatRupiah(undefined),
      ).toContain("0");
    });
  });

  describe("formatDate", () => {
    it("formats a valid date", () => {
      const result = formatDate(
        "2026-12-31T22:00:00",
      );

      expect(result).not.toBe("-");
      expect(result).toContain("2026");
    });

    it("returns dash for empty value", () => {
      expect(
        formatDate(""),
      ).toBe("-");
    });

    it("returns dash for null value", () => {
      expect(
        formatDate(null),
      ).toBe("-");
    });

    it("returns dash for undefined value", () => {
      expect(
        formatDate(undefined),
      ).toBe("-");
    });
  });

  describe("toDateTimeLocal", () => {
    it("formats a valid datetime", () => {
      expect(
        toDateTimeLocal(
          "2026-12-31T22:00:00",
        ),
      ).toBe(
        "2026-12-31T22:00",
      );
    });

    it("returns empty string for empty value", () => {
      expect(
        toDateTimeLocal(""),
      ).toBe("");
    });

    it("returns empty string for null", () => {
      expect(
        toDateTimeLocal(null),
      ).toBe("");
    });

    it("returns empty string for undefined", () => {
      expect(
        toDateTimeLocal(undefined),
      ).toBe("");
    });

    it("pads month, date, hour and minute", () => {
      expect(
        toDateTimeLocal(
          "2026-01-02T03:04:00",
        ),
      ).toBe(
        "2026-01-02T03:04",
      );
    });
  });

  describe("showSuccessDialog", () => {
    it("shows success dialog with custom values", async () => {
      await showSuccessDialog(
        "Berhasil disimpan",
        "Data berhasil disimpan",
      );

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil disimpan",
        text: "Data berhasil disimpan",
      });
    });

    it("uses default success dialog values", async () => {
      await showSuccessDialog();

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "success",
        title: "Berhasil",
        text: "",
      });
    });
  });

  describe("showErrorDialog", () => {
    it("shows error dialog with custom text", async () => {
      await showErrorDialog(
        "Terjadi kesalahan API",
      );

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan API",
      });
    });

    it("uses default error dialog text", async () => {
      await showErrorDialog();

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan",
      });
    });
  });

  describe("showWarningDialog", () => {
    it("shows warning dialog with supplied text", async () => {
      await showWarningDialog(
        "Harap periksa kembali",
      );

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "warning",
        title: "Peringatan",
        text: "Harap periksa kembali",
      });
    });

    it("supports undefined warning text", async () => {
      await showWarningDialog();

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "warning",
        title: "Peringatan",
        text: undefined,
      });
    });
  });

  describe("showConfirmDialog", () => {
    it("returns true when confirmation is accepted", async () => {
      swalFireMock.mockResolvedValueOnce({
        isConfirmed: true,
      });

      const result =
        await showConfirmDialog(
          "Hapus data ini?",
        );

      expect(result).toBe(true);

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "question",
        title: "Konfirmasi",
        text: "Hapus data ini?",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
    });

    it("returns false when confirmation is cancelled", async () => {
      swalFireMock.mockResolvedValueOnce({
        isConfirmed: false,
      });

      const result =
        await showConfirmDialog(
          "Batalkan proses?",
        );

      expect(result).toBe(false);

      expect(
        swalFireMock,
      ).toHaveBeenCalledWith({
        icon: "question",
        title: "Konfirmasi",
        text: "Batalkan proses?",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      });
    });
  });
});