import { describe, expect, it, vi } from "vitest";
import {
  apiRequest,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

const mockFetch = (payload) => {
  const fn = vi.fn(async () => ({ json: async () => payload }));
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("apiHelper", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("GET tanpa token dan tanpa opsi", async () => {
    const fetchMock = mockFetch({ status: "success" });
    const result = await apiRequest("/users");
    expect(result).toEqual({ status: "success" });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/users`);
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.body).toBeUndefined();
  });

  it("menambahkan query params dan header Authorization", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch({ status: "success" });
    await apiRequest("/aucations", { params: { is_me: 1 } });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/aucations?is_me=1`);
    expect(options.headers.Authorization).toBe("Bearer tok");
  });

  it("mengirim body JSON", async () => {
    const fetchMock = mockFetch({ status: "success" });
    await apiRequest("/auth/login", { method: "POST", body: { a: 1 } });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe('{"a":1}');
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const fetchMock = mockFetch({ status: "success" });
    const formData = new FormData();
    await apiRequest("/x", { method: "POST", formData });
    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBe(formData);
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("mengembalikan status error saat jaringan gagal", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    const result = await apiRequest("/x");
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/terhubung/);
  });
});
