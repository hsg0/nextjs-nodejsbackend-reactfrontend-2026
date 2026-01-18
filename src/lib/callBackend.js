// src/lib/callBackend.js
import axios from "axios";

/*
  ✅ Axios instance for your Express backend
  - Uses cookies (token) with credentials: true
  - Works in dev on LAN + localhost
  - Base URL comes from NEXT_PUBLIC_BACKEND_URL if set
*/

const callBackend = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || "http://192.168.0.105:5020",
  withCredentials: true,
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: basic logging (helps while learning)
callBackend.interceptors.request.use(
  (config) => {
    console.log("➡️ API Request:", config?.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log("❌ API Request Error:", error?.message || error);
    return Promise.reject(error);
  }
);

callBackend.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.message || "Error";
    console.log("❌ API Response Error:", status, msg);
    return Promise.reject(error);
  }
);

export default callBackend;