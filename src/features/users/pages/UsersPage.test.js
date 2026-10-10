import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../api/userApi";

vi.mock("../api/userApi");

describe("UsersPage", () => {
  it("menampilkan status memuat", async () => {
    userApi.getUsers.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.find("output").text()).toMatch(/Memuat/);
  });

  it("menampilkan status kosong", async () => {
    userApi.getUsers.mockResolvedValue({ status: "success", message: "ok", data: { users: [] } });
    const { wrapper } = await renderWithProviders(UsersPage);
    await flushPromises();
    expect(wrapper.text()).toContain("Belum ada pengguna.");
  });

  it("menampilkan daftar pengguna dengan foto atau inisial", async () => {
    userApi.getUsers.mockResolvedValue({
      status: "success",
      message: "ok",
      data: { users: [
        { id: 1, name: "Budi", email: "b@x.id", photo: "img/b.png" },
        { id: 2, name: "Siti", email: "s@x.id", photo: null },
      ] },
    });
    const { wrapper } = await renderWithProviders(UsersPage);
    await flushPromises();
    const items = wrapper.findAll('[data-testid="user-list"] li');
    expect(items).toHaveLength(2);
    expect(items[0].find("img").attributes("src")).toBe("https://open-api.delcom.org/img/b.png");
    expect(items[1].find("img").exists()).toBe(false);
    expect(items[1].text()).toContain("S");
    expect(items[1].text()).toContain("s@x.id");
  });
});
