import axios from "axios";
import { auth } from "../lib/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" }
});

// Attach fresh Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } catch { /* token refresh failed, continue without */ }
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  (err) => {
   
    console.error("API Error:", err.response?.status, err.message);
    return Promise.reject(err);
  }
);

export default api;
