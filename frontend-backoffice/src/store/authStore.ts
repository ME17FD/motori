/**
 * Auth store — Zustand-based authentication state manager.
 *
 * Responsibilities:
 * - Persist access/refresh tokens to localStorage
 * - Derive and store the normalized AuthUser from JWT payload
 * - Expose selectors for role checks (isAdmin, isSuperAdmin)
 * - Handle token clearing on logout or 401
 *
 * Storage keys:
 *   motori_access_token   — Keycloak access token (JWT)
 *   motori_refresh_token  — Keycloak refresh token
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, AuthUser, KeycloakTokenPayload } from '../types/auth';

// ─── Storage key constants ─────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'motori_access_token';
const REFRESH_TOKEN_KEY = 'motori_refresh_token';

// ─── JWT utilities ─────────────────────────────────────────────────────────

/**
 * Decodes a JWT without verifying its signature.
 * Signature verification is handled server-side by Spring Security.
 */
function decodeJwt(token: string): KeycloakTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64url → Base64 → decode
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload);
    return JSON.parse(json) as KeycloakTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Maps a raw Keycloak token payload to a normalized AuthUser.
 * Falls back gracefully when optional claims are missing.
 */
function payloadToUser(payload: KeycloakTokenPayload): AuthUser {
  return {
    id: payload.sub,
    username: payload.preferred_username,
    email: payload.email ?? '',
    firstName: payload.given_name ?? '',
    lastName: payload.family_name ?? '',
    fullName: payload.name ?? payload.preferred_username,
    roles: payload.realm_access?.roles ?? [],
    emailVerified: payload.email_verified ?? false,
  };
}

// ─── Store definition ───────────────────────────────────────────────────────

interface AuthStore extends AuthState {
  /** Initialize store from existing localStorage tokens (called on app mount) */
  initialize: () => void;
  /** Persist tokens and derive user from the access token JWT */
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  /** Replace only the access token (used during silent refresh) */
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  /** Clear all auth state and remove tokens from localStorage */
  clearAuth: () => void;
  /** Convenience: check if the current user holds a given realm role */
  hasRole: (role: string) => boolean;
  /** True if the access token is expired (or missing) */
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      expiresAt: null,

      // ── Actions ────────────────────────────────────────────────────────

      initialize() {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        const payload = decodeJwt(accessToken);
        if (!payload) {
          // Malformed token — clear storage
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        const expiresAt = payload.exp * 1000; // Convert to ms
        const now = Date.now();

        if (now >= expiresAt) {
          // Access token expired — we still keep refresh token for silent refresh
          // The Axios interceptor will handle the refresh on the next API call
          set({
            accessToken,
            refreshToken,
            user: payloadToUser(payload),
            isAuthenticated: true, // Will be invalidated by interceptor if refresh fails
            expiresAt,
            isLoading: false,
          });
          return;
        }

        set({
          accessToken,
          refreshToken,
          user: payloadToUser(payload),
          isAuthenticated: true,
          expiresAt,
          isLoading: false,
        });
      },

      setTokens(accessToken, refreshToken, expiresIn) {
        const payload = decodeJwt(accessToken);
        if (!payload) {
          console.error('[AuthStore] setTokens: invalid JWT received');
          return;
        }

        const expiresAt = Date.now() + expiresIn * 1000;
        const user = payloadToUser(payload);

        // Persist to localStorage for hydration on next page load
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        set({ accessToken, refreshToken, user, isAuthenticated: true, expiresAt, isLoading: false });
      },

      setAccessToken(accessToken, expiresIn) {
        const payload = decodeJwt(accessToken);
        if (!payload) {
          console.error('[AuthStore] setAccessToken: invalid JWT received');
          return;
        }

        const expiresAt = Date.now() + expiresIn * 1000;
        const user = payloadToUser(payload);

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        set((state) => ({ ...state, accessToken, user, expiresAt, isAuthenticated: true }));
      },

      clearAuth() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          expiresAt: null,
          isLoading: false,
        });
      },

      hasRole(role) {
        return get().user?.roles.includes(role) ?? false;
      },

      isTokenExpired() {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        // Add 10s buffer to refresh slightly before actual expiry
        return Date.now() >= expiresAt - 10_000;
      },
    }),
    {
      name: 'motori-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist the tokens themselves — the rest is derived
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
);

// ─── Convenience selectors ─────────────────────────────────────────────────

/** Returns true only when the user holds the ADMIN or SUPERADMIN realm role */
export const selectIsAdmin = (state: AuthStore): boolean =>
  state.user?.roles.some((r) => r === 'ADMIN' || r === 'SUPERADMIN') ?? false;

export const selectUser = (state: AuthStore): AuthUser | null => state.user;
export const selectAccessToken = (state: AuthStore): string | null => state.accessToken;