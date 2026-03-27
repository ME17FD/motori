/**
 * Auth service — communicates directly with Keycloak's token endpoint.
 *
 * Uses the Resource Owner Password Credentials (ROPC / Direct Access Grant)
 * flow, which is enabled for the `motori-backoffice` public client.
 *
 * Token endpoint:
 *   POST http://localhost:8082/realms/motori_realm/protocol/openid-connect/token
 *
 * Note: All requests hit Keycloak directly (not through the API Gateway)
 * because the gateway proxies only backend microservices.
 *
 * erasableSyntaxOnly compatibility:
 *   AuthError is implemented as an interface + factory function instead of
 *   a class extending Error, since classes extending built-ins are not
 *   purely erasable under verbatimModuleSyntax / erasableSyntaxOnly.
 */

import axios, { isAxiosError } from 'axios';
import type {
  LoginCredentials,
  KeycloakTokenResponse,
  KeycloakErrorResponse,
} from '../types/auth';

// ─── Keycloak configuration ─────────────────────────────────────────────────

const KEYCLOAK_BASE = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8082';
const REALM        = import.meta.env.VITE_KEYCLOAK_REALM ?? 'motori_realm';
const CLIENT_ID    = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'motori-backoffice';

const TOKEN_URL  = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token`;
const LOGOUT_URL = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/logout`;

/**
 * Dedicated axios instance for Keycloak.
 * No auth interceptors are attached — this client is used before
 * the user is authenticated, so it must remain interceptor-free.
 */
const keycloakClient = axios.create({
  baseURL: KEYCLOAK_BASE,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  timeout: 10_000,
});

// ─── AuthError — interface + factory (erasableSyntaxOnly compatible) ────────

/**
 * Typed error object returned by all auth service functions.
 * Uses an interface + factory pattern instead of `class extends Error`
 * to remain compatible with erasableSyntaxOnly / verbatimModuleSyntax.
 */
export interface AuthError {
  name: 'AuthError';
  message: string;
  /** Keycloak error code, e.g. "invalid_grant", "unauthorized_client" */
  code: string;
  /** HTTP status code from Keycloak response, if available */
  status?: number;
}

/**
 * Type guard — narrows an unknown caught value to AuthError.
 *
 * Usage:
 *   catch (err) {
 *     if (isAuthError(err)) { ... }
 *   }
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as AuthError).name === 'AuthError'
  );
}

/**
 * Internal factory — creates a typed AuthError object.
 * Not exported; consumers receive AuthError via thrown rejections.
 */
function createAuthError(message: string, code: string, status?: number): AuthError {
  return { name: 'AuthError', message, code, status };
}

// ─── Error normalization ───────────────────────────────────────────────────

/**
 * Converts a raw Axios error from Keycloak into a normalized AuthError.
 * Maps known Keycloak error codes to user-friendly English messages.
 */
function mapKeycloakError(error: unknown): AuthError {
  if (!isAxiosError(error)) {
    return createAuthError('An unexpected error occurred.', 'UNKNOWN');
  }

  const status = error.response?.status;
  const data   = error.response?.data as KeycloakErrorResponse | undefined;
  const code   = data?.error ?? 'UNKNOWN';

  // Human-readable messages for known Keycloak grant errors
  const messages: Record<string, string> = {
    invalid_grant:        'Invalid username or password.',
    unauthorized_client:  'Authentication client is not configured properly.',
    invalid_client:       'Invalid client configuration.',
    account_disabled:     'This account has been disabled.',
    invalid_request:      'The authentication request was malformed.',
  };

  const message =
    messages[code] ??
    data?.error_description ??
    'Authentication failed. Please try again.';

  return createAuthError(message, code, status);
}

// ─── Service functions ─────────────────────────────────────────────────────

/**
 * Authenticates a user via Keycloak Direct Access Grant (ROPC flow).
 *
 * Requires `directAccessGrantsEnabled: true` on the `motori-backoffice`
 * client — confirmed enabled in the realm export.
 *
 * @param credentials - { username, password }
 * @returns Keycloak token response containing access_token and refresh_token
 * @throws {AuthError} on invalid credentials, disabled account, or network failure
 */
export async function login(
  credentials: LoginCredentials
): Promise<KeycloakTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id:  CLIENT_ID,
    username:   credentials.username,
    password:   credentials.password,
    scope:      'openid profile email roles',
  });

  try {
    const { data } = await keycloakClient.post<KeycloakTokenResponse>(
      TOKEN_URL,
      params
    );
    return data;
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

/**
 * Exchanges a refresh token for a new access token (refresh grant).
 *
 * Called automatically by the Axios response interceptor in axiosInstance.ts
 * when a 401 is received, before retrying the original request.
 *
 * Refresh token lifetime is controlled by the realm's
 * `ssoSessionIdleTimeout` (1800s) and `ssoSessionMaxLifespan` (36000s).
 *
 * @param refreshToken - The stored Keycloak refresh token
 * @returns A new set of tokens
 * @throws {AuthError} when the refresh token is expired or revoked
 */
export async function refreshTokens(
  refreshToken: string
): Promise<KeycloakTokenResponse> {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     CLIENT_ID,
    refresh_token: refreshToken,
  });

  try {
    const { data } = await keycloakClient.post<KeycloakTokenResponse>(
      TOKEN_URL,
      params
    );
    return data;
  } catch (error) {
    throw mapKeycloakError(error);
  }
}

/**
 * Revokes the Keycloak session via back-channel logout.
 *
 * Sends the refresh token to Keycloak's logout endpoint to invalidate
 * the SSO session server-side. Failure is intentionally swallowed —
 * the local auth state is cleared regardless of the outcome.
 *
 * The calling hook (useAuth.logout) is responsible for clearing
 * the Zustand store and redirecting to /login.
 *
 * @param refreshToken - The stored refresh token to revoke
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    const params = new URLSearchParams({
      client_id:     CLIENT_ID,
      refresh_token: refreshToken,
    });
    await keycloakClient.post(LOGOUT_URL, params);
  } catch {
    // Intentionally silent — local state is cleared by the caller regardless.
    // A failed back-channel logout does not block the local logout flow.
    console.warn(
      '[authService] Back-channel logout failed — local session cleared anyway.'
    );
  }
}