// apiClient.js
import axios from "axios";
import { getAccessToken, refreshJWT, setAuthTokens } from "./authTokens";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Add Authorization header
client.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Refresh token on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const newAccess = await refreshJWT();

      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      }

      setAuthTokens(null);
    }

    return Promise.reject(error);
  }
);

export default client;
