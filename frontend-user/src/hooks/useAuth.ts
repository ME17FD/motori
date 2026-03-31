// hooks/useAuth.ts
import { useState, useCallback, useEffect } from 'react';
import authService from '../services/authService';
import parseError from '../utils/parseError';
import type { User } from '../types/user';
import type { LoginRequest, SignupRequest } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const useAuth = () => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  // ─── State helpers ────────────────────────────────────────────────────────

  const setLoading = (loading: boolean) =>
    setState((prev) => ({ ...prev, loading }));

  const setError = (error: unknown) =>
    setState((prev) => ({
      ...prev,
      loading: false,
      error: parseError(error),
    }));

  const setUser = (user: User) =>
    setState({ user, isAuthenticated: true, loading: false, error: null });

  const clearUser = () =>
    setState({ ...INITIAL_STATE });

  // ─── fetchUser ────────────────────────────────────────────────────────────

  const fetchUser = useCallback(async (): Promise<void> => {
    const user = await authService.getCurrentUser();
    setUser(user);
  }, []);

  // ─── login ────────────────────────────────────────────────────────────────

  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      const { user } = await authService.login(data);
      setUser(user);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  // ─── signup ───────────────────────────────────────────────────────────────

  const signup = useCallback(async (data: SignupRequest): Promise<void> => {
    setLoading(true);
    try {
      const { user } = await authService.signup(data);
      setUser(user);
    } catch (error) {
      setError(error);
      throw error;
    }
  }, []);

  // ─── logout ───────────────────────────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // clear state even if backend call fails
    } finally {
      clearUser();
    }
  }, []);

  // ─── Silent session restore on mount ─────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async (): Promise<void> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await fetchUser();
      } catch {
        try {
          await authService.refreshToken();
          if (cancelled) return;
          await fetchUser();
        } catch {
          if (cancelled) return;
          clearUser();
        }
      } finally {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    void restoreSession();

    return () => { cancelled = true; };
  }, [fetchUser]);

  // ─── Forced logout (refresh failure via interceptor) ─────────────────────

  useEffect(() => {
    const handleForcedLogout = () => clearUser();
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    fetchUser,
  } as const;
};

export default useAuth;