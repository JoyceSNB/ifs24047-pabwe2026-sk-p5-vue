const TOKEN_KEY = "delcom_auction_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Wrapper fetch untuk REST API Delcom.
 * Selalu mengembalikan objek { status, message, data } (tidak melempar error).
 */
export async function apiRequest(
  path,
  { method = "GET", body, formData, params } = {}
) {
  const query = new URLSearchParams(params).toString();
  const url = `${DELCOM_BASEURL}${path}${query ? `?${query}` : ""}`;

  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (formData) {
    options.body = formData;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    return await response.json();
  } catch {
    return {
      status: "error",
      message: "Tidak dapat terhubung ke server. Periksa koneksi internet kamu.",
    };
  }
}
