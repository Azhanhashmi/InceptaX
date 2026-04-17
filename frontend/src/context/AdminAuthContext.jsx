import { createContext, useContext, useState, useEffect } from "react";
import adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { setLoading(false); return; }
    adminApi.get("/auth/me")
      .then((r) => setAdmin(r.data.admin))
      .catch(() => localStorage.removeItem("adminToken"))
      .finally(() => setLoading(false));
  }, []);

  const loginAdmin = async (email, password) => {
    const res = await adminApi.post("/auth/login", { email, password });
    localStorage.setItem("adminToken", res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
