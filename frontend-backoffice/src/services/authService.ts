import axios from 'axios';
import { TOKEN_KEY } from '../api/axiosInstance';

/**
 * The frontend calls Keycloak on localhost:8082 (Docker mapped port).
 * After this change, Keycloak will sign tokens with issuer = motori-keycloak:8080
 * which matches what the Spring services expect.
 */
const KEYCLOAK_URL   = import.meta.env.VITE_KEYCLOAK_URL   ?? 'http://localhost:8082';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'motori_realm';
const CLIENT_ID      = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'motori-backoffice';

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Authenticates via Keycloak Resource Owner Password flow.
 * Keycloak is accessible on localhost:8082 (mapped from motori-keycloak:8080).
 */
export async function login(credentials: {
  username: string;
  password: string;
}): Promise<KeycloakTokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id:  CLIENT_ID,
    username:   credentials.username,
    password:   credentials.password,
  });

  const { data } = await axios.post<KeycloakTokenResponse>(TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('motori_refresh_token', data.refresh_token);
  }

  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('motori_refresh_token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Decodes a JWT payload without verifying the signature.
 */
export function decodeToken<T>(token: string): T | null {
  try {
    const payloadB64 = token.split('.')[1];
    const padding    = 4 - (payloadB64.length % 4);
    const padded     = payloadB64 + (padding !== 4 ? '='.repeat(padding) : '');
    const decoded    = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}