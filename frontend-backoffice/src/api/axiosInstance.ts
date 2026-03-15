import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Base URL points to the API Gateway.
 * Override via VITE_API_BASE_URL in .env files.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/** Storage key for the JWT in localStorage. */
export const TOKEN_KEY = 'motori_token';

/**
 * Singleton Axios instance shared across all service modules.
 * - Automatically attaches Bearer token to every request.
 * - On 401, clears auth state and redirects to /login.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

/* ── Request interceptor: inject JWT ── */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/* ── Response interceptor: handle 401 globally ── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Hard redirect — avoids stale React state after session expiry.
      window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;