import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import * as api from "./aucationApi";

describe("aucationApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          data: [],
        }),
      })),
    );
  });

  it("gets aucations", async () => {
    await api.getAucations();

    expect(fetch).toHaveBeenCalled();
  });

  it("gets aucations with normal params", async () => {
    await api.getAucations({
      search: "laptop",
      page: 1,
    });

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.searchParams.get("search"),
    ).toBe("laptop");

    expect(
      requestUrl.searchParams.get("page"),
    ).toBe("1");
  });

  it("converts is_me true to 1", async () => {
    await api.getAucations({
      is_me: true,
    });

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.searchParams.get("is_me"),
    ).toBe("1");
  });

  it("removes is_me false", async () => {
    await api.getAucations({
      is_me: false,
      search: "laptop",
    });

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.searchParams.has("is_me"),
    ).toBe(false);

    expect(
      requestUrl.searchParams.get("search"),
    ).toBe("laptop");
  });

  it("converts is_closed true to 0", async () => {
    await api.getAucations({
      is_closed: true,
    });

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.searchParams.get("is_closed"),
    ).toBe("0");
  });

  it("converts is_closed false to 1", async () => {
    await api.getAucations({
      is_closed: false,
    });

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.searchParams.get("is_closed"),
    ).toBe("1");
  });

  it("gets auction detail", async () => {
    await api.getAucation(1);

    expect(fetch).toHaveBeenCalled();

    const [url] = fetch.mock.calls[0];
    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain("/aucations/1");
  });

  it("adds auction", async () => {
    await api.addAucation(
      "t",
      "d",
      1,
      "x",
    );

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain("/aucations");

    expect(options.method).toBe(
      "POST",
    );

    expect(
      JSON.parse(options.body),
    ).toEqual({
      title: "t",
      description: "d",
      start_bid: 1,
      closed_at: "x",
    });
  });

  it("updates auction", async () => {
    await api.updateAucation(
      1,
      "t",
      "d",
      1,
      "x",
    );

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain("/aucations/1");

    expect(options.method).toBe(
      "PUT",
    );

    expect(
      JSON.parse(options.body),
    ).toEqual({
      title: "t",
      description: "d",
      start_bid: 1,
      closed_at: "x",
    });
  });

  it("changes auction cover", async () => {
    const file = new File(
      ["cover"],
      "cover.jpg",
      {
        type: "image/jpeg",
      },
    );

    await api.changeCover(
      1,
      file,
    );

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain(
      "/aucations/1/cover",
    );

    expect(options.method).toBe(
      "POST",
    );

    expect(
      options.body,
    ).toBeInstanceOf(FormData);

    expect(
      options.body.get("cover"),
    ).toBe(file);
  });

  it("deletes auction", async () => {
    await api.deleteAucation(1);

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain("/aucations/1");

    expect(options.method).toBe(
      "DELETE",
    );
  });

  it("adds bid", async () => {
    await api.addBid(1, 2);

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain(
      "/aucations/1/bids",
    );

    expect(options.method).toBe(
      "POST",
    );

    expect(
      JSON.parse(options.body),
    ).toEqual({
      bid: 2,
    });
  });

  it("deletes bid", async () => {
    await api.deleteBid(1);

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain(
      "/aucations/1/bids",
    );

    expect(options.method).toBe(
      "DELETE",
    );
  });

  it("deletes all my auctions", async () => {
    await api.deleteAllMyAucations();

    expect(fetch).toHaveBeenCalled();

    const [url, options] =
      fetch.mock.calls[0];

    const requestUrl = new URL(url);

    expect(
      requestUrl.pathname,
    ).toContain("/aucations");

    expect(options.method).toBe(
      "DELETE",
    );
  });
});