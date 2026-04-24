/**
 * Auth service
 *
 * All routes go through the API Gateway → user-service:
 *   POST /api/auth/login   → /auth/login   (JSON body: { email, password })
 *   POST /api/auth/refresh → /auth/refresh (form: refresh_token)
 *   POST /api/auth/logout  → /auth/logout  (form: refresh_token)
 */

import axios, { isAxiosError } from 'axios';
import type {
  LoginCredentials,
  AuthResponse,
  KeycloakErrorResponse,
  SignupRequest,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types/auth';
// ─── Configuration ───────────────────────────────────────────────────────────

const GATEWAY_BASE = import.meta.env.VITE_API_GATEWAY_URL ?? 'https://backofficemotori.me-fd.com';

const LOGIN_URL   = `${GATEWAY_BASE}/api/auth/login`;
const REFRESH_URL = `${GATEWAY_BASE}/api/auth/refresh`;
const LOGOUT_URL  = `${GATEWAY_BASE}/api/auth/logout`;

// ─── Axios client ────────────────────────────────────────────────────────────
const gatewayAuthClient = axios.create({
  baseURL: GATEWAY_BASE,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  timeout: 10_000,
});

// ─── AuthError ───────────────────────────────────────────────────────────────

export interface AuthError {
  name: 'AuthError';
  message: string;
  code: string;
  status?: number;
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as AuthError).name === 'AuthError'
  );
}

function createAuthError(message: string, code: string, status?: number): AuthError {
  return { name: 'AuthError', message, code, status };
}

// ─── Error normalization ─────────────────────────────────────────────────────

function mapKeycloakError(error: unknown): AuthError {
  if (!isAxiosError(error)) {
    return createAuthError('An unexpected error occurred.', 'UNKNOWN');
  }

  const status = error.response?.status;
  const data   = error.response?.data as KeycloakErrorResponse | undefined;
  const code   = data?.error ?? 'UNKNOWN';

  const messages: Record<string, string> = {
    invalid_grant:       'Invalid username or password.',
    unauthorized_client: 'Authentication client is not configured properly.',
    invalid_client:      'Invalid client configuration.',
    account_disabled:    'This account has been disabled.',
    invalid_request:     'The authentication request was malformed.',
  };

  const message =
    messages[code] ??
    data?.error_description ??
    'Authentication failed. Please try again.';

  return createAuthError(message, code, status);
}

// ─── Service functions ────────────────────────────────────────────────────────

// login
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const { data } = await gatewayAuthClient.post<AuthResponse>(
      LOGIN_URL,
      { email: credentials.email, password: credentials.password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

// refreshTokens
export async function refreshTokens(
  refreshToken: string,
  email: string,          // ← add this
): Promise<AuthResponse> {
  try {
    const { data } = await gatewayAuthClient.post<AuthResponse>(
      REFRESH_URL,
      { refreshToken, email },                               // ← add email
      { headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
    });
    await gatewayAuthClient.post(LOGOUT_URL, params);
  } catch {
    console.warn(
      '[authService] Back-channel logout failed — local session cleared anyway.'
    );
  }

  
}

export async function signup(data: SignupRequest): Promise<void> {
  try {
    await gatewayAuthClient.post(
      `${GATEWAY_BASE}/api/auth/register`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

export async function updateProfile(
  data: UpdateProfilePayload
): Promise<void> {
  try {
    await gatewayAuthClient.put(
      `${GATEWAY_BASE}/api/users/profile`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

export async function changePassword(
  data: ChangePasswordPayload
): Promise<void> {
  try {
    await gatewayAuthClient.post(
      `${GATEWAY_BASE}/api/auth/change-password`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

const authService = {
  login,
  refreshTokens,
  logout,
  signup,
  updateProfile,
  changePassword
};


export default authService;
