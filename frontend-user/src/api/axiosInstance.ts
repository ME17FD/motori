/**
 * Re-export of the centralized gateway client (legacy path `api/axiosInstance`).
 * Prefer `import apiClient from "@/api/apiClient"` in new code.
 */
export { default } from "./apiClient";
export { setAccessToken, clearAccessToken, getAccessToken } from "./apiClient";
