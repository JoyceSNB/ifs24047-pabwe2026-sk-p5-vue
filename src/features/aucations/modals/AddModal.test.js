import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  render,
  fireEvent,
} from "@testing-library/vue";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import AddModal from "./AddModal.vue";

import {
  useAucationsStore,
} from "../states/aucationsStore";

const {
  showErrorDialogMock,
  toApiDateTimeMock,
} = vi.hoisted(() => ({
  showErrorDialogMock: vi.fn(),
  toApiDateTimeMock: vi.fn(
    (value) => `API:${value}`,
  ),
}));

vi.mock(
  "../../../helpers/toolsHelper",
  () => ({
    showErrorDialog:
      showErrorDialogMock,
  }),
);

vi.mock(
  "../helpers/aucationHelper",
  () => ({
    toApiDateTime:
      toApiDateTimeMock,
  }),
);

const markdownEditorStub = {
  props: [
    "modelValue",
    "textareaTestId",
  ],

  emits: [
    "update:modelValue",
  ],

  template: `
    <textarea
      :data-testid="textareaTestId"
      :value="modelValue"
      @input="$emit(
        'update:modelValue',
        $event.target.value
      )"
    />
  `,
};

function renderModal(
  show = true,
  pinia = createPinia(),
) {
  setActivePinia(pinia);

  return render(
    AddModal,
    {
      props: {
        show,
      },

      global: {
        plugins: [pinia],

        stubs: {
          MarkdownEditor:
            markdownEditorStub,
        },
      },
    },
  );
}

async function fillValidForm(
  result,
) {
  await fireEvent.update(
    result.getByTestId(
      "add-aucation-title-input",
    ),
    "  Barang Test  ",
  );

  await fireEvent.update(
    result.getByTestId(
      "add-aucation-description-input",
    ),
    "  Deskripsi Test  ",
  );

  await fireEvent.update(
    result.getByTestId(
      "add-aucation-start-bid-input",
    ),
    "25000",
  );

  await fireEvent.update(
    result.getByTestId(
      "add-aucation-closed-at-input",
    ),
    "2099-12-31T10:30",
  );
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setActivePinia(
      createPinia(),
    );

    document.body.style.overflow =
      "auto";
  });

  afterEach(() => {
    document.body.style.overflow =
      "auto";
  });

  it("renders the modal when show is true", () => {
    const result =
      renderModal(true);

    expect(
      result.getByTestId(
        "add-aucation-modal",
      ),
    ).toBeTruthy();

    expect(
      result.getByText(
        "Tambah Lelang Baru",
      ),
    ).toBeTruthy();

    expect(
      result.getByTestId(
        "add-aucation-title-input",
      ),
    ).toBeTruthy();

    expect(
      result.getByTestId(
        "add-aucation-start-bid-input",
      ),
    ).toBeTruthy();

    expect(
      result.getByTestId(
        "add-aucation-closed-at-input",
      ),
    ).toBeTruthy();

    expect(
      result.getByTestId(
        "add-aucation-description-input",
      ),
    ).toBeTruthy();
  });

  it("does not render the modal when show is false", () => {
    const result =
      renderModal(false);

    expect(
      result.queryByTestId(
        "add-aucation-modal",
      ),
    ).toBeNull();
  });

  it("emits close when close button is clicked", async () => {
    const result =
      renderModal(true);

    await fireEvent.click(
      result.getByTestId(
        "close-add-modal-btn",
      ),
    );

    expect(
      result.emitted().close,
    ).toHaveLength(1);
  });

  it("emits close when cancel button is clicked", async () => {
    const result =
      renderModal(true);

    await fireEvent.click(
      result.getByTestId(
        "cancel-add-modal-btn",
      ),
    );

    expect(
      result.emitted().close,
    ).toHaveLength(1);
  });

  it("shows error when title is empty", async () => {
    const result =
      renderModal(true);

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Judul tidak boleh kosong",
    );
  });

  it("shows error when description is empty", async () => {
    const result =
      renderModal(true);

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-title-input",
      ),
      "Barang Test",
    );

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Deskripsi tidak boleh kosong",
    );
  });

  it("shows error when start bid is zero", async () => {
    const result =
      renderModal(true);

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-title-input",
      ),
      "Barang Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-description-input",
      ),
      "Deskripsi Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-start-bid-input",
      ),
      "0",
    );

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Harga awal harus lebih dari 0",
    );
  });

  it("shows error when closedAt is empty", async () => {
    const result =
      renderModal(true);

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-title-input",
      ),
      "Barang Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-description-input",
      ),
      "Deskripsi Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-start-bid-input",
      ),
      "10000",
    );

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Batas waktu penutupan wajib diisi",
    );
  });

  it("shows error when closedAt is in the past", async () => {
    const result =
      renderModal(true);

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-title-input",
      ),
      "Barang Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-description-input",
      ),
      "Deskripsi Test",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-start-bid-input",
      ),
      "10000",
    );

    await fireEvent.update(
      result.getByTestId(
        "add-aucation-closed-at-input",
      ),
      "2020-01-01T10:00",
    );

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Batas waktu penutupan harus lebih dari waktu sekarang",
    );
  });

  it("submits valid data and sets loading state", async () => {
    const pinia =
      createPinia();

    setActivePinia(pinia);

    const store =
      useAucationsStore();

    const asyncSetIsAucationAddMock =
      vi
        .spyOn(
          store,
          "asyncSetIsAucationAdd",
        )
        .mockImplementation(
          () => Promise.resolve(),
        );

    const result =
      renderModal(
        true,
        pinia,
      );

    await fillValidForm(
      result,
    );

    await fireEvent.click(
      result.getByTestId(
        "submit-add-modal-btn",
      ),
    );

    expect(
      asyncSetIsAucationAddMock,
    ).toHaveBeenCalledWith(
      "Barang Test",
      "Deskripsi Test",
      25000,
      "API:2099-12-31T10:30",
    );

    expect(
      result.getByTestId(
        "submit-add-modal-btn",
      ).disabled,
    ).toBe(true);
  });

  it("resets form and emits saved and close after successful store state", async () => {
    const pinia =
      createPinia();

    setActivePinia(pinia);

    const store =
      useAucationsStore();

    const setIsAucationAddMock =
      vi.spyOn(
        store,
        "setIsAucationAdd",
      );

    const setIsAucationAddedMock =
      vi.spyOn(
        store,
        "setIsAucationAdded",
      );

    const result =
      renderModal(
        true,
        pinia,
      );

    await fillValidForm(
      result,
    );

    store.isAucationAdd =
      true;

    store.isAucationAdded =
      true;

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 0),
    );

    expect(
      setIsAucationAddMock,
    ).toHaveBeenCalledWith(
      false,
    );

    expect(
      setIsAucationAddedMock,
    ).toHaveBeenCalledWith(
      false,
    );

    expect(
      result.emitted().saved,
    ).toBeTruthy();

    expect(
      result.emitted().close,
    ).toBeTruthy();

    expect(
      result.getByTestId(
        "add-aucation-title-input",
      ).value,
    ).toBe("");

    expect(
      result.getByTestId(
        "add-aucation-start-bid-input",
      ).value,
    ).toBe("");

    expect(
      result.getByTestId(
        "add-aucation-closed-at-input",
      ).value,
    ).toBe("");
  });

  it("handles auction add state when added is false", async () => {
    const pinia =
      createPinia();

    setActivePinia(pinia);

    const store =
      useAucationsStore();

    const setIsAucationAddMock =
      vi.spyOn(
        store,
        "setIsAucationAdd",
      );

    const setIsAucationAddedMock =
      vi.spyOn(
        store,
        "setIsAucationAdded",
      );

    const result =
      renderModal(
        true,
        pinia,
      );

    store.isAucationAdd =
      true;

    store.isAucationAdded =
      false;

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 0),
    );

    expect(
      setIsAucationAddMock,
    ).toHaveBeenCalledWith(
      false,
    );

    expect(
      setIsAucationAddedMock,
    ).not.toHaveBeenCalled();

    expect(
      result.emitted().saved,
    ).toBeUndefined();

    expect(
      result.emitted().close,
    ).toBeUndefined();
  });

  it("updates body overflow when show prop changes", async () => {
    const result =
      renderModal(false);

    expect(
      document.body.style.overflow,
    ).toBe("auto");

    await result.rerender({
      show: true,
    });

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 0),
    );

    expect(
      document.body.style.overflow,
    ).toBe("hidden");

    await result.rerender({
      show: false,
    });

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 0),
    );

    expect(
      document.body.style.overflow,
    ).toBe("auto");
  });
});