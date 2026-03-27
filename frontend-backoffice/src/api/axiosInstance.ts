/**
 * Axios instance for the API Gateway.
 *
 * Request interceptor  — attaches the Bearer token from Zustand store
 * Response interceptor — handles token refresh (401) and authorization errors (403)
 *
 * Refresh flow:
 *   1. A 401 is received
 *   2. The interceptor calls refreshTokens() with the stored refresh token
 *   3. On success: update tokens in store, replay the original request
 *   4. On failure: clear store and redirect to /login
 *
 * Concurrent refresh prevention:
 *   A single refresh promise is shared across all queued 401 requests.
 *   Queued requests are replayed once the new token is available.
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { refreshTokens } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ─── Instance ───────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Refresh state ─────────────────────────────────────────────────────────

/** Prevents multiple simultaneous refresh calls */
let isRefreshing = false;

/** Queue of request resolvers waiting for a fresh token */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

// ─── Request interceptor ───────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // ── 401 Unauthorized — attempt token refresh ───────────────────────
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await refreshTokens(refreshToken);
        setAccessToken(response.access_token, response.expires_in);
        processQueue(null, response.access_token);
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 Forbidden — insufficient permissions ───────────────────────
    if (status === 403) {
      toast.error('Access denied — ADMIN role required.');
      return Promise.reject(error);
    }

    // ── 404 Not found ──────────────────────────────────────────────────
    if (status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(error);
    }

    // ── 422 Validation error — handled per-form, not globally ──────────
    if (status === 422) {
      return Promise.reject(error);
    }

    // ── 500+ Server errors ─────────────────────────────────────────────
    if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // ── Network error (no response) ────────────────────────────────────
    if (!error.response) {
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;