import { apiFetch } from "../../../helpers/apiHelper";

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export function register(
  email,
  password,
  name,
) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
    },
  });
}