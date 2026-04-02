/**
 * Centralized Vite environment values used by the client app.
 * Configure `VITE_API_URL` in `.env` / deployment; behavior matches the previous inline default.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/** Default Axios request timeout (ms) for gateway calls. */
export const API_TIMEOUT_MS = 30_000;
