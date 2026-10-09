import { apiRequest } from "../../../helpers/apiHelper";

export const login = (email, password) =>
  apiRequest("/auth/login", { method: "POST", body: { email, password } });

export const register = (name, email, password) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

export const logout = () => apiRequest("/auth/logout", { method: "POST" });
