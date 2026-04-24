import axios from "axios";

const adminApi = axios.create({ 
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
  headers: { "Content-Type": "application/json" } 
});
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      if (!window.location.pathname.includes("/admin-portal")) {
        window.location.href = "/admin-portal/login";
      }
    }
    return Promise.reject(err);
  }
);

export default adminApi;
