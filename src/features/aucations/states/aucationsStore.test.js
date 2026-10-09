import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAucationsStore } from "./aucationsStore";
import * as api from "../api/aucationApi";

vi.mock("../api/aucationApi");
const ok = (data) => ({ status: "success", message: "ok", data });
const fail = { status: "fail", message: "gagal", data: { field: { title: ["x"] } } };

describe("aucationsStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("fetchAucations sukses dan gagal", async () => {
    const store = useAucationsStore();
    api.getAucations.mockResolvedValue(ok({ aucations: [{ id: 1 }] }));
    await store.fetchAucations({ isMe: true });
    expect(api.getAucations).toHaveBeenCalledWith({ isMe: true });
    expect(store.aucations).toEqual([{ id: 1 }]);
    api.getAucations.mockResolvedValue(fail);
    await store.fetchAucations();
    expect(api.getAucations).toHaveBeenLastCalledWith({});
    expect(store.errors).toEqual({ title: ["x"] });
    expect(store.isAucation).toBe(false);
  });

  it("fetchAucation sukses lalu gagal mengosongkan detail", async () => {
    const store = useAucationsStore();
    api.getAucation.mockResolvedValue(ok({ aucation: { id: 9 } }));
    await store.fetchAucation(9);
    expect(store.aucation).toEqual({ id: 9 });
    api.getAucation.mockResolvedValue(fail);
    await store.fetchAucation(9);
    expect(store.aucation).toBeNull();
  });

  const cases = [
    ["addAucation", "addAucation", ["p"], "isAucationAdd", "isAucationAdded"],
    ["changeAucation", "changeAucation", [1, "p"], "isAucationChange", "isAucationChanged"],
    ["changeCover", "changeCover", [1, "f"], "isAucationChangeCover", "isAucationChangedCover"],
    ["deleteAucation", "deleteAucation", [1], "isAucationDelete", "isAucationDeleted"],
    ["addBid", "addBid", [1, 5], "isBidAdd", "isBidAdded"],
    ["deleteBid", "deleteBid", [1], "isBidDelete", "isBidDeleted"],
    ["deleteAllAucations", "deleteAllAucations", [], "isAucationDeleteAll", "isAucationDeletedAll"],
  ];

  it.each(cases)("%s melacak status proses dan hasil", async (action, apiName, args, loading, done) => {
    const store = useAucationsStore();
    api[apiName].mockResolvedValue({ status: "success", message: "berhasil" });
    expect(await store[action](...args)).toBe(true);
    expect(store[done]).toBe(true);
    expect(store[loading]).toBe(false);
    expect(store.message).toBe("berhasil");

    api[apiName].mockResolvedValue(fail);
    expect(await store[action](...args)).toBe(false);
    expect(store[done]).toBe(false);
    expect(store.errors).toEqual({ title: ["x"] });
  });
});
