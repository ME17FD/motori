const BASE_URL = "http://localhost:8000/api"; 

export const authApi = {
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

  refresh: async (refreshToken: string) => {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired");

    return response.json(); // expects { token, refreshToken }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
};