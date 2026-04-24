import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password);
      toast.success("Welcome, Admin");
      navigate("/admin-portal");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "#000" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "18px", marginBottom: "16px", background: "#111", border: "1px solid rgba(255,107,0,0.2)", boxShadow: "0 0 30px rgba(255,107,0,0.08)" }}>
            <svg style={{ width: "24px", height: "24px", color: "var(--ox-orange)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)", marginBottom: "4px" }}>Admin Portal</h1>
          <p style={{ fontSize: "12px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>InceptaX · Restricted Access</p>
        </div>

        <div className="ox-card" style={{ padding: "28px", borderColor: "rgba(255,107,0,0.12)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label className="ox-label">Admin Email</label>
              <input className="ox-input" type="email" placeholder="admin@inceptax.io"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="ox-label">Password</label>
              <input className="ox-input" type="password" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="ox-btn-primary" style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "4px" }}>
              {loading ? "Authenticating..." : "Enter Portal →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--ox-muted)", marginTop: "16px" }}>
          Not an admin?{" "}
          <a href="/" style={{ color: "var(--ox-orange)", textDecoration: "none" }}>Return to InceptaX</a>
        </p>
      </div>
    </div>
  );
}
