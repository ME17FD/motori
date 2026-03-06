import { apiFetch } from "./apiClient";

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
}

export const authApi = {
  login: (payload: LoginPayload): Promise<AuthResponse> =>
    apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};