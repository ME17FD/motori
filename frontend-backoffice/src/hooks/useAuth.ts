/**
 * useAuth hook — primary interface for auth operations in React components.
 *
 * Wraps the Zustand auth store and the auth service to expose:
 *   - login / logout with loading and error state
 *   - Role-based access helpers (isAdmin, isSuperAdmin)
 *   - Reactive user / isAuthenticated state
 *
 * Role enforcement on login:
 *   After receiving tokens, the hook verifies the decoded JWT contains
 *   ADMIN or SUPERADMIN before completing the login flow. Users without
 *   these roles have their tokens immediately cleared.
 *
 * Usage:
 *   const { login, logout, user, isAdmin, isLoading, error } = useAuth();
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore, selectIsAdmin, selectUser } from '../store/authStore';
import {
  login as keycloakLogin,
  logout as keycloakLogout,
  isAuthError,
} from '../services/authService';
import type { LoginCredentials, AuthUser } from '../types/auth';

// ─── Return type ───────────────────────────────────────────────────────────

interface UseAuthReturn {
  /** Normalized user derived from the Keycloak JWT, or null when unauthenticated */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True when the user holds the ADMIN or SUPERADMIN realm role */
  isAdmin: boolean;
  /** True when the user holds the SUPERADMIN realm role */
  isSuperAdmin: boolean;
  /** True while a login or logout network request is in flight */
  isLoading: boolean;
  /** Human-readable error message from the last failed login attempt */
  error: string | null;
  /** Clear the error state (useful when the user starts typing again) */
  clearError: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Zustand store bindings
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setTokens, clearAuth, hasRole } = useAuthStore();
  const user       = useAuthStore(selectUser);
  const isAdmin    = useAuthStore(selectIsAdmin);
  const isSuperAdmin = hasRole('SUPERADMIN');

  // ── Actions ──────────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  /**
   * Authenticates the user against Keycloak (ROPC flow) and stores tokens.
   *
   * Steps:
   *   1. Call Keycloak token endpoint with username/password
   *   2. Store tokens in Zustand (which decodes the JWT to derive AuthUser)
   *   3. Verify the decoded user holds ADMIN or SUPERADMIN
   *   4. On role failure: clear tokens and show an access-denied message
   *   5. On success: show welcome toast and redirect to /dashboard
   *
   * @param credentials - { username, password }
   */
  const login = useCallback(
  async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenResponse = await keycloakLogin(credentials);

      // user-service returns `token` not `access_token`, no expires_in
      // decode JWT to get expiry from the token itself
      setTokens(
        tokenResponse.token,
        tokenResponse.refreshToken,
        300  // fallback — decoded from JWT exp in setTokens anyway
      );

      const { user: storedUser } = useAuthStore.getState();
      const hasAdminAccess =
        storedUser?.roles.includes('ADMIN') ||
        storedUser?.roles.includes('SUPERADMIN');

      if (!hasAdminAccess) {
        clearAuth();
        setError('Access denied. Your account does not have backoffice access.');
        return;
      }

      const displayName = storedUser?.firstName || storedUser?.username;
      toast.success(`Welcome back, ${displayName}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
        console.error('[useAuth] Unexpected login error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  },
  [setTokens, clearAuth, navigate]
);

  /**
   * Logs out the user.
   *
   * Steps:
   *   1. Revoke the Keycloak session (back-channel logout — fire and forget)
   *   2. Clear Zustand store and localStorage tokens
   *   3. Show info toast and redirect to /login
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const { refreshToken } = useAuthStore.getState();

      if (refreshToken) {
        // Best-effort server-side session revocation
        await keycloakLogout(refreshToken);
      }
    } catch {
      // Swallow — local state is cleared regardless
      console.warn('[useAuth] Logout request failed — clearing local state anyway.');
    } finally {
      clearAuth();
      setIsLoading(false);
      toast.info('You have been logged out.');
      navigate('/login', { replace: true });
    }
  }, [clearAuth, navigate]);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isLoading,
    error,
    clearError,
    login,
    logout,
  };
}