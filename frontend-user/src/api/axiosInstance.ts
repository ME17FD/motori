// api/axios.ts
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';
import type { RefreshResponse } from '../types/auth';

// ─── Token Store ────────────────────────────────────────────────────────────

let accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};

export const getAccessToken = (): string | null => accessToken;

// ─── Queue ───────────────────────────────────────────────────────────────────

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

const enqueue = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    queue.push({ resolve, reject });
  });

const flushQueue = (error: AxiosError | null, token: string | null): void => {
  queue.forEach(({ resolve, reject }) => {
    if (error !== null) reject(error);
    else if (token !== null) resolve(token);
  });
  queue = [];
};

// ─── Logout Event ────────────────────────────────────────────────────────────

const dispatchLogout = (): void => {
  clearAccessToken();
  window.dispatchEvent(new Event('auth:logout'));
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const handleRefresh = async (
  originalRequest: RetryableRequest
): Promise<AxiosResponse> => {
  if (isRefreshing) {
    const token = await enqueue();
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    const { data } = await api.post<RefreshResponse>('/auth/refresh');
    const newToken = data.accessToken;

    setAccessToken(newToken);
    flushQueue(null, newToken);

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  } catch (err) {
    const axiosErr = axios.isAxiosError(err)
      ? err
      : new axios.AxiosError('Refresh failed');

    flushQueue(axiosErr, null);
    dispatchLogout();

    return Promise.reject(axiosErr);
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryableRequest | undefined;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest?._retry === true;
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');

    if (!is401 || alreadyRetried || isRefreshEndpoint || !originalRequest) {
      return Promise.reject(error);
    }

    return handleRefresh(originalRequest);
  }
);

export default api;