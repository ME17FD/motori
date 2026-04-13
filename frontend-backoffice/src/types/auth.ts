/**
 * Login credentials sent directly to Keycloak.
 * Uses username (not email) for Resource Owner Password flow.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/**
 * Decoded Keycloak JWT payload.
 * Roles are stored under realm_access.roles.
 * Values in motori_realm: "ADMIN", "USER", "SUPERADMIN" — no "ROLE_" prefix.
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  iat: number;
  exp: number;
}

/**
 * Authenticated user stored in Zustand after successful login.
 */
export interface AuthUser {
  username: string;
  email?: string;
  roles: string[];
  token: string;
  refreshToken?: string;
  expiresAt: number;    // Unix timestamp in ms
}