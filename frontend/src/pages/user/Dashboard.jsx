// ─────────────────────────────────────────────────────────────────────────────
// Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_MAP = {
  pending: { label: "Pending", cls: "text-ix-muted border-ix-border" },
  ai_evaluated: { label: "AI Done", cls: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
  admin_reviewed: { label: "In Review", cls: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
  published: { label: "Published", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
  rejected: { label: "Rejected", cls: "text-red-400 border-red-500/30 bg-red-500/5" },
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-white">Dashboard</h1>
          <p className="text-ix-muted text-sm">Track your submissions and progress</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/u/${user?.username}`} className="btn-ghost text-sm">My Profile →</Link>
          <Link to="/challenges" className="btn-primary text-sm">+ Submit</Link>
        </div>
      </div>

      {/* Plan banner */}
      {!isPremiumActive && (
        <div className="mb-6 ix-card p-4 flex items-center justify-between gap-4" style={{ background: "linear-gradient(135deg,rgba(79,70,229,0.08),rgba(6,182,212,0.05))", borderColor: "rgba(79,70,229,0.25)" }}>
          <div>
            <p className="font-display font-semibold text-ix-white text-sm">Unlock premium challenges</p>
            <p className="text-xs text-ix-muted mt-0.5">Team collaboration, premium challenges, priority evaluation — from ₹99</p>
          </div>
          <Link to="/pricing" className="btn-brand flex-shrink-0 text-xs px-4 py-2">Upgrade →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total", value: submissions.length, icon: "◈" },
          { label: "Published", value: published.length, icon: "◉" },
          { label: "Best Score", value: bestScore, icon: "◎" },
          { label: "Plan", value: user?.plan === "free" ? "Free" : user?.plan === "ten_day" ? "Sprint" : "Pro", icon: "✦" },
        ].map(s => (
          <div key={s.label} className="ix-card p-4">
            <div className="font-mono text-ix-primary text-base mb-2">{s.icon}</div>
            <div className="font-display font-bold text-xl text-ix-white">{s.value}</div>
            <div className="text-xs text-ix-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <h2 className="font-display font-semibold text-lg text-ix-white mb-4">My Submissions</h2>
      {loading ? (
        <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="ix-card h-20 skeleton" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="ix-card p-14 text-center">
          <p className="text-ix-muted font-display mb-4">No submissions yet</p>
          <Link to="/challenges" className="btn-primary">Browse Challenges →</Link>
        </div>
      ) : (
        <div className="ix-card divide-y divide-ix-border overflow-hidden">
          {submissions.map(sub => {
            const sm = STATUS_MAP[sub.status] || STATUS_MAP.pending;
            return (
              <Link key={sub._id} to={`/submissions/${sub._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ix-card-hover transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-display font-semibold text-sm text-ix-white group-hover:text-white transition-colors truncate">
                      {sub.assignmentId?.title}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${sm.cls}`}>{sm.label}</span>
                  </div>
                  <p className="text-xs text-ix-muted font-mono">{formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</p>
                </div>
                {sub.status === "published" && (
                  <div className="flex-shrink-0 text-right">
                    <div className="font-display font-bold text-xl text-ix-white">{sub.finalScore}</div>
                    <div className="text-[10px] font-mono text-ix-muted">Rank #{sub.rank}</div>
                  </div>
                )}
                {sub.status === "pending" && (
                  <div className="flex-shrink-0 w-5 h-5 border-2 border-ix-border border-t-ix-primary rounded-full animate-spin" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
