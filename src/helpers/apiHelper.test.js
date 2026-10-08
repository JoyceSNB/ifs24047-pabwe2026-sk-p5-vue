import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  apiFetch,
  getAccessToken,
  putAccessToken,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("stores and removes access token", () => {
    putAccessToken("access-token");

    expect(getAccessToken()).toBe(
      "access-token",
    );

    putAccessToken(null);

    expect(getAccessToken()).toBeNull();
  });

  it("gets null when access token does not exist", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("fetches JSON with default GET request", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch("/x");

    expect(result).toEqual({
      ok: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];

    expect(url.toString()).toBe(
      "https://open-api.delcom.org/api/v1/x",
    );

    expect(init.method).toBe("GET");

    expect(init.headers).toEqual({
      Accept: "application/json",
    });
  });

  it("adds valid query parameters and ignores empty query values", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/search", {
      query: {
        page: 2,
        keyword: "vue",
        empty: "",
        missing: undefined,
        nothing: null,
      },
    });

    const [url] = fetchMock.mock.calls[0];

    expect(url.toString()).toBe(
      "https://open-api.delcom.org/api/v1/search?page=2&keyword=vue",
    );
  });

  it("adds authorization header when access token exists", async () => {
    putAccessToken("secret-token");

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        authenticated: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/protected");

    const [, init] = fetchMock.mock.calls[0];

    expect(init.headers).toEqual({
      Accept: "application/json",
      Authorization: "Bearer secret-token",
    });
  });

  it("uses custom method and headers", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        updated: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch("/items/1", {
      method: "PATCH",
      headers: {
        "X-Test": "test-value",
      },
    });

    expect(result).toEqual({
      updated: true,
    });

    const [, init] = fetchMock.mock.calls[0];

    expect(init.method).toBe("PATCH");

    expect(init.headers).toEqual({
      Accept: "application/json",
      "X-Test": "test-value",
    });
  });

  it("sends normal object body as JSON", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        created: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    const body = {
      name: "Auction",
      price: 10000,
    };

    const result = await apiFetch("/aucations", {
      method: "POST",
      body,
    });

    expect(result).toEqual({
      created: true,
    });

    const [, init] = fetchMock.mock.calls[0];

    expect(init.method).toBe("POST");

    expect(init.headers).toEqual({
      Accept: "application/json",
      "Content-Type": "application/json",
    });

    expect(init.body).toBe(
      JSON.stringify(body),
    );
  });

  it("sends FormData body without JSON content type", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        uploaded: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();

    formData.append(
      "cover",
      "cover-data",
    );

    const result = await apiFetch("/cover", {
      method: "POST",
      body: formData,
    });

    expect(result).toEqual({
      uploaded: true,
    });

    const [, init] = fetchMock.mock.calls[0];

    expect(init.method).toBe("POST");
    expect(init.body).toBe(formData);

    expect(init.headers).toEqual({
      Accept: "application/json",
    });

    expect(
      init.headers["Content-Type"],
    ).toBeUndefined();
  });

  it("returns null when successful response has invalid JSON", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch("/empty");

    expect(result).toBeNull();
  });

  it("throws API message when error response contains message", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({
        message: "Request gagal",
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/error"),
    ).rejects.toThrow(
      "Request gagal",
    );

    expect(
      consoleError,
    ).toHaveBeenCalledTimes(1);
  });

  it("throws first validation error message when response has errors array", async () => {
    vi.spyOn(
      console,
      "error",
    ).mockImplementation(() => {});

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      json: async () => ({
        errors: [
          {
            message: "Data tidak valid",
          },
        ],
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/validation-error"),
    ).rejects.toThrow(
      "Data tidak valid",
    );
  });

  it("throws HTTP status when error response has no message", async () => {
    vi.spyOn(
      console,
      "error",
    ).mockImplementation(() => {});

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({
        error: "unknown",
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/server-error"),
    ).rejects.toThrow(
      "HTTP 500",
    );
  });

  it("throws HTTP status when error response JSON cannot be parsed", async () => {
    vi.spyOn(
      console,
      "error",
    ).mockImplementation(() => {});

    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => {
        throw new Error("Invalid JSON");
      },
    }));

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch("/not-found"),
    ).rejects.toThrow(
      "HTTP 404",
    );
  });

  it("supports undefined options", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        success: true,
      }),
    }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch(
      "/default",
      undefined,
    );

    expect(result).toEqual({
      success: true,
    });
  });
});