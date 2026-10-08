import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  getHighestBid,
  toApiDateTime,
  isClosed,
} from "./aucationHelper";

describe("aucationHelper", () => {
  describe("getHighestBid", () => {
    it("gets highest bid from bid property", () => {
      expect(
        getHighestBid({
          bids: [
            { bid: 2 },
            { bid: 5 },
            { bid: 3 },
          ],
        }),
      ).toBe(5);
    });

    it("returns null when bids array is empty", () => {
      expect(
        getHighestBid({
          bids: [],
        }),
      ).toBeNull();
    });

    it("returns null when auction object is undefined", () => {
      expect(
        getHighestBid(undefined),
      ).toBeNull();
    });

    it("returns null when auction object is null", () => {
      expect(
        getHighestBid(null),
      ).toBeNull();
    });

    it("returns null when auction has no bids property", () => {
      expect(
        getHighestBid({}),
      ).toBeNull();
    });

    it("uses amount when bid property is nullish", () => {
      expect(
        getHighestBid({
          bids: [
            {
              bid: null,
              amount: 15000,
            },
          ],
        }),
      ).toBe(15000);
    });

    it("uses nominal when bid and amount are nullish", () => {
      expect(
        getHighestBid({
          bids: [
            {
              bid: null,
              amount: null,
              nominal: 25000,
            },
          ],
        }),
      ).toBe(25000);
    });

    it("uses zero when bid amount fields are all nullish", () => {
      expect(
        getHighestBid({
          bids: [
            {
              bid: null,
              amount: null,
              nominal: null,
            },
          ],
        }),
      ).toBe(0);
    });

    it("converts numeric string bid values to numbers", () => {
      expect(
        getHighestBid({
          bids: [
            { bid: "10000" },
            { bid: "25000" },
          ],
        }),
      ).toBe(25000);
    });
  });

  describe("toApiDateTime", () => {
    it("formats datetime-local value with seconds", () => {
      expect(
        toApiDateTime(
          "2026-12-31T22:00",
        ),
      ).toBe(
        "2026-12-31 22:00:00",
      );
    });

    it("formats value that already contains seconds", () => {
      expect(
        toApiDateTime(
          "2026-12-31T22:00:30",
        ),
      ).toBe(
        "2026-12-31 22:00:30",
      );
    });

    it("returns empty string for empty value", () => {
      expect(
        toApiDateTime(""),
      ).toBe("");
    });

    it("returns empty string for null", () => {
      expect(
        toApiDateTime(null),
      ).toBe("");
    });

    it("returns empty string for undefined", () => {
      expect(
        toApiDateTime(undefined),
      ).toBe("");
    });
  });

  describe("isClosed", () => {
    it("returns true when closed date is in the past", () => {
      expect(
        isClosed({
          closed_at: "2000-01-01",
        }),
      ).toBe(true);
    });

    it("returns false when closed date is in the future", () => {
      expect(
        isClosed({
          closed_at: "2999-01-01",
        }),
      ).toBe(false);
    });

    it("returns false when closed_at is missing", () => {
      expect(
        isClosed({}),
      ).toBe(false);
    });

    it("returns false when auction is undefined", () => {
      expect(
        isClosed(undefined),
      ).toBe(false);
    });

    it("returns false when auction is null", () => {
      expect(
        isClosed(null),
      ).toBe(false);
    });

    it("returns false when closed_at is an empty string", () => {
      expect(
        isClosed({
          closed_at: "",
        }),
      ).toBe(false);
    });

    it("checks the current time when evaluating closed_at", () => {
      vi.spyOn(Date, "now").mockReturnValue(
        new Date(
          "2026-01-01T00:00:00Z",
        ).getTime(),
      );

      expect(
        isClosed({
          closed_at:
            "2025-12-31T23:59:59Z",
        }),
      ).toBe(true);

      expect(
        isClosed({
          closed_at:
            "2026-01-02T00:00:00Z",
        }),
      ).toBe(false);

      vi.restoreAllMocks();
    });
  });
});