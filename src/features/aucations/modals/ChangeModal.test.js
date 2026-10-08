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

import ChangeModal from "./ChangeModal.vue";
import { useAucationsStore } from "../states/aucationsStore";

vi.mock(
  "../../../helpers/toolsHelper",
  () => ({
    showErrorDialog: vi.fn(),
    toDateTimeLocal: vi.fn(),
  }),
);

vi.mock(
  "../helpers/aucationHelper",
  () => ({
    toApiDateTime: vi.fn(),
  }),
);

import * as toolsHelper from "../../../helpers/toolsHelper";
import * as aucationHelper from "../helpers/aucationHelper";

const auction = {
  id: 10,
  title: "Lelang Laptop",
  description: "Laptop masih bagus",
  start_bid: 1000000,
  closed_at: "2099-12-31T23:59:59.000Z",
};

function createContext({
  show = true,
  aucation = auction,
} = {}) {
  const pinia = createPinia();

  setActivePinia(pinia);

  const store = useAucationsStore();

  store.isAucationChange = false;
  store.isAucationChanged = false;

  const result = render(ChangeModal, {
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

  toolsHelper.toDateTimeLocal.mockReturnValue(
    "2099-12-31T23:59",
  );

  aucationHelper.toApiDateTime.mockReturnValue(
    "2099-12-31T23:59:59.000Z",
  );
});

describe("ChangeModal", () => {
  it("does not render when show is false", () => {
    createContext({
      show: false,
    });

    expect(
      screen.queryByTestId(
        "change-aucation-modal",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders modal with auction data", () => {
    createContext();

    expect(
      screen.getByTestId(
        "change-aucation-modal",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "change-aucation-title-input",
      ),
    ).toHaveValue("Lelang Laptop");

    expect(
      screen.getByTestId(
        "change-aucation-description-input",
      ),
    ).toHaveValue(
      "Laptop masih bagus",
    );

    expect(
      screen.getByTestId(
        "change-aucation-start-bid-input",
      ),
    ).toHaveValue(1000000);

    expect(
      screen.getByTestId(
        "change-aucation-closed-at-input",
      ),
    ).toHaveValue(
      "2099-12-31T23:59",
    );

    expect(
      toolsHelper.toDateTimeLocal,
    ).toHaveBeenCalledWith(
      auction.closed_at,
    );
  });

  it("fills empty values when auction data is missing", () => {
    toolsHelper.toDateTimeLocal.mockReturnValue("");

    createContext({
      aucation: null,
    });

    expect(
      screen.getByTestId(
        "change-aucation-title-input",
      ),
    ).toHaveValue("");

    expect(
      screen.getByTestId(
        "change-aucation-description-input",
      ),
    ).toHaveValue("");

    expect(
      screen.getByTestId(
        "change-aucation-start-bid-input",
      ),
    ).toHaveValue(null);

    expect(
      screen.getByTestId(
        "change-aucation-closed-at-input",
      ),
    ).toHaveValue("");

    expect(
      toolsHelper.toDateTimeLocal,
    ).toHaveBeenCalledWith(
      undefined,
    );
  });

  it("emits close when close button is clicked", async () => {
    const context = createContext();

    await fireEvent.click(
      screen.getByTestId(
        "close-change-modal-btn",
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
        "cancel-change-modal-btn",
      ),
    );

    expect(
      context.emitted().close,
    ).toHaveLength(1);
  });

  it("shows error when title is empty", async () => {
    const context = createContext();

    const updateSpy = vi.spyOn(
      context.store,
      "asyncSetIsAucationChange",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-title-input",
      ),
      "",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Judul tidak boleh kosong",
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("shows error when description is empty", async () => {
    const context = createContext();

    const updateSpy = vi.spyOn(
      context.store,
      "asyncSetIsAucationChange",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-description-input",
      ),
      "",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Deskripsi tidak boleh kosong",
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("shows error when start bid is invalid", async () => {
    const context = createContext();

    const updateSpy = vi.spyOn(
      context.store,
      "asyncSetIsAucationChange",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-start-bid-input",
      ),
      "0",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Harga awal harus lebih dari 0",
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("shows error when closed at is empty", async () => {
    const context = createContext();

    const updateSpy = vi.spyOn(
      context.store,
      "asyncSetIsAucationChange",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-closed-at-input",
      ),
      "",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(
      toolsHelper.showErrorDialog,
    ).toHaveBeenCalledWith(
      "Batas waktu penutupan wajib diisi",
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("submits changed auction data", async () => {
    const context = createContext();

    const updateSpy = vi
      .spyOn(
        context.store,
        "asyncSetIsAucationChange",
      )
      .mockResolvedValue(undefined);

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-title-input",
      ),
      "Lelang Laptop Baru",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-description-input",
      ),
      "Deskripsi baru",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-start-bid-input",
      ),
      "2500000",
    );

    await fireEvent.update(
      screen.getByTestId(
        "change-aucation-closed-at-input",
      ),
      "2099-12-30T20:00",
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        10,
        "Lelang Laptop Baru",
        "Deskripsi baru",
        2500000,
        "2099-12-31T23:59:59.000Z",
      );
    });

    expect(
      aucationHelper.toApiDateTime,
    ).toHaveBeenCalledWith(
      "2099-12-30T20:00",
    );
  });

  it("shows loading state while update is processing", async () => {
    const context = createContext();

    let resolveUpdate;

    const pendingUpdate = new Promise(
      (resolve) => {
        resolveUpdate = resolve;
      },
    );

    vi.spyOn(
      context.store,
      "asyncSetIsAucationChange",
    ).mockReturnValue(
      pendingUpdate,
    );

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Menyimpan...",
        }),
      ).toBeDisabled();
    });

    resolveUpdate();

    context.store.isAucationChange = true;

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Simpan Perubahan",
        }),
      ).not.toBeDisabled();
    });
  });

  it("resets loading when store reports change request finished", async () => {
    const context = createContext();

    const updateSpy = vi
      .spyOn(
        context.store,
        "asyncSetIsAucationChange",
      )
      .mockResolvedValue(undefined);

    await fireEvent.submit(
      context.container.querySelector(
        "form",
      ),
    );

    expect(updateSpy).toHaveBeenCalled();

    context.store.isAucationChange = true;
    context.store.isAucationChanged = false;

    await waitFor(() => {
      expect(
        context.store.isAucationChange,
      ).toBe(false);
    });

    expect(
      context.emitted().saved,
    ).toBeUndefined();
  });

  it("emits saved and close when update succeeds", async () => {
    const context = createContext();

    context.store.isAucationChange = true;
    context.store.isAucationChanged = true;

    await waitFor(() => {
      expect(
        context.store.isAucationChange,
      ).toBe(false);
    });

    expect(
      context.store.isAucationChanged,
    ).toBe(false);

    expect(
      context.emitted().saved,
    ).toHaveLength(1);

    expect(
      context.emitted().close,
    ).toHaveLength(1);
  });

  it("refills form when auction prop changes while modal is open", async () => {
    const context = createContext();

    const newAuction = {
      id: 20,
      title: "Lelang Kamera",
      description: "Kamera kondisi baik",
      start_bid: 3000000,
      closed_at: "2099-11-30T10:00:00.000Z",
    };

    context.rerender({
      show: true,
      aucation: newAuction,
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "change-aucation-title-input",
        ),
      ).toHaveValue(
        "Lelang Kamera",
      );
    });

    expect(
      screen.getByTestId(
        "change-aucation-description-input",
      ),
    ).toHaveValue(
      "Kamera kondisi baik",
    );

    expect(
      screen.getByTestId(
        "change-aucation-start-bid-input",
      ),
    ).toHaveValue(3000000);

    expect(
      toolsHelper.toDateTimeLocal,
    ).toHaveBeenLastCalledWith(
      newAuction.closed_at,
    );
  });
});