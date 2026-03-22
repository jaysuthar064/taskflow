import axios from "axios";

const getBaseURL = () => {
  const env = import.meta.env;
  const rawURL = (
    (env.DEV ? env.VITE_DEV_API_URL : env.VITE_API_URL) ||
    env.VITE_API_URL ||
    env.API_URL ||
    env.BASE_URL ||
    ""
  ).trim();

  if (!rawURL) {
    if (env.PROD) {
      console.warn("[Config] VITE_API_URL is missing in production. Falling back to localhost.");
    }

    return "http://localhost:5000/api/v1";
  }

  const normalized = rawURL.replace(/\/+$/, "");
  return normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
};

export const baseURL = getBaseURL();

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      const requestUrl = error.config?.url || "";
      const authExemptRoutes = [
        "/login",
        "/register",
        "/two-factor/verify"
      ];
      const isAuthExempt = authExemptRoutes.some((route) => requestUrl.includes(route));

      if (!isAuthExempt) {
        window.dispatchEvent(new Event("taskflow:auth-expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default API;
