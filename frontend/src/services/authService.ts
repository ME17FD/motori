import axiosInstance, { TOKEN_KEY } from '../api/axiosInstance';
import type { AuthResponse, LoginRequest } from '../types/auth';

/**
 * Sends credentials to the gateway's auth endpoint.
 * Stores the returned JWT in localStorage on success.
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>(
    '/api/auth/login',
    credentials,
  );
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

/**
 * Clears the local token.
 * Call this before redirecting to /login.
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Returns the raw JWT string from localStorage, or null if absent.
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Decodes a JWT payload without verifying the signature.
 * Verification is handled server-side by the gateway.
 */
export function decodeToken<T>(token: string): T | null {
  try {
    const payloadB64 = token.split('.')[1];
    const decoded = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}