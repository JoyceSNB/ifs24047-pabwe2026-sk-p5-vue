import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/vue";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import BidModal from "./BidModal.vue";
import { useAucationsStore } from "../states/aucationsStore";

vi.mock(
  "../../../helpers/toolsHelper",
  () => ({
    formatRupiah: vi.fn(
      (value) => `Rp ${Number(value).toLocaleString("id-ID")}`,
    ),
    showErrorDialog: vi.fn(),
  }),
);

vi.mock(
  "../helpers/aucationHelper",
  () => ({
    getHighestBid: vi.fn(),
  }),
);

import * as toolsHelper from "../../../helpers/toolsHelper";
import * as aucationHelper from "../helpers/aucationHelper";

const auctionWithBid = {
  id: 1,
  title: "Keyboard",
  start_bid: 100,
  bids: [
    {
      bid: 200,
    },
  ],
};

const auctionWithoutBid = {
  id: 2,
  title: "Mouse",
  start_bid: 500,
  bids: [],
};

function createContext({
  show = true,
  aucation = auctionWithBid,
  highestBid = 200,
} = {}) {
  const pinia = createPinia();

  setActivePinia(pinia);

  const store = useAucationsStore();

  store.isBidAdd = false;
  store.isBidAdded = false;

  aucationHelper.getHighestBid.mockReturnValue(
    highestBid,
  );

  const result = render(BidModal, {
    props: {
      show,
      aucation,
    },
    global: {
      plugins: [pinia],
    },
  });

  return {
    ...result,
    pinia,
    store,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BidModal", () => {
  it("does not render when show is false", () => {
    createContext({
      show: false,
    });

    expect(
      screen.queryByTestId("bid-modal"),
    ).not.toBeInTheDocument();
  });

  it("renders auction title and current highest bid", () => {
    createContext({
      highestBid: 200,
    });

    expect(
      screen.getByTestId("bid-modal"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Keyboard"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("bid-hint"),
    ).toHaveTextContent(
      "Tawaran tertinggi saat ini",
    );

    expect(
      screen.getByTestId("bid-hint"),
    ).toHaveTextContent("Rp 200");

    expect(
      screen.getByTestId("bid-input"),
    ).toHaveAttribute(
      "placeholder",
      "Minimal Rp 201",
    );
  });

  it("renders first-bid message when there is no highest bid", () => {
    createContext({
      aucation: auctionWithoutBid,
      highestBid: null,
    });

    expect(
      screen.getByTestId("bid-hint"),
    ).toHaveTextContent(
      "Belum ada penawaran",
    );

    expect(
      screen.getByTestId("bid-hint"),
    ).toHaveTextContent(
      "Rp 500",
    );

    expect(
      screen.getByTestId("bid-input"),
    ).toHaveAttribute(
      "placeholder",
      "Minimal Rp 500",
    );
  });

  it("uses minimum value 1 when start bid is missing", () => {
    const auction = {
      id: 3,
      title: "Barang Tanpa Harga",
      start_bid: null,
      bids: [],
    };

    createContext({
      aucation: auction,
      highestBid: null,
    });

    expect(
      screen.getByTestId("bid-input"),
    ).toHaveAttribute(
      "placeholder",
      "Minimal Rp 1",
    );
  });

  it("emits close when close button is clicked", async () => {
    const context = createContext();

    await fireEvent.click(
      screen.getByTestId(
        "close-bid-modal-btn",
      ),
    );

    expect(
      context.emitted().close,
    ).toHaveLength(1);
  });

  it("emits close when cancel button is clicked", async () => {
    const context = createContext();

    await fireEvent.click(
      screen.getByTestId(
        "cancel-bid-modal-btn",
      ),
    );

    expect(
      context.emitted().close,
    ).toHaveLength(1);
  });

  it("shows error when bid amount is invalid", async () => {
    const context = createContext();

    const bidSpy = vi.spyOn(
      context.store,
      "asyncSetIsBidAdd",
    );

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "0",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Nominal penawaran tidak valid",
    );

    expect(bidSpy).not.toHaveBeenCalled();
  });

  it("shows error when bid is not higher than current highest bid", async () => {
    const context = createContext({
      highestBid: 200,
    });

    const bidSpy = vi.spyOn(
      context.store,
      "asyncSetIsBidAdd",
    );

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "200",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Penawaran harus lebih tinggi dari tawaran tertinggi saat ini (Rp 200)",
    );

    expect(bidSpy).not.toHaveBeenCalled();
  });

  it("shows error when first bid is below start bid", async () => {
    const context = createContext({
      aucation: auctionWithoutBid,
      highestBid: null,
    });

    const bidSpy = vi.spyOn(
      context.store,
      "asyncSetIsBidAdd",
    );

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "499",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Penawaran minimal sama dengan harga awal (Rp 500)",
    );

    expect(bidSpy).not.toHaveBeenCalled();
  });

  it("submits valid bid when there is an existing highest bid", async () => {
    const context = createContext({
      highestBid: 200,
    });

    const bidSpy = vi
      .spyOn(
        context.store,
        "asyncSetIsBidAdd",
      )
      .mockResolvedValue(undefined);

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "250",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(bidSpy).toHaveBeenCalledWith(
      1,
      250,
    );

    expect(
      toolsHelper.showErrorDialog,
    ).not.toHaveBeenCalled();
  });

  it("submits valid first bid at the start bid amount", async () => {
    const context = createContext({
      aucation: auctionWithoutBid,
      highestBid: null,
    });

    const bidSpy = vi
      .spyOn(
        context.store,
        "asyncSetIsBidAdd",
      )
      .mockResolvedValue(undefined);

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "500",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(bidSpy).toHaveBeenCalledWith(
      2,
      500,
    );
  });

  it("shows loading state while bid is being submitted", async () => {
    const context = createContext();

    let resolveBid;

    const pendingBid = new Promise(
      (resolve) => {
        resolveBid = resolve;
      },
    );

    vi.spyOn(
      context.store,
      "asyncSetIsBidAdd",
    ).mockReturnValue(
      pendingBid,
    );

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "250",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Mengirim...",
        }),
      ).toBeDisabled();
    });

    resolveBid();

    context.store.isBidAdd = true;

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Kirim Penawaran",
        }),
      ).not.toBeDisabled();
    });
  });

  it("resets loading when bid request finishes without successful result", async () => {
    const context = createContext();

    const bidSpy = vi
      .spyOn(
        context.store,
        "asyncSetIsBidAdd",
      )
      .mockResolvedValue(undefined);

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "250",
    );

    await fireEvent.submit(
      context.container.querySelector("form"),
    );

    expect(bidSpy).toHaveBeenCalledWith(
      1,
      250,
    );

    context.store.isBidAdd = true;
    context.store.isBidAdded = false;

    await waitFor(() => {
      expect(
        context.store.isBidAdd,
      ).toBe(false);
    });

    expect(
      context.emitted().saved,
    ).toBeUndefined();
  });

  it("emits saved and close when bid succeeds", async () => {
    const context = createContext();

    context.store.isBidAdd = true;
    context.store.isBidAdded = true;

    await waitFor(() => {
      expect(
        context.store.isBidAdd,
      ).toBe(false);
    });

    expect(
      context.store.isBidAdded,
    ).toBe(false);

    expect(
      context.emitted().saved,
    ).toHaveLength(1);

    expect(
      context.emitted().close,
    ).toHaveLength(1);
  });

  it("clears bid input when modal is opened", async () => {
    const context = createContext();

    await fireEvent.update(
      screen.getByTestId("bid-input"),
      "250",
    );

    expect(
      screen.getByTestId("bid-input"),
    ).toHaveValue(250);

    await context.rerender({
      show: false,
      aucation: auctionWithBid,
    });

    await context.rerender({
      show: true,
      aucation: auctionWithBid,
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("bid-input"),
      ).toHaveValue(null);
    });
  });

  it("uses latest highest bid when auction changes", async () => {
    const context = createContext({
      highestBid: 200,
    });

    aucationHelper.getHighestBid.mockReturnValue(
      900,
    );

    await context.rerender({
      show: true,
      aucation: {
        id: 4,
        title: "Monitor",
        start_bid: 500,
        bids: [
          {
            bid: 900,
          },
        ],
      },
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("bid-input"),
      ).toHaveAttribute(
        "placeholder",
        "Minimal Rp 901",
      );
    });
  });
});