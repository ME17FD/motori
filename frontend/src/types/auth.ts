/**
 * Credentials sent to the login endpoint via the API Gateway.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Successful authentication response from the gateway.
 * The token is a signed JWT containing the user's roles.
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;   // seconds
}

/**
 * Decoded JWT payload (relevant fields only).
 * Roles are stored as Spring Security GrantedAuthority strings.
 */
export interface JwtPayload {
  sub: string;          // email or username
  roles: string[];      // e.g. ["ROLE_ADMIN", "ROLE_USER"]
  iat: number;
  exp: number;
}

/**
 * The authenticated user stored in Zustand after login.
 */
export interface AuthUser {
  email: string;
  roles: string[];
  token: string;
  refreshToken?: string;
  expiresAt: number;    // Unix timestamp (ms)
}