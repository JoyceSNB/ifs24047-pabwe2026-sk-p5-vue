import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useUsersStore } from "./usersStore";
import * as userApi from "../api/userApi";

vi.mock("../api/userApi");
const ok = (data) => ({ status: "success", message: "ok", data });
const fail = { status: "fail", message: "gagal", data: { field: { name: ["x"] } } };

describe("usersStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("fetchUsers sukses dan gagal", async () => {
    const store = useUsersStore();
    userApi.getUsers.mockResolvedValue(ok({ users: [{ id: 1 }] }));
    await store.fetchUsers();
    expect(store.users).toEqual([{ id: 1 }]);
    userApi.getUsers.mockResolvedValue(fail);
    await store.fetchUsers();
    expect(store.users).toEqual([{ id: 1 }]);
    expect(store.message).toBe("gagal");
    expect(store.isUsers).toBe(false);
  });

  it("fetchProfile mengisi profile dan user", async () => {
    const store = useUsersStore();
    userApi.getMe.mockResolvedValue(ok({ user: { id: 2 } }));
    await store.fetchProfile();
    expect(store.profile).toEqual({ id: 2 });
    expect(store.user).toEqual({ id: 2 });
    userApi.getMe.mockResolvedValue(fail);
    await store.fetchProfile();
    expect(store.profile).toEqual({ id: 2 });
    expect(store.isProfile).toBe(false);
  });

  it("changeProfile", async () => {
    const store = useUsersStore();
    userApi.updateMe.mockResolvedValue(ok({ user: { id: 2, name: "Baru" } }));
    expect(await store.changeProfile("Baru", "e")).toBe(true);
    expect(store.profile.name).toBe("Baru");
    expect(store.isProfileChanged).toBe(true);
    userApi.updateMe.mockResolvedValue(fail);
    expect(await store.changeProfile("x", "e")).toBe(false);
    expect(store.isProfileChanged).toBe(false);
    expect(store.isProfileChange).toBe(false);
  });

  it("changePhoto memuat ulang profil saat sukses", async () => {
    const store = useUsersStore();
    userApi.updatePhoto.mockResolvedValue({ status: "success", message: "foto" });
    userApi.getMe.mockResolvedValue(ok({ user: { id: 3 } }));
    expect(await store.changePhoto(new File(["x"], "a.png"))).toBe(true);
    expect(store.profile).toEqual({ id: 3 });
    userApi.getMe.mockClear();
    userApi.updatePhoto.mockResolvedValue(fail);
    expect(await store.changePhoto(new File(["x"], "a.png"))).toBe(false);
    expect(userApi.getMe).not.toHaveBeenCalled();
    expect(store.isPhotoChange).toBe(false);
  });

  it("changePassword", async () => {
    const store = useUsersStore();
    userApi.changePassword.mockResolvedValue({ status: "success", message: "ok" });
    expect(await store.changePassword("a", "b", "b")).toBe(true);
    userApi.changePassword.mockResolvedValue(fail);
    expect(await store.changePassword("a", "b", "b")).toBe(false);
    expect(store.isPasswordChange).toBe(false);
  });
});
