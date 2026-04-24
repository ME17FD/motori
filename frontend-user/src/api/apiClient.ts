/**
 * Fetch-based API Client
 * Provides a lightweight HTTP client with JWT token injection.
 * Alternative to Axios - used for generic REST calls with Bearer token authentication.
 */

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "https://backofficemotori.me-fd.com/api";

/**
 * Retrieves the stored JWT token from localStorage.
 */
const getToken = (): string | null => localStorage.getItem("token");

/**
 * Generic fetch wrapper with automatic JWT injection.
 * @template T - Response data type
 * @param endpoint - API endpoint (e.g., '/api/products')
 * @param options - RequestInit options (method, headers, body, etc.)
 * @returns Promise resolving to typed response or null for 204 No Content
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
};