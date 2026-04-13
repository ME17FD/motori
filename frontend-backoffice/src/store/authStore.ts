import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, JwtPayload } from '../types/auth';
import { decodeToken, logout as clearToken } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (accessToken, refreshToken) => {
        const payload = decodeToken<JwtPayload>(accessToken);
        if (!payload) return;

        /**
         * Keycloak realm roles for motori_realm are:
         * "ADMIN", "USER", "SUPERADMIN" — no "ROLE_" prefix.
         */
        const roles = payload.realm_access?.roles ?? [];

        const user: AuthUser = {
          username:    payload.preferred_username,
          email:       payload.email,
          roles,
          token:       accessToken,
          refreshToken,
          expiresAt:   payload.exp * 1000,
        };

        set({
          user,
          isAuthenticated: true,
          /** Admin check — matches "ADMIN" or "SUPERADMIN" role */
          isAdmin: roles.includes('ADMIN') || roles.includes('SUPERADMIN'),
        });
      },

      clearAuth: () => {
        clearToken();
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: 'motori-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state?.user) return;
        const expired = state.user.expiresAt < Date.now();
        if (expired) {
          clearToken();
          state.user            = null;
          state.isAuthenticated = false;
          state.isAdmin         = false;
        } else {
          state.isAuthenticated = true;
          state.isAdmin = (
            state.user.roles.includes('ADMIN') ||
            state.user.roles.includes('SUPERADMIN')
          );
        }
      },
    },
  ),
);