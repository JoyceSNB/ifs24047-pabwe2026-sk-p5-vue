import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/vue";

import {
  createMemoryHistory,
  createRouter,
} from "vue-router";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import DetailPage from "./DetailPage.vue";

import {
  useAucationsStore,
} from "../states/aucationsStore";

import {
  useAuthStore,
} from "../../auth/states/authStore";

vi.mock(
  "../components/MarkdownViewer.vue",
  () => ({
    default: {
      name: "MarkdownViewer",

      props: {
        value: {
          type: String,
          default: "",
        },
      },

      template: `
        <div data-testid="markdown-viewer">
          {{ value }}
        </div>
      `,
    },
  }),
);

vi.mock(
  "../modals/BidModal.vue",
  () => ({
    default: {
      name: "BidModal",

      props: {
        show: Boolean,

        aucation: {
          type: Object,
          default: null,
        },
      },

      emits: [
        "close",
        "saved",
      ],

      template: `
        <div
          v-if="show"
          data-testid="bid-modal"
        >
          <button
            data-testid="close-bid-modal"
            @click="$emit('close')"
          >
            Tutup
          </button>

          <button
            data-testid="save-bid-modal"
            @click="$emit('saved')"
          >
            Simpan
          </button>
        </div>
      `,
    },
  }),
);

vi.mock(
  "../modals/ChangeModal.vue",
  () => ({
    default: {
      name: "ChangeModal",

      props: {
        show: Boolean,

        aucation: {
          type: Object,
          default: null,
        },
      },

      emits: [
        "close",
        "saved",
      ],

      template: `
        <div
          v-if="show"
          data-testid="change-modal"
        >
          <button
            data-testid="close-change-modal"
            @click="$emit('close')"
          >
            Tutup
          </button>

          <button
            data-testid="save-change-modal"
            @click="$emit('saved')"
          >
            Simpan
          </button>
        </div>
      `,
    },
  }),
);

vi.mock(
  "../../../helpers/toolsHelper",
  () => ({
    formatRupiah: vi.fn(
      (value) =>
        `Rp ${Number(value).toLocaleString("id-ID")}`,
    ),

    formatDate: vi.fn(
      (value) =>
        `DATE:${new Date(value).toISOString()}`,
    ),

    showConfirmDialog: vi.fn(
      async () => true,
    ),

    showSuccessDialog: vi.fn(
      async () => undefined,
    ),
  }),
);

vi.mock(
  "../helpers/aucationHelper",
  () => ({
    getHighestBid: vi.fn(
      (auction) => {
        if (!auction?.bids?.length) {
          return null;
        }

        return Math.max(
          ...auction.bids.map(
            (bid) =>
              Number(bid.bid),
          ),
        );
      },
    ),

    isClosed: vi.fn(
      (auction) => {
        if (!auction?.closed_at) {
          return false;
        }

        return (
          new Date(
            auction.closed_at,
          ).getTime() <=
          Date.now()
        );
      },
    ),
  }),
);

const futureDate =
  "2099-12-31T23:59:59.000Z";

const pastDate =
  "2000-01-01T00:00:00.000Z";

function createAuction(
  overrides = {},
) {
  return {
    id: 10,

    title: "Lelang Laptop",

    description:
      "# Laptop Bekas\n\nLaptop masih bagus.",

    cover: null,

    start_bid: 1000000,

    closed_at: futureDate,

    user_id: 1,

    is_mine: true,

    bids: [
      {
        id: 1,

        user_id: 2,

        user: {
          id: 2,
          name: "Andi",
        },

        bid: 1500000,
      },

      {
        id: 2,

        user_id: 3,

        user: {
          id: 3,
          name: "Siti",
        },

        bid: 2000000,
      },
    ],

    ...overrides,
  };
}

function createTestRouter() {
  return createRouter({
    history:
      createMemoryHistory(),

    routes: [
      {
        path: "/",

        component: {
          template:
            "<div>Home</div>",
        },
      },

      {
        path:
          "/aucations/:aucationId",

        component:
          DetailPage,
      },
    ],
  });
}

async function createTestContext({
  auction = createAuction(),

  user = {
    id: 1,
    name: "Pemilik",
  },

  loading = false,

  mockLoad = true,

  loadImplementation,
} = {}) {
  const pinia =
    createPinia();

  setActivePinia(pinia);

  const store =
    useAucationsStore();

  const auth =
    useAuthStore();

  store.loading =
    loading;

  store.aucation =
    auction;

  auth.user =
    user;

  let loadSpy;

  if (mockLoad) {
    if (loadImplementation) {
      loadSpy = vi
        .spyOn(
          store,
          "asyncGetAucation",
        )
        .mockImplementation(
          loadImplementation,
        );
    } else {
      loadSpy = vi
        .spyOn(
          store,
          "asyncGetAucation",
        )
        .mockResolvedValue(
          undefined,
        );
    }
  }

  const router =
    createTestRouter();

  await router.push(
    "/aucations/10",
  );

  await router.isReady();

  const result =
    render(
      DetailPage,
      {
        global: {
          plugins: [
            pinia,
            router,
          ],
        },
      },
    );

  return {
    ...result,

    pinia,

    router,

    store,

    auth,

    loadSpy,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe(
  "DetailPage",
  () => {
    it(
      "loads auction detail when page is mounted",
      async () => {
        const context =
          await createTestContext();

        await waitFor(
          () => {
            expect(
              context.loadSpy,
            ).toHaveBeenCalledWith(
              "10",
            );
          },
        );
      },
    );

    it(
      "shows loading state",
      async () => {
        let resolveLoad;

        const pendingLoad =
          new Promise(
            (resolve) => {
              resolveLoad =
                resolve;
            },
          );

        await createTestContext({
          auction: null,

          loading: true,

          loadImplementation:
            () =>
              pendingLoad,
        });

        expect(
          screen.getByText(
            "Memuat...",
          ),
        ).toBeInTheDocument();

        resolveLoad();
      },
    );

    it(
      "shows not found state when auction does not exist",
      async () => {
        await createTestContext({
          auction: null,

          loading: false,
        });

        expect(
          screen.getByText(
            "Lelang tidak ditemukan",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders auction information",
      async () => {
        await createTestContext();

        expect(
          screen.getByText(
            "Lelang Laptop",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Harga awal",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Rp 1.000.000",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Tawaran tertinggi",
          ),
        ).toBeInTheDocument();

        const highestBidElement =
          screen
            .getByText(
              "Tawaran tertinggi",
            )
            .nextElementSibling;

        expect(
          highestBidElement,
        ).toHaveTextContent(
          "Rp 2.000.000",
        );

        expect(
          screen.getByTestId(
            "markdown-viewer",
          ),
        ).toHaveTextContent(
          "# Laptop Bekas",
        );

        expect(
          screen.getByText(
            "Berakhir DATE:2099-12-31T23:59:59.000Z",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders auction cover when cover exists",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              cover:
                "https://example.com/laptop.jpg",
            }),
        });

        const image =
          screen.getByRole(
            "img",
          );

        expect(
          image,
        ).toHaveAttribute(
          "src",
          "https://example.com/laptop.jpg",
        );
      },
    );

    it(
      "renders placeholder when auction has no cover",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              cover: null,
            }),
        });

        expect(
          screen.getByText(
            "🔨",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders bid history",
      async () => {
        await createTestContext();

        expect(
          screen.getByText(
            "Riwayat Tawaran",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Andi",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Siti",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Rp 1.500.000",
          ),
        ).toBeInTheDocument();

        const bidHistory =
          screen
            .getByText(
              "Riwayat Tawaran",
            )
            .nextElementSibling;

        expect(
          bidHistory,
        ).toHaveTextContent(
          "Rp 2.000.000",
        );
      },
    );

    it(
      "renders username fallback when bid user has no name",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              bids: [
                {
                  id: 3,

                  user_id: 5,

                  user: {
                    id: 5,
                    username:
                      "peserta5",
                  },

                  bid: 1750000,
                },
              ],
            }),
        });

        expect(
          screen.getByText(
            "peserta5",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "renders bid fallback when auction has no bids property",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              bids: undefined,
            }),
        });

        expect(
          screen.getByText(
            "Tawaran tertinggi",
          )
            .nextElementSibling,
        ).toHaveTextContent(
          "-",
        );

        expect(
          screen.getByText(
            "Belum ada tawaran.",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "shows Edit button for auction owner",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine: true,
            }),
        });

        expect(
          screen.getByText(
            "Edit",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "opens and closes change modal",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine: true,
            }),
        });

        await fireEvent.click(
          screen.getByText(
            "Edit",
          ),
        );

        expect(
          screen.getByTestId(
            "change-modal",
          ),
        ).toBeInTheDocument();

        await fireEvent.click(
          screen.getByTestId(
            "close-change-modal",
          ),
        );

        expect(
          screen.queryByTestId(
            "change-modal",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "uses user_id fallback to determine auction owner",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine:
                undefined,

              user_id: 1,
            }),

          user: {
            id: 1,
            name: "Pemilik",
          },
        });

        expect(
          screen.getByText(
            "Edit",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "does not show bid button when auction is closed",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine: false,

              user_id: 99,

              closed_at:
                pastDate,
            }),

          user: {
            id: 1,
            name: "Peserta",
          },
        });

        expect(
          screen.queryByTestId(
            "open-bid-modal",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "opens and closes bid modal",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine: false,

              user_id: 99,

              closed_at:
                futureDate,
            }),

          user: {
            id: 1,
            name: "Peserta",
          },
        });

        await fireEvent.click(
          screen.getByTestId(
            "open-bid-modal",
          ),
        );

        expect(
          screen.getByTestId(
            "bid-modal",
          ),
        ).toBeInTheDocument();

        await fireEvent.click(
          screen.getByTestId(
            "close-bid-modal",
          ),
        );

        expect(
          screen.queryByTestId(
            "bid-modal",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "reloads auction when bid modal is saved",
      async () => {
        const context =
          await createTestContext({
            auction:
              createAuction({
                is_mine: false,

                user_id: 99,

                closed_at:
                  futureDate,
              }),

            user: {
              id: 1,
              name: "Peserta",
            },
          });

        await fireEvent.click(
          screen.getByTestId(
            "open-bid-modal",
          ),
        );

        await fireEvent.click(
          screen.getByTestId(
            "save-bid-modal",
          ),
        );

        await waitFor(
          () => {
            expect(
              context.loadSpy,
            ).toHaveBeenCalled();
          },
        );
      },
    );

    it(
      "reloads auction when change modal is saved",
      async () => {
        const context =
          await createTestContext({
            auction:
              createAuction({
                is_mine: true,
              }),
          });

        await fireEvent.click(
          screen.getByText(
            "Edit",
          ),
        );

        await fireEvent.click(
          screen.getByTestId(
            "save-change-modal",
          ),
        );

        await waitFor(
          () => {
            expect(
              context.loadSpy,
            ).toHaveBeenCalled();
          },
        );
      },
    );

    it(
      "cancels bid when confirmed",
      async () => {
        const context =
          await createTestContext({
            auction:
              createAuction({
                is_mine: false,

                user_id: 99,

                bids: [
                  {
                    id: 1,

                    user_id: 1,

                    user: {
                      id: 1,
                      name: "Peserta",
                    },

                    bid: 1500000,
                  },
                ],
              }),

            user: {
              id: 1,
              name: "Peserta",
            },
          });

        const deleteBidSpy =
          vi
            .spyOn(
              context.store,
              "deleteBid",
            )
            .mockResolvedValue(
              undefined,
            );

        await fireEvent.click(
          screen.getByTestId(
            "cancel-bid-btn",
          ),
        );

        await waitFor(
          () => {
            expect(
              deleteBidSpy,
            ).toHaveBeenCalledWith(
              "10",
            );
          },
        );

        await waitFor(
          () => {
            expect(
              context.loadSpy,
            ).toHaveBeenCalled();
          },
        );
      },
    );

    it(
      "does not cancel bid when confirmation is rejected",
      async () => {
        const tools =
          await import(
            "../../../helpers/toolsHelper"
          );

        tools.showConfirmDialog.mockResolvedValue(
          false,
        );

        const context =
          await createTestContext({
            auction:
              createAuction({
                is_mine: false,

                user_id: 99,

                bids: [
                  {
                    id: 1,

                    user_id: 1,

                    user: {
                      id: 1,
                      name: "Peserta",
                    },

                    bid: 1500000,
                  },
                ],
              }),

            user: {
              id: 1,
              name: "Peserta",
            },
          });

        const deleteBidSpy =
          vi.spyOn(
            context.store,
            "deleteBid",
          );

        await fireEvent.click(
          screen.getByTestId(
            "cancel-bid-btn",
          ),
        );

        expect(
          deleteBidSpy,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "shows cancel bid button for current user's bid",
      async () => {
        await createTestContext({
          auction:
            createAuction({
              is_mine: false,

              user_id: 99,

              bids: [
                {
                  id: 1,

                  user_id: 1,

                  user: {
                    id: 1,
                    name: "Peserta",
                  },

                  bid: 1500000,
                },
              ],
            }),

          user: {
            id: 1,
            name: "Peserta",
          },
        });

        expect(
          screen.getByTestId(
            "cancel-bid-btn",
          ),
        ).toBeInTheDocument();
      },
    );
  },
);