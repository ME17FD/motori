/**
 * Auth types — Keycloak JWT token structure and application auth state.
 * Realm: motori_realm | Client: motori-backoffice (public, directAccessGrants)
 */

/** Raw Keycloak JWT access token payload */
export interface KeycloakTokenPayload {
  sub: string;                          // User UUID (Keycloak subject)
  preferred_username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email_verified?: boolean;
  realm_access: {
    roles: string[];                    // Realm-level roles: ADMIN, USER, SUPERADMIN
  };
  resource_access?: Record<string, { roles: string[] }>;
  exp: number;                          // Expiry timestamp (seconds)
  iat: number;                          // Issued-at timestamp
  jti: string;                          // JWT ID
  iss: string;                          // Issuer URL
  aud: string | string[];
  session_state?: string;
  scope?: string;
}

/** Normalized user object derived from the JWT payload */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  emailVerified: boolean;
}

/** Tokens returned by Keycloak token endpoint */
export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;              // Seconds until access token expires (300s in realm)
  refresh_expires_in: number;      // Seconds until refresh token expires
  token_type: 'Bearer';
  session_state: string;
  scope: string;
}

/** Keycloak error response shape */
export interface KeycloakErrorResponse {
  error: string;
  error_description?: string;
}

/** Login form input */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Global auth state stored in Zustand */
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;         // Unix timestamp (ms) when access token expires
}

/** Response from user-service /auth/login and /auth/refresh */
export interface AuthResponse {
  id: number;
  token: string;
  refreshToken: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}