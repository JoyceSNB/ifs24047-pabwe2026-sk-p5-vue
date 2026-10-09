import { apiRequest } from "../../../helpers/apiHelper";

export const getUsers = () => apiRequest("/users");

export const getMe = () => apiRequest("/users/me");

export const updateMe = (name, email) =>
  apiRequest("/users/me", { method: "PUT", body: { name, email } });

export const updatePhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiRequest("/users/me/photo", { method: "POST", formData });
};

export const changePassword = (password, newPassword, confirmation) =>
  apiRequest("/users/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: confirmation,
    },
  });
