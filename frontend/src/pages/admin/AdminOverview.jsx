import { useState, useEffect } from "react";
import adminApi from "../../services/adminApi";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/stats").then((r) => setStats(r.data.stats)).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Users", value: stats.users, icon: "◉", color: "var(--ox-orange)" },
    { label: "Active Challenges", value: stats.assignments, icon: "◈", color: "#60a5fa" },
    { label: "Published Results", value: stats.submissions, icon: "◎", color: "#34D399" },
    { label: "Pending Review", value: stats.pendingReview, icon: "◌", color: "#FBBF24" },
    { label: "Premium Users", value: stats.premiumUsers, icon: "✦", color: "var(--ox-orange)" },
  ] : [];

  return (
    <div className="page-enter">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Overview</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>InceptaX platform at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" style={{ marginBottom: "32px" }}>
          {Array(5).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "96px" }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" style={{ marginBottom: "32px" }}>
          {cards.map((c) => (
            <div key={c.label} className="ox-card" style={{ padding: "20px" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "16px", marginBottom: "10px", color: c.color }}>{c.icon}</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "2px" }}>{c.value}</div>
              <div style={{ fontSize: "11px", color: "var(--ox-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="ox-card" style={{ padding: "24px" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "15px", marginBottom: "16px" }}>Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Review Pending Submissions", href: "/admin-portal/submissions?status=ai_evaluated", color: "#FBBF24" },
            { label: "Create New Challenge", href: "/admin-portal/challenges", color: "var(--ox-orange)" },
            { label: "Send Email Blast", href: "/admin-portal/email", color: "#60a5fa" },
          ].map((a) => (
            <a key={a.label} href={a.href} className="ox-card-hover" style={{ padding: "18px", display: "block", textDecoration: "none" }}>
              <div style={{ fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, color: "var(--ox-text)", marginBottom: "10px" }}>{a.label}</div>
              <div style={{ height: "2px", width: "32px", borderRadius: "2px", background: a.color }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
