export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";

let warnedMissingBase = false;

export function apiUrl(path: string) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  if (!base) return path;
  return `${base}${path}`;
}

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiFetch(input: string, init: RequestInit = {}) {
  if (
    !warnedMissingBase &&
    !API_BASE_URL &&
    typeof window !== "undefined" &&
    window.location &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    input.startsWith("/api/")
  ) {
    warnedMissingBase = true;
    console.warn(
      "[CampusConnect] VITE_API_BASE_URL is not set. API requests like",
      input,
      "will be sent to the frontend origin. Set VITE_API_BASE_URL to your backend URL and redeploy."
    );
  }

  const headers = new Headers(init.headers || undefined);
  const authHeaders = getAuthHeaders();
  for (const [key, value] of Object.entries(authHeaders)) {
    if (!headers.has(key)) headers.set(key, value);
  }

  return fetch(apiUrl(input), { ...init, headers });
}
