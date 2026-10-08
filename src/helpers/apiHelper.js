export const TOKEN_KEY =
  "delcom_access_token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  if (token) {
    localStorage.setItem(
      TOKEN_KEY,
      token,
    );
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch(
  path,
  {
    method = "GET",
    body,
    query,
    headers = {},
  } = {},
) {
  const url = new URL(
    `${DELCOM_BASEURL}${path}`,
  );

  Object.entries(query || {}).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        url.searchParams.set(
          key,
          value,
        );
      }
    },
  );

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const token = getAccessToken();

  if (token) {
    requestHeaders.Authorization =
      `Bearer ${token}`;
  }

  const init = {
    method,
    headers: requestHeaders,
  };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] =
      "application/json";

    init.body = JSON.stringify(body);
  }

  const response = await fetch(
    url,
    init,
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error("API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      url: url.toString(),
      response: data,
    });

    const message =
      data?.message ||
      data?.errors?.[0]?.message ||
      `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}