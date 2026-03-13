import axios from "axios";

const rawBaseURL = (import.meta.env.VITE_API_URL || "").trim();
const normalizedBaseURL = rawBaseURL.replace(/\/+$/, "");
const baseURL = normalizedBaseURL
  ? normalizedBaseURL.endsWith("/api/v1")
    ? normalizedBaseURL
    : `${normalizedBaseURL}/api/v1`
  : "http://localhost:5000/api/v1";

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
