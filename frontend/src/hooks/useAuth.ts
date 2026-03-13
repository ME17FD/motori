import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';
import type { LoginRequest, AuthResponse } from '../types/auth';


/**
 * Provides login/logout actions and current auth state.
 *
 * Usage:
 *   const { loginMutation, logout, isAdmin } = useAuth();
 *   loginMutation.mutate({ email, password });
 */
export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user, isAuthenticated, isAdmin } = useAuthStore();

  const loginMutation = useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.refreshToken);
      navigate(ROUTES.DASHBOARD);
    },
  });

  const logout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return {
    loginMutation,
    logout,
    user,
    isAuthenticated,
    isAdmin,
  };
}