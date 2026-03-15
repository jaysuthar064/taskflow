import axios from "axios";

const getBaseURL = () => {
  const env = import.meta.env;
  const rawURL = (env.VITE_API_URL || env.API_URL || env.BASE_URL || "").trim();
  
  if (!rawURL) {
    if (env.PROD) {
      console.warn("⚠️ [Config] VITE_API_URL is missing in production! Falling back to localhost.");
    }
    return "http://localhost:5000/api/v1";
  }

  const normalized = rawURL.replace(/\/+$/, "");
  const finalURL = normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
  
  console.log(`🚀 [Config] Using API Root: ${finalURL}`);
  return finalURL;
};

export const baseURL = getBaseURL();

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

export default API;
