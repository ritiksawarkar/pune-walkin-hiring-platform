/**
 * Centralized API Client for Spring Boot Backend Integration
 * Handles JWT Authorization headers, query parameters, and uniform error extraction.
 */

const TOKEN_KEY = "punewalkin_auth_token";

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn("Storage error for auth token", err);
  }
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn("Storage error removing auth token", err);
  }
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new Error(
      "Cannot connect to the server. Please ensure the backend is running at http://localhost:8080."
    );
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = { message: await response.text() };
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && data.message) ||
      (data && data.error) ||
      `HTTP Error ${response.status}: ${response.statusText}`;

    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.code || "ERROR";
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (url, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return request(fullUrl, { method: "GET" });
  },

  post: (url, body) =>
    request(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (url, body) =>
    request(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (url, body) =>
    request(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (url) => request(url, { method: "DELETE" }),
};
