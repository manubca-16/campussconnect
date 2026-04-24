export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";

export function apiUrl(path: string) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${base}${path}`;
}

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || undefined);
  const authHeaders = getAuthHeaders();
  for (const [key, value] of Object.entries(authHeaders)) {
    if (!headers.has(key)) headers.set(key, value);
  }

  return fetch(apiUrl(input), { ...init, headers });
}
