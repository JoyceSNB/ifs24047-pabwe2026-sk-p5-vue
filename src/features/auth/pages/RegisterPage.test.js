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

import {
  createRouter,
  createMemoryHistory,
} from "vue-router";

import RegisterPage from "./RegisterPage.vue";

const {
  signUpMock,
  showErrorDialogMock,
  showSuccessDialogMock,
} = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  showErrorDialogMock: vi.fn(),
  showSuccessDialogMock: vi.fn(),
}));

vi.mock("../states/authStore", () => ({
  useAuthStore: () => ({
    signUp: signUpMock,
  }),
}));

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: showErrorDialogMock,
  showSuccessDialog: showSuccessDialogMock,
}));

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/auth/register",
        component: {
          template: "<div>Register</div>",
        },
      },
      {
        path: "/auth/login",
        component: {
          template: "<div>Login</div>",
        },
      },
    ],
  });
}

async function renderPage() {
  const router = createTestRouter();

  await router.push("/auth/register");
  await router.isReady();

  const result = render(RegisterPage, {
    global: {
      plugins: [router],
    },
  });

  return {
    ...result,
    router,
  };
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the registration form", async () => {
    const {
      getByPlaceholderText,
      getByText,
    } = await renderPage();

    expect(
      getByText("Buat Akun"),
    ).toBeTruthy();

    expect(
      getByPlaceholderText("Nama"),
    ).toBeTruthy();

    expect(
      getByPlaceholderText("Email"),
    ).toBeTruthy();

    expect(
      getByPlaceholderText("Password"),
    ).toBeTruthy();

    expect(
      getByPlaceholderText("Ulangi Password"),
    ).toBeTruthy();
  });

  it("shows an error when required fields are empty", async () => {
    const { getByText } = await renderPage();

    await fireEvent.click(
      getByText("Daftar"),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Semua field wajib diisi",
    );

    expect(
      signUpMock,
    ).not.toHaveBeenCalled();
  });

  it("shows an error when passwords do not match", async () => {
    const {
      getByPlaceholderText,
      getByText,
    } = await renderPage();

    await fireEvent.update(
      getByPlaceholderText("Nama"),
      "Budi",
    );

    await fireEvent.update(
      getByPlaceholderText("Email"),
      "budi@example.com",
    );

    await fireEvent.update(
      getByPlaceholderText("Password"),
      "password123",
    );

    await fireEvent.update(
      getByPlaceholderText("Ulangi Password"),
      "password456",
    );

    await fireEvent.click(
      getByText("Daftar"),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Password tidak sama",
    );

    expect(
      signUpMock,
    ).not.toHaveBeenCalled();
  });

  it("registers successfully and redirects to login", async () => {
    signUpMock.mockResolvedValue({
      success: true,
    });

    showSuccessDialogMock.mockResolvedValue();

    const {
      getByPlaceholderText,
      getByText,
      router,
    } = await renderPage();

    await fireEvent.update(
      getByPlaceholderText("Nama"),
      "Budi",
    );

    await fireEvent.update(
      getByPlaceholderText("Email"),
      "budi@example.com",
    );

    await fireEvent.update(
      getByPlaceholderText("Password"),
      "password123",
    );

    await fireEvent.update(
      getByPlaceholderText("Ulangi Password"),
      "password123",
    );

    await fireEvent.click(
      getByText("Daftar"),
    );

    expect(
      signUpMock,
    ).toHaveBeenCalledWith(
      "budi@example.com",
      "password123",
      "Budi",
    );

    expect(
      showSuccessDialogMock,
    ).toHaveBeenCalledWith(
      "Registrasi berhasil",
    );

    await new Promise(
      (resolve) => setTimeout(resolve, 0),
    );

    expect(
      router.currentRoute.value.path,
    ).toBe("/auth/login");
  });

  it("shows the error message when registration fails", async () => {
    const error = new Error(
      "Email sudah digunakan",
    );

    signUpMock.mockRejectedValue(error);

    const {
      getByPlaceholderText,
      getByText,
    } = await renderPage();

    await fireEvent.update(
      getByPlaceholderText("Nama"),
      "Budi",
    );

    await fireEvent.update(
      getByPlaceholderText("Email"),
      "budi@example.com",
    );

    await fireEvent.update(
      getByPlaceholderText("Password"),
      "password123",
    );

    await fireEvent.update(
      getByPlaceholderText("Ulangi Password"),
      "password123",
    );

    await fireEvent.click(
      getByText("Daftar"),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Email sudah digunakan",
    );
  });

  it("handles registration failure with an empty error message", async () => {
    const error = new Error("");

    signUpMock.mockRejectedValue(error);

    const {
      getByPlaceholderText,
      getByText,
    } = await renderPage();

    await fireEvent.update(
      getByPlaceholderText("Nama"),
      "Budi",
    );

    await fireEvent.update(
      getByPlaceholderText("Email"),
      "budi@example.com",
    );

    await fireEvent.update(
      getByPlaceholderText("Password"),
      "password123",
    );

    await fireEvent.update(
      getByPlaceholderText("Ulangi Password"),
      "password123",
    );

    await fireEvent.click(
      getByText("Daftar"),
    );

    expect(
      showErrorDialogMock,
    ).toHaveBeenCalledWith(
      "Registrasi gagal. Silakan coba lagi.",
    );
  });
});