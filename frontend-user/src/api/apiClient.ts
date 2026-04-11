import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from "axios";
import type { RefreshResponse } from "../types/auth";
import { API_BASE_URL, API_TIMEOUT_MS } from "../config/env";

// ─── Token store (in-memory; cookie handles refresh) ─────────────────────────

let accessToken: string | null = null;

/** Persists the JWT used by the request interceptor (memory only). */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/** Clears the in-memory token (e.g. logout or failed refresh). */
export const clearAccessToken = (): void => {
  accessToken = null;
};

/** Returns the current access token, or null if unset. */
export const getAccessToken = (): string | null => accessToken;

// ─── Refresh queue ───────────────────────────────────────────────────────────

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

const dispatchLogout = (): void => {
  clearAccessToken();
  window.dispatchEvent(new Event("auth:logout"));
};

// ─── Axios gateway instance ─────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || "http://localhost:8080",
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const handleRefresh = async (originalRequest: RetryableRequest): Promise<AxiosResponse> => {
  if (isRefreshing) {
    const token = await enqueue();
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return apiClient(originalRequest);
  }

  isRefreshing = true;
  originalRequest._retry = true;

  try {
    const { data } = await apiClient.post<RefreshResponse>("/auth/refresh");
    const newToken = data.accessToken;
    setAccessToken(newToken);
    flushQueue(null, newToken);
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  } catch (err) {
    const axiosErr = axios.isAxiosError(err) ? err : new axios.AxiosError("Refresh failed");
    flushQueue(axiosErr, null);
    dispatchLogout();
    return Promise.reject(axiosErr);
  } finally {
    isRefreshing = false;
  }
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryableRequest | undefined;
    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest?._retry === true;
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh");

    if (!is401 || alreadyRetried || isRefreshEndpoint || !originalRequest) {
      return Promise.reject(error);
    }

    return handleRefresh(originalRequest);
  }
);

export default apiClient;
