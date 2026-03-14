import { useEffect } from "react";
import axios from "axios";
import useRefreshToken from "./useRefreshToken";

const BASE_URL = "http://localhost:8000/api";

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const useAxios = () => {
  const refresh = useRefreshToken();

  useEffect(() => {
    // Attach token to every request
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // If response is 401 (token expired) — refresh and retry
    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // prevent infinite retry loop

          const newToken = await refresh();

          if (newToken) {
            prevRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axiosPrivate(prevRequest); // retry original request
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors when component unmounts
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [refresh]);

  return axiosPrivate;
};

export default useAxios;