import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_MAP = {
  pending: { label: "Pending", color: "var(--ox-muted)", bg: "rgba(255,255,255,0.04)", border: "var(--ox-border)" },
  ai_evaluated: { label: "AI Done", color: "#FBBF24", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.25)" },
  admin_reviewed: { label: "In Review", color: "#60a5fa", bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.25)" },
  published: { label: "Published", color: "#34D399", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.25)" },
  rejected: { label: "Rejected", color: "#F87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)" },
};

export function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  useEffect(() => {
    api.get("/submissions/mine").then(r => setSubmissions(r.data.submissions)).finally(() => setLoading(false));
  }, []);

  const published = submissions.filter(s => s.status === "published");
  const bestScore = published.length ? Math.max(...published.map(s => s.finalScore || 0)) : 0;

  return (
    <div className="page-enter" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 16px" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Dashboard</h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>Track your submissions and progress</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/u/${user?.username}`} className="ox-btn-ghost" style={{ fontSize: "12.5px", padding: "8px 14px" }}>My Profile →</Link>
          <Link to="/challenges" className="ox-btn-primary" style={{ fontSize: "12.5px", padding: "8px 16px" }}>+ Submit</Link>
        </div>
      </div>

      {/* Plan banner */}
      {!isPremiumActive && (
        <div className="ox-card flex items-center justify-between gap-4" style={{ padding: "16px 20px", marginBottom: "24px", borderColor: "var(--ox-orange-bd)", background: "rgba(255,107,0,0.04)" }}>
          <div>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, color: "var(--ox-text)", fontSize: "13.5px" }}>Unlock premium challenges</p>
            <p style={{ fontSize: "12px", color: "var(--ox-muted)", marginTop: "2px" }}>Team collaboration, premium challenges, priority evaluation — from ₹99</p>
          </div>
          <Link to="/pricing" className="ox-btn-primary" style={{ flexShrink: 0, fontSize: "12px", padding: "8px 16px" }}>Upgrade →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: "32px" }}>
        {[
          { label: "Total", value: submissions.length, icon: "◈" },
          { label: "Published", value: published.length, icon: "◉" },
          { label: "Best Score", value: bestScore, icon: "◎" },
          { label: "Plan", value: user?.plan === "free" ? "Free" : user?.plan === "ten_day" ? "Sprint" : "Pro", icon: "✦" },
        ].map(s => (
          <div key={s.label} className="ox-card" style={{ padding: "18px" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-orange)", fontSize: "15px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "var(--ox-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--ox-text)", marginBottom: "14px" }}>My Submissions</h2>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(3).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "72px" }} />)}</div>
      ) : submissions.length === 0 ? (
        <div className="ox-card" style={{ padding: "56px", textAlign: "center" }}>
          <p style={{ color: "var(--ox-muted)", fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: "16px" }}>No submissions yet</p>
          <Link to="/challenges" className="ox-btn-primary">Browse Challenges →</Link>
        </div>
      ) : (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          {submissions.map((sub, idx) => {
            const sm = STATUS_MAP[sub.status] || STATUS_MAP.pending;
            return (
              <Link key={sub._id} to={`/submissions/${sub._id}`} style={{
                display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px",
                textDecoration: "none", transition: "background .2s",
                borderBottom: idx < submissions.length - 1 ? "1px solid var(--ox-border)" : "none"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#111"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "2px" }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13px", color: "var(--ox-text)" }}>
                      {sub.assignmentId?.title}
                    </span>
                    <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: "100px",
                      color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>
                      {sm.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {sub.status === "published" && (
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)" }}>{sub.finalScore}</div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)" }}>Rank #{sub.rank}</div>
                  </div>
                )}
                {sub.status === "pending" && (
                  <div style={{ flexShrink: 0, width: "18px", height: "18px", border: "2px solid var(--ox-border)", borderTop: "2px solid var(--ox-orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                )}
              </Link>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Dashboard;
