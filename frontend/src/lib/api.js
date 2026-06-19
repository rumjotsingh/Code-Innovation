export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://code-innovation.onrender.com";

export function apiUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
