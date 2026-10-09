import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as userApi from "../api/userApi";
import { useUsersStore } from "../states/usersStore";
import Swal from "sweetalert2";

vi.mock("../api/userApi");
const profile = { id: 1, name: "Budi", email: "b@x.id", photo: "img/b.png" };
const render = (extra = {}) => renderWithProviders(ProfilePage, { state: { users: { profile } }, ...extra });
const formOf = (wrapper, title) =>
  wrapper.findAll("form").find((f) => f.find("h2").text() === title);
const pick = async (wrapper, file) => {
  const input = wrapper.find("#profile-photo");
  Object.defineProperty(input.element, "files", { value: file ? [file] : [], configurable: true });
  await input.trigger("change");
};

describe("ProfilePage", () => {
  it("mengisi form dengan profil aktif dan menampilkan foto", async () => {
    const { wrapper } = await render();
    expect(wrapper.find("#profile-name").element.value).toBe("Budi");
    expect(wrapper.find("#profile-email").element.value).toBe("b@x.id");
    expect(wrapper.find('img[alt="Foto profil saat ini"]').exists()).toBe(true);
  });

  it("mengisi form saat profil baru dimuat setelah render", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(wrapper.find("#profile-name").element.value).toBe("");
    expect(wrapper.find('img[alt="Foto profil saat ini"]').exists()).toBe(false);
    useUsersStore().profile = { id: 2, name: "Siti", email: "s@x.id" };
    await flushPromises();
    expect(wrapper.find("#profile-name").element.value).toBe("Siti");
  });

  it("validasi, gagal, dan sukses memperbarui profil", async () => {
    const { wrapper } = await render();
    const form = formOf(wrapper, "Data akun");
    await wrapper.find("#profile-name").setValue("");
    await wrapper.find("#profile-email").setValue("");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Nama wajib diisi.");
    expect(wrapper.text()).toContain("Email wajib diisi.");
    expect(userApi.updateMe).not.toHaveBeenCalled();

    await wrapper.find("#profile-name").setValue(" Baru ");
    await wrapper.find("#profile-email").setValue("n@x.id");
    userApi.updateMe.mockResolvedValue({ status: "fail", message: "Email dipakai" });
    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "error", text: "Email dipakai" }));

    userApi.updateMe.mockResolvedValue({ status: "success", message: "Tersimpan", data: { user: { ...profile, name: "Baru" } } });
    await form.trigger("submit");
    await flushPromises();
    expect(userApi.updateMe).toHaveBeenLastCalledWith("Baru", "n@x.id");
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ icon: "success" }));
  });

  it("unggah foto: tanpa file, tanpa pilihan, gagal, dan sukses", async () => {
    const { wrapper } = await render();
    const form = formOf(wrapper, "Foto profil");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Pilih foto terlebih dahulu.");
    await pick(wrapper, null);

    const file = new File(["x"], "f.png", { type: "image/png" });
    await pick(wrapper, file);
    expect(wrapper.text()).not.toContain("Pilih foto terlebih dahulu.");
    userApi.updatePhoto.mockResolvedValue({ status: "fail", message: "Foto gagal" });
    await form.trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: "Foto gagal" }));

    userApi.updatePhoto.mockResolvedValue({ status: "success", message: "Foto ok" });
    userApi.getMe.mockResolvedValue({ status: "success", message: "ok", data: { user: profile } });
    await form.trigger("submit");
    await flushPromises();
    expect(userApi.updatePhoto).toHaveBeenLastCalledWith(file);
    expect(userApi.getMe).toHaveBeenCalled();
  });

  it("ganti kata sandi: validasi, gagal, dan sukses mengosongkan form", async () => {
    const { wrapper } = await render();
    const form = formOf(wrapper, "Ganti kata sandi");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Kata sandi saat ini wajib diisi.");
    expect(wrapper.text()).toContain("Kata sandi baru minimal 6 karakter.");
    await wrapper.find("#password-new").setValue("abcdef");
    await wrapper.find("#password-confirmation").setValue("zzzzzz");
    await form.trigger("submit");
    expect(wrapper.text()).toContain("Konfirmasi tidak sama.");
    expect(userApi.changePassword).not.toHaveBeenCalled();

    await wrapper.find("#password-current").setValue("lama123");
    await wrapper.find("#password-confirmation").setValue("abcdef");
    userApi.changePassword.mockResolvedValue({ status: "fail", message: "Sandi salah" });
    await form.trigger("submit");
    await flushPromises();
    expect(wrapper.find("#password-current").element.value).toBe("lama123");

    userApi.changePassword.mockResolvedValue({ status: "success", message: "Sandi diganti" });
    await form.trigger("submit");
    await flushPromises();
    expect(userApi.changePassword).toHaveBeenLastCalledWith("lama123", "abcdef", "abcdef");
    expect(wrapper.find("#password-current").element.value).toBe("");
    expect(wrapper.find("#password-new").element.value).toBe("");
  });

  it("label loading pada setiap tombol", async () => {
    const { wrapper } = await render({
      state: { users: { profile, isPhotoChange: true, isProfileChange: true, isPasswordChange: true } },
    });
    const labels = wrapper.findAll('button[type="submit"]').map((b) => b.text());
    expect(labels).toEqual(["Mengunggah...", "Menyimpan...", "Menyimpan..."]);
  });
});
