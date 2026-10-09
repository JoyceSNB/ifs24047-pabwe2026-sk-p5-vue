import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";

// Dialog SweetAlert2 dimock agar tes tidak memunculkan modal asli.
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(async () => ({ isConfirmed: true })) },
}));

enableAutoUnmount(afterEach);

URL.createObjectURL = vi.fn(() => "blob:preview");
URL.revokeObjectURL = vi.fn();

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  vi.clearAllMocks();
});
