/**
 * Axios instance — API Gateway client with auth + refresh interceptors.
 *
 * Token read strategy (request interceptor):
 *   1. Try Zustand store first (populated after initialize())
 *   2. Fall back to direct localStorage read (always synchronous)
 *
 * This dual strategy handles both:
 *   - Normal flow: store is hydrated, token available in memory
 *   - Edge case: store not yet set (shouldn't happen with new authStore,
 *     but kept as safety net)
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { refreshTokens } from '../services/authService';
import {
  useAuthStore,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../store/authStore';

// ─── Instance ───────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL ?? 'http://localhost:8080',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

// ─── Refresh state ─────────────────────────────────────────────────────────

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// ─── Request interceptor ───────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Strategy: store first, localStorage fallback
    // Both point to the same raw string (no wrapping by persist middleware)
    const token =
      useAuthStore.getState().accessToken ??
      localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('[apiClient] No access token found — request will likely 401');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    // ── 401 — attempt silent token refresh ────────────────────────
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, user } = useAuthStore.getState();
      const resolvedRefreshToken = refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!resolvedRefreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
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
        const response = await refreshTokens(resolvedRefreshToken, user?.email ?? '');
        useAuthStore.getState().setAccessToken(
          response.token,
          300
        );
        processQueue(null, response.token);
        originalRequest.headers.Authorization = `Bearer ${response.token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 ────────────────────────────────────────────────────────
    if (status === 403) {
      toast.error('Access denied — ADMIN role required.');
      return Promise.reject(error);
    }

    // ── 404 ────────────────────────────────────────────────────────
    if (status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(error);
    }

    // ── 422 — handled per-form ─────────────────────────────────────
    if (status === 422) {
      return Promise.reject(error);
    }

    // ── 5xx ────────────────────────────────────────────────────────
    if (status && status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }

    // ── Network error ──────────────────────────────────────────────
    if (!error.response) {
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;