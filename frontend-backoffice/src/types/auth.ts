/**
 * Login credentials sent to Keycloak.
 * Uses username (not email) for Resource Owner Password flow.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Keycloak JWT payload structure.
 * Roles are under realm_access.roles as "ADMIN", "SUPERADMIN", "USER".
 */
export interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  iat: number;
  exp: number;
}

export interface AuthUser {
  username: string;
  email?: string;
  roles: string[];
  token: string;
  refreshToken?: string;
  expiresAt: number;
}