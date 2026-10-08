import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/vue";

import {
  createPinia,
  setActivePinia,
} from "pinia";

import {
  createRouter,
  createMemoryHistory,
} from "vue-router";

import HomePage from "./HomePage.vue";

import {
  useAucationsStore,
} from "../states/aucationsStore";

vi.mock(
  "../states/aucationsStore",
  () => ({
    useAucationsStore:
      vi.fn(),
  }),
);

const openAuctionOne = {
  id: 1,
  title: "Laptop Gaming",
  description:
    "Laptop gaming dengan spesifikasi tinggi",
  start_bid: 5000000,
  closed_at:
    "2999-12-31T23:59:59",
  cover:
    "https://example.com/laptop.jpg",
  user_id: 10,
  is_mine: false,
};

const openMineAuction = {
  id: 2,
  title: "Sepeda Gunung",
  description:
    "Sepeda gunung untuk perjalanan",
  start_bid: 2500000,
  closed_at:
    "2999-12-31T23:59:59",
  cover:
    "https://example.com/bike.jpg",
  user_id: 20,
  is_mine: true,
};

const closedAuction = {
  id: 3,
  title: "Kamera Digital",
  description:
    "Kamera digital bekas",
  start_bid: 3000000,
  closed_at:
    "2020-01-01T00:00:00",
  cover:
    "https://example.com/camera.jpg",
  user_id: 30,
  is_mine: false,
};

const baseAuctions = [
  openAuctionOne,
  openMineAuction,
];

function createAuctionStore(
  auctions = baseAuctions,
) {
  const store = {
    aucations: auctions,
    loading: false,
    asyncGetAucations:
      vi.fn(
        async () => undefined,
      ),
  };

  useAucationsStore.mockReturnValue(
    store,
  );

  return store;
}

async function createTestRouter(
  initialPath = "/",
) {
  const router =
    createRouter({
      history:
        createMemoryHistory(),

      routes: [
        {
          path: "/",
          component: HomePage,
        },
        {
          path:
            "/aucations/:aucationId",
          component: {
            template:
              "<div>Detail</div>",
          },
        },
      ],
    });

  await router.push(
    initialPath,
  );

  await router.isReady();

  return router;
}

describe("HomePage", () => {
  beforeEach(() => {
    setActivePinia(
      createPinia(),
    );

    vi.clearAllMocks();
  });

  it(
    "renders page title and add auction button",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore();

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.getByRole(
          "heading",
          {
            name: "Lelang",
          },
        ),
      ).toBeTruthy();

      expect(
        screen.getByRole(
          "button",
          {
            name: /Tambah Lelang/i,
          },
        ),
      ).toBeTruthy();
    },
  );

  it(
    "loads open auctions by default",
    async () => {
      const router =
        await createTestRouter();

      const store =
        createAuctionStore();

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_closed: true,
            },
          );
        },
      );
    },
  );

  it(
    "shows loading state",
    async () => {
      const router =
        await createTestRouter();

      const store =
        createAuctionStore();

      store.loading = true;

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.getByText(
          "Memuat...",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "shows empty state when no auction matches",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.getByTestId(
          "empty-auctions",
        ),
      ).toBeTruthy();

      expect(
        screen.getByText(
          "Tidak ada lelang.",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "renders open auctions returned by Delcom",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
        openMineAuction,
        closedAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.getByText(
          "Laptop Gaming",
        ),
      ).toBeTruthy();

      expect(
        screen.getByText(
          "Sepeda Gunung",
        ),
      ).toBeTruthy();

      expect(
        screen.getByText(
          "Kamera Digital",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "renders cover image when auction has cover",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      const image =
        screen.getByRole(
          "img",
        );

      expect(
        image.getAttribute(
          "src",
        ),
      ).toBe(
        "https://example.com/laptop.jpg",
      );

      expect(
        image.getAttribute(
          "alt",
        ),
      ).toBe(
        "Laptop Gaming",
      );
    },
  );

  it(
    "uses fallback alt text when auction title is empty",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        {
          ...openAuctionOne,
          title: "",
        },
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      const image =
        screen.getByRole(
          "img",
        );

      expect(
        image.getAttribute(
          "alt",
        ),
      ).toBe(
        "Cover lelang",
      );
    },
  );

  it(
    "uses fallback alt text when auction title is missing",
    async () => {
      const router =
        await createTestRouter();

      const auction = {
        ...openAuctionOne,
      };

      delete auction.title;

      createAuctionStore([
        auction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      const image =
        screen.getByRole(
          "img",
        );

      expect(
        image.getAttribute(
          "alt",
        ),
      ).toBe(
        "Cover lelang",
      );
    },
  );

  it(
    "renders fallback icon when auction has no cover",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        {
          ...closedAuction,
          closed_at:
            "2999-12-31T23:59:59",
          cover: "",
        },
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.queryByRole(
          "img",
        ),
      ).toBeNull();

      const fallback =
        document.querySelector(
          "span.text-4xl",
        );

      expect(
        fallback,
      ).not.toBeNull();
    },
  );

  it(
    "filters auctions by title",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
        openMineAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "laptop",
      );

      expect(
        screen.getByText(
          "Laptop Gaming",
        ),
      ).toBeTruthy();

      expect(
        screen.queryByText(
          "Sepeda Gunung",
        ),
      ).toBeNull();
    },
  );

  it(
    "filters open auctions by description",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
        openMineAuction,
        {
          id: 4,
          title:
            "Barang Lain",
          description:
            "Barang untuk fotografi",
          start_bid: 1000000,
          closed_at:
            "2999-12-31T23:59:59",
          cover: "",
          user_id: 40,
          is_mine: false,
        },
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "fotografi",
      );

      expect(
        screen.getByText(
          "Barang Lain",
        ),
      ).toBeTruthy();

      expect(
        screen.queryByText(
          "Laptop Gaming",
        ),
      ).toBeNull();

      expect(
        screen.queryByText(
          "Sepeda Gunung",
        ),
      ).toBeNull();
    },
  );

  it(
    "filters when title is missing",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        {
          ...openAuctionOne,
          title: undefined,
        },
        openMineAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "sepeda",
      );

      expect(
        screen.getByText(
          "Sepeda Gunung",
        ),
      ).toBeTruthy();

      expect(
        screen.queryByText(
          "Laptop Gaming",
        ),
      ).toBeNull();
    },
  );

  it(
    "filters when description is missing",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        {
          ...openAuctionOne,
          description:
            undefined,
        },
        openMineAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "sepeda",
      );

      expect(
        screen.getByText(
          "Sepeda Gunung",
        ),
      ).toBeTruthy();

      expect(
        screen.queryByText(
          "Laptop Gaming",
        ),
      ).toBeNull();
    },
  );

  it(
    "search is case insensitive",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
        openMineAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "LAPTOP",
      );

      expect(
        screen.getByText(
          "Laptop Gaming",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "shows empty state when search has no result",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
        openMineAuction,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await fireEvent.update(
        screen.getByTestId(
          "auction-search",
        ),
        "barang-tidak-ada",
      );

      expect(
        screen.getByTestId(
          "empty-auctions",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "requests closed auctions from Delcom on closed tab",
    async () => {
      const router =
        await createTestRouter(
          "/?tab=closed",
        );

      const store =
        createAuctionStore([
          closedAuction,
        ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_closed: false,
            },
          );
        },
      );

      expect(
        screen.getByText(
          "Kamera Digital",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "requests mine auctions from Delcom on mine tab",
    async () => {
      const router =
        await createTestRouter(
          "/?tab=me",
        );

      const store =
        createAuctionStore([
          openMineAuction,
        ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_me: true,
            },
          );
        },
      );

      expect(
        screen.getByText(
          "Sepeda Gunung",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "does not perform local ownership filtering on mine tab",
    async () => {
      const router =
        await createTestRouter(
          "/?tab=me",
        );

      const mineAuction = {
        ...openAuctionOne,
        is_mine:
          undefined,
        user_id: 99,
      };

      const store =
        createAuctionStore([
          mineAuction,
        ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_me: true,
            },
          );
        },
      );

      expect(
        screen.getByText(
          "Laptop Gaming",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "renders mine data exactly as returned by Delcom",
    async () => {
      const router =
        await createTestRouter(
          "/?tab=me",
        );

      const mineAuction = {
        ...openAuctionOne,
        is_mine: false,
        user_id: 999,
      };

      const store =
        createAuctionStore([
          mineAuction,
        ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_me: true,
            },
          );
        },
      );

      expect(
        screen.getByText(
          "Laptop Gaming",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "opens add modal when add auction button is clicked",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore(
        baseAuctions,
      );

      const AddModalStub = {
        props: [
          "show",
        ],

        template:
          '<div data-testid="add-modal">{{ show ? "OPEN" : "CLOSED" }}</div>',
      };

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal:
                AddModalStub,
            },
          },
        },
      );

      expect(
        screen.getByTestId(
          "add-modal",
        ).textContent,
      ).toBe(
        "CLOSED",
      );

      await fireEvent.click(
        screen.getByTestId(
          "open-add-modal",
        ),
      );

      expect(
        screen.getByTestId(
          "add-modal",
        ).textContent,
      ).toBe(
        "OPEN",
      );
    },
  );

  it(
    "closes add modal when child emits close",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore(
        baseAuctions,
      );

      const AddModalStub = {
        props: [
          "show",
        ],

        emits: [
          "close",
        ],

        template: `
          <div data-testid="add-modal">
            <span>
              {{ show ? "OPEN" : "CLOSED" }}
            </span>

            <button
              data-testid="emit-close"
              @click="$emit('close')"
            >
              close
            </button>
          </div>
        `,
      };

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal:
                AddModalStub,
            },
          },
        },
      );

      await fireEvent.click(
        screen.getByTestId(
          "open-add-modal",
        ),
      );

      await fireEvent.click(
        screen.getByTestId(
          "emit-close",
        ),
      );

      expect(
        screen.getByText(
          "CLOSED",
        ),
      ).toBeTruthy();
    },
  );

  it(
    "reloads auctions when child emits saved",
    async () => {
      const router =
        await createTestRouter();

      const store =
        createAuctionStore(
          baseAuctions,
        );

      const AddModalStub = {
        emits: [
          "saved",
        ],

        template: `
          <button
            data-testid="emit-saved"
            @click="$emit('saved')"
          >
            saved
          </button>
        `,
      };

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal:
                AddModalStub,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledTimes(
            1,
          );
        },
      );

      await fireEvent.click(
        screen.getByTestId(
          "emit-saved",
        ),
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledTimes(
            2,
          );
        },
      );
    },
  );

  it(
    "reloads auctions when active tab changes",
    async () => {
      const router =
        await createTestRouter();

      const store =
        createAuctionStore(
          baseAuctions,
        );

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_closed: true,
            },
          );
        },
      );

      await router.push(
        "/?tab=closed",
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_closed: false,
            },
          );
        },
      );

      await router.push(
        "/?tab=me",
      );

      await waitFor(
        () => {
          expect(
            store.asyncGetAucations,
          ).toHaveBeenCalledWith(
            {
              is_me: true,
            },
          );
        },
      );
    },
  );

  it(
    "renders auction detail links",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      const detailLink =
        screen.getByRole(
          "link",
          {
            name: "Lihat",
          },
        );

      expect(
        detailLink.getAttribute(
          "href",
        ),
      ).toBe(
        "/aucations/1",
      );
    },
  );

  it(
    "renders rupiah formatted start bid",
    async () => {
      const router =
        await createTestRouter();

      createAuctionStore([
        openAuctionOne,
      ]);

      render(
        HomePage,
        {
          global: {
            plugins: [
              router,
            ],

            stubs: {
              AddModal: true,
            },
          },
        },
      );

      expect(
        screen.getByText(
          /5\.000\.000/,
        ),
      ).toBeTruthy();
    },
  );
});