/**
 * Authentication API Endpoints
 * Handles login, token refresh, and logout operations.
 * Token storage is managed via localStorage by authService.
 */

const BASE_URL = "https://backofficemotori.me-fd.com/api"; 

/**
 * Authentication API methods for user session management.
 */
export const authApi = {
  /**
   * Authenticates user with email and password.
   * Returns JWT token and refresh token on success.
   */
  login: async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json(); // expects { token, refreshToken, user }
  },

  /**
   * Refreshes the JWT token using the refresh token.
   * Called when the main token is expired or about to expire.
   */
  refresh: async (refreshToken: string) => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired");

    return response.json(); // expects { token, refreshToken }
  },

  /**
   * Clears authentication tokens from localStorage.
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
};