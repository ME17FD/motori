/**
 * Auth store — Zustand store with MANUAL localStorage persistence.
 *
 * Why not Zustand persist middleware:
 *   The persist middleware wraps state under {"state": {...}} in localStorage,
 *   making it impossible to read the raw token directly via localStorage.getItem().
 *   The Axios interceptor needs synchronous, direct localStorage access to attach
 *   the Bearer token before Zustand's async rehydration completes.
 *
 *   Solution: manage localStorage manually in each action, using flat keys.
 *   This guarantees the interceptor can always read the token synchronously.
 *
 * Storage keys (flat, directly readable):
 *   motori_access_token  — raw JWT access token string
 *   motori_refresh_token — raw JWT refresh token string
 *   motori_expires_at    — expiry timestamp in ms (string)
 */

import { create } from 'zustand';
import type { AuthState, AuthUser, KeycloakTokenPayload } from '../types/auth';

// ─── Storage keys — exported for use in axiosInstance ─────────────────────

export const ACCESS_TOKEN_KEY  = 'motori_access_token';
export const REFRESH_TOKEN_KEY = 'motori_refresh_token';
export const EXPIRES_AT_KEY    = 'motori_expires_at';

// ─── JWT utilities ─────────────────────────────────────────────────────────

function decodeJwt(token: string): KeycloakTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad base64 if needed
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded)) as KeycloakTokenPayload;
  } catch (e) {
    console.error('[authStore] JWT decode failed:', e);
    return null;
  }
}

function payloadToUser(payload: KeycloakTokenPayload): AuthUser {
  return {
    id:            payload.sub ,
    username:      payload.preferred_username,
    email:         payload.email         ?? '',
    firstName:     payload.given_name    ?? '',
    lastName:      payload.family_name   ?? '',
    fullName:      payload.name          ?? payload.preferred_username,
    phone:         payload.phone         ?? '',
    adress:        payload.adress        ?? '',
    roles:         payload.realm_access?.roles ?? [],
    emailVerified: payload.email_verified ?? false,
  };
}

// ─── Store interface ───────────────────────────────────────────────────────

interface AuthStore extends AuthState {
  /**
   * Synchronously hydrate the store from localStorage.
   * Call once at app startup before the first render.
   */
  initialize:     () => void;
  /**
   * Persist both tokens and derive user from the access token JWT.
   * Writes directly to localStorage for immediate interceptor access.
   */
  setTokens:      (accessToken: string, refreshToken: string, expiresIn: number) => void;
  /**
   * Replace only the access token (called on silent refresh).
   */
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  /**
   * Clear all auth state and remove tokens from localStorage.
   */
  clearAuth:      () => void;
  hasRole:        (role: string) => boolean;
  isTokenExpired: () => boolean;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // ── Initial state ────────────────────────────────────────────────────
  accessToken:     null,
  refreshToken:    null,
  user:            null,
  isAuthenticated: false,
  isLoading:       false,
  expiresAt:       null,

  // ── Actions ──────────────────────────────────────────────────────────

  initialize() {
    const accessToken  = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);

    if (!accessToken || !refreshToken) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    const payload = decodeJwt(accessToken);
    if (!payload) {
      // Malformed token — wipe storage
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    const expiresAt = expiresAtStr
      ? parseInt(expiresAtStr, 10)
      : payload.exp * 1000;

    set({
      accessToken,
      refreshToken,
      user:            payloadToUser(payload),
      isAuthenticated: true,
      expiresAt,
      isLoading:       false,
    });
  },

  setTokens(accessToken, refreshToken, expiresIn) {
    const payload = decodeJwt(accessToken);
    if (!payload) {
      console.error('[authStore] setTokens: invalid JWT');
      return;
    }

    const expiresAt = Date.now() + expiresIn * 1000;

    // Write directly — the Axios interceptor reads these synchronously
    localStorage.setItem(ACCESS_TOKEN_KEY,  accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRES_AT_KEY,    String(expiresAt));

    set({
      accessToken,
      refreshToken,
      user:            payloadToUser(payload),
      isAuthenticated: true,
      expiresAt,
      isLoading:       false,
    });
  },

  setAccessToken(accessToken, expiresIn) {
    const payload = decodeJwt(accessToken);
    if (!payload) {
      console.error('[authStore] setAccessToken: invalid JWT');
      return;
    }

    const expiresAt = Date.now() + expiresIn * 1000;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(EXPIRES_AT_KEY,   String(expiresAt));

    set((state) => ({
      ...state,
      accessToken,
      user:            payloadToUser(payload),
      expiresAt,
      isAuthenticated: true,
    }));
  },

  clearAuth() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);

    set({
      accessToken:     null,
      refreshToken:    null,
      user:            null,
      isAuthenticated: false,
      expiresAt:       null,
      isLoading:       false,
    });
  },

  hasRole(role) {
    return get().user?.roles.includes(role) ?? false;
  },

  isTokenExpired() {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return Date.now() >= expiresAt - 10_000;
  },
}));

// ─── Selectors ─────────────────────────────────────────────────────────────

export const selectIsAdmin = (state: AuthStore): boolean =>
  state.user?.roles.some((r) => r === 'ADMIN' || r === 'SUPERADMIN') ?? false;

export const selectUser        = (state: AuthStore) => state.user;
export const selectAccessToken = (state: AuthStore) => state.accessToken;