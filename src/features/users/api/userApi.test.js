import { describe, expect, it, vi } from "vitest";
import { changePassword, getMe, getUsers, updateMe, updatePhoto } from "./userApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn(async () => ({ status: "success" })) }));

describe("userApi", () => {
  it("getUsers dan getMe", async () => {
    await getUsers();
    expect(apiRequest).toHaveBeenCalledWith("/users");
    await getMe();
    expect(apiRequest).toHaveBeenCalledWith("/users/me");
  });

  it("updateMe memakai PUT /users/me", async () => {
    await updateMe("N", "e@x.id");
    expect(apiRequest).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "N", email: "e@x.id" } });
  });

  it("updatePhoto mengirim FormData berisi photo", async () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    await updatePhoto(file);
    const [path, options] = apiRequest.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBeInstanceOf(File);
  });

  it("changePassword mengirim field sesuai dokumentasi API", async () => {
    await changePassword("lama", "baru1", "baru1");
    expect(apiRequest).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru1", new_password_confirmation: "baru1" },
    });
  });
});
