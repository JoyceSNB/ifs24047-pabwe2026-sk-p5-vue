import { describe, expect, it } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("memiliki nilai awal default string kosong", () => {
    expect(useInput().value.value).toBe("");
  });

  it("onChange memperbarui nilai dan reset mengembalikannya", () => {
    const { value, onChange, reset } = useInput("awal");
    expect(value.value).toBe("awal");
    onChange({ target: { value: "baru" } });
    expect(value.value).toBe("baru");
    reset();
    expect(value.value).toBe("awal");
    reset("lain");
    expect(value.value).toBe("lain");
  });
});
