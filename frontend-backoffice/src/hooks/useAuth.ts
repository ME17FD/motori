import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, type KeycloakTokenResponse } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';

export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Provides login/logout actions and current auth state.
 * Login calls Keycloak directly — not through the gateway.
 */
export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth, user, isAuthenticated, isAdmin } = useAuthStore();

  const loginMutation = useMutation<KeycloakTokenResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.access_token, data.refresh_token);
      navigate(ROUTES.DASHBOARD);
    },
  });

  const logout = () => {
    clearAuth();
    navigate(ROUTES.LOGIN);
  };

  return { loginMutation, logout, user, isAuthenticated, isAdmin };
}