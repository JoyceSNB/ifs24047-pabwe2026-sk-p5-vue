import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import {
  render,
  fireEvent,
} from "@testing-library/vue";

import ChangeCoverModal from "./ChangeCoverModal.vue";

import * as api from "../api/aucationApi";

vi.mock("../api/aucationApi", () => ({
  changeCover: vi.fn(),
}));

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal when show is true", () => {
    const { getByText } = render(
      ChangeCoverModal,
      {
        props: {
          show: true,
          aucation: {
            id: 1,
          },
        },
      },
    );

    expect(
      getByText("Ganti Cover"),
    ).toBeTruthy();
  });

  it("closes the modal when Batal is clicked", async () => {
    const {
      getByText,
      emitted,
    } = render(ChangeCoverModal, {
      props: {
        show: true,
        aucation: {
          id: 1,
        },
      },
    });

    await fireEvent.click(
      getByText("Batal"),
    );

    expect(
      emitted().close,
    ).toBeTruthy();
  });

  it("returns without calling api when no file is selected", async () => {
    const {
      getByText,
    } = render(ChangeCoverModal, {
      props: {
        show: true,
        aucation: {
          id: 1,
        },
      },
    });

    await fireEvent.click(
      getByText("Simpan"),
    );

    expect(
      api.changeCover,
    ).not.toHaveBeenCalled();
  });

  it("changes cover and emits saved and close when file is selected", async () => {
    const response = {
      success: true,
      data: {
        id: 1,
      },
    };

    api.changeCover.mockResolvedValue(
      response,
    );

    const {
      getByTestId,
      getByText,
      emitted,
    } = render(ChangeCoverModal, {
      props: {
        show: true,
        aucation: {
          id: 123,
        },
      },
    });

    const file = new File(
      ["image"],
      "cover.png",
      {
        type: "image/png",
      },
    );

    await fireEvent.change(
      getByTestId("cover-input"),
      {
        target: {
          files: [file],
        },
      },
    );

    await fireEvent.click(
      getByText("Simpan"),
    );

    expect(
      api.changeCover,
    ).toHaveBeenCalledWith(
      123,
      file,
    );

    expect(
      emitted().saved,
    ).toBeTruthy();

    expect(
      emitted().saved[0],
    ).toEqual([
      response,
    ]);

    expect(
      emitted().close,
    ).toBeTruthy();
  });
});