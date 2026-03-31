// types/auth.ts
import type { User, UserPayload } from './user';

export interface AuthTokens {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends UserPayload {}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  adress?: string;
  approved: boolean;
  activated: boolean;
}

export interface SignupResponse {
  user: User;
  accessToken: string;
}