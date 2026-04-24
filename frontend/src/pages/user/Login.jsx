import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const IXLogo = () => (
  <div className="flex items-center justify-center gap-3" style={{ marginBottom: "28px" }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--ox-orange)", boxShadow: "0 0 28px rgba(255,107,0,0.4)" }}>
      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#fff", fontSize: "16px" }}>IX</span>
    </div>
    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--ox-text)", letterSpacing: "-0.03em" }}>InceptaX</span>
  </div>
);

export default function Login() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planParam = params.get("plan");

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const redirect = (user) => {
    if (planParam) return navigate("/pricing");
    navigate("/dashboard");
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        if (form.password.length < 6) throw new Error("Password must be 6+ characters");
        await registerWithEmail(form.email, form.password, form.name);
        toast.success("Welcome to InceptaX! 🚀");
      } else {
        await loginWithEmail(form.email, form.password);
        toast.success("Welcome back!");
      }
      redirect();
    } catch (err) {
      const msg = err.code === "auth/user-not-found" ? "No account found. Create one first."
        : err.code === "auth/wrong-password" ? "Incorrect password."
        : err.code === "auth/email-already-in-use" ? "Email already registered."
        : err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    try {
      await (provider === "google" ? loginWithGoogle() : loginWithGitHub());
      toast.success("Signed in!");
      redirect();
    } catch (err) {
      toast.error(err.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: "calc(100vh - 66px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 16px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="ox-card" style={{ padding: "32px" }}>
          <IXLogo />

          {/* Mode tabs */}
          <div style={{ display: "flex", background: "#0e0e0e", border: "1px solid var(--ox-border)", borderRadius: "12px", padding: "4px", marginBottom: "26px" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px", borderRadius: "9px", fontSize: "13.5px",
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: "pointer",
                border: "none", transition: "all .2s",
                background: mode === m ? "var(--ox-orange)" : "none",
                color: mode === m ? "#fff" : "var(--ox-muted)",
                boxShadow: mode === m ? "0 2px 10px rgba(255,107,0,0.3)" : "none"
              }}>
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* OAuth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "22px" }}>
            <button onClick={() => handleOAuth("google")} disabled={loading}
              className="ox-btn-ghost" style={{ width: "100%", padding: "12px", fontSize: "14px", gap: "10px" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button onClick={() => handleOAuth("github")} disabled={loading}
              className="ox-btn-ghost" style={{ width: "100%", padding: "12px", fontSize: "14px", gap: "10px" }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--ox-border)" }} />
            <span style={{ fontSize: "11.5px", color: "var(--ox-subtle)", fontFamily: "'JetBrains Mono',monospace" }}>or email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--ox-border)" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <div>
                <label className="ox-label">Full Name</label>
                <input className="ox-input" type="text" placeholder="Alex Johnson" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            <div>
              <label className="ox-label">Email</label>
              <input className="ox-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="ox-label">Password</label>
              <input className="ox-input" type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="ox-btn-primary" style={{ width: "100%", padding: "13px", fontSize: "14.5px", marginTop: "4px" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing...
                </span>
              ) : mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--ox-muted)", marginTop: "16px" }}>
          Are you an admin?{" "}
          <Link to="/admin-portal/login" style={{ color: "var(--ox-orange)", textDecoration: "none" }}>Admin portal →</Link>
        </p>
      </div>
    </div>
  );
}
