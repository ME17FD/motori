import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const useRefreshToken = () => {
  const navigate = useNavigate();

  const refresh = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");

    // No refresh token — send to login
    if (!refreshToken) {
      navigate("/login");
      return null;
    }

    try {
      const { token, refreshToken: newRefreshToken } = await authApi.refresh(refreshToken);

      // Update stored tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);

      return token;
    } catch (err) {
      // Refresh failed — clear everything and send to login
      authApi.logout();
      navigate("/login");
      return null;
    }
  };

  return refresh;
};

export default useRefreshToken;