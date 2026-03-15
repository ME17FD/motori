import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, JwtPayload } from '../types/auth';
import { decodeToken, logout as clearToken } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

/**
 * Global authentication store persisted across page reloads.
 * Derived flags (isAuthenticated, isAdmin) are recomputed on setAuth
 * and on store hydration from localStorage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (token, refreshToken) => {
        const payload = decodeToken<JwtPayload>(token);
        if (!payload) return;

        const user: AuthUser = {
          email: payload.sub,
          roles: payload.roles,
          token,
          refreshToken,
          expiresAt: payload.exp * 1000,
        };

        set({
          user,
          isAuthenticated: true,
          isAdmin: payload.roles.includes('ROLE_ADMIN'),
        });
      },

      clearAuth: () => {
        clearToken();
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },
    }),
    {
      name: 'motori-auth',

      /**
       * Only persist the raw user object.
       * Derived flags are recomputed below on rehydration.
       */
      partialize: (state) => ({ user: state.user }),

      /**
       * After localStorage is read, recompute isAuthenticated and isAdmin.
       * onRehydrateStorage returns a callback that receives the rehydrated state.
       */
      onRehydrateStorage: () => (state) => {
        if (!state?.user) return;

        const expired = state.user.expiresAt < Date.now();

        if (expired) {
          clearToken();
          state.user = null;
          state.isAuthenticated = false;
          state.isAdmin = false;
        } else {
          state.isAuthenticated = true;
          state.isAdmin = state.user.roles.includes('ROLE_ADMIN');
        }
      },
    },
  ),
);