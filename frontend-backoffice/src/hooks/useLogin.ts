import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const useLogin = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const { token, refreshToken, user } = await authApi.login({ email, password });
      
      // Store both tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to homepage
      navigate("/");

    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errorMsg,
    loading,
    handleLogin,
  };
};

export default useLogin;