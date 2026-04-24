import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin-portal", label: "Overview", icon: "⬡", end: true },
  { to: "/admin-portal/challenges", label: "Challenges", icon: "◈" },
  { to: "/admin-portal/submissions", label: "Submissions", icon: "◎" },
  { to: "/admin-portal/users", label: "Users", icon: "◉" },
  { to: "/admin-portal/email", label: "Email Blast", icon: "◌" },
];

export default function AdminLayout({ children }) {
  const { admin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Signed out of admin portal");
    navigate("/admin-portal/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#000" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid var(--ox-border)", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--ox-border)" }}>
          <div className="flex items-center gap-2.5">
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "var(--ox-orange)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(255,107,0,0.3)" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, color: "#fff", fontSize: "12px" }}>IX</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "13px" }}>InceptaX</p>
              <p style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)" }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "10px", fontSize: "13.5px",
                fontFamily: "'Inter',sans-serif", fontWeight: 500,
                textDecoration: "none", transition: "all .2s",
                background: isActive ? "var(--ox-orange-lo)" : "none",
                color: isActive ? "var(--ox-orange)" : "var(--ox-muted)",
                border: isActive ? "1px solid var(--ox-orange-bd)" : "1px solid transparent"
              })}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "14px" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--ox-border)" }}>
          <div style={{ marginBottom: "10px" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13px", color: "var(--ox-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin?.name}</p>
            <p style={{ fontSize: "10.5px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin?.email}</p>
          </div>
          <button onClick={handleLogout} style={{
            width: "100%", fontSize: "12px", color: "var(--ox-muted)",
            border: "1px solid var(--ox-border)", padding: "7px", borderRadius: "9px",
            background: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif",
            transition: "all .2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--ox-muted)"; e.currentTarget.style.borderColor = "var(--ox-border)"; }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
<main style={{ flex: 1, minWidth: 0, padding: "32px", height: "100vh", overflowY: "auto", position: "relative" }}>
        {children}
      </main>
    </div>
  );
}
