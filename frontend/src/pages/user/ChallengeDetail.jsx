import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format, isPast, formatDistanceToNow } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ChallengeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [topSubs, setTopSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mySubmission, setMySubmission] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/assignments/${id}`), api.get(`/submissions/assignment/${id}`)]).then(([aR, sR]) => {
      setAssignment(aR.data.assignment);
      setTopSubs(sR.data.submissions.slice(0, 5));
      if (user) setMySubmission(sR.data.submissions.find(s => s.userId?._id === user._id || s.userId === user._id) || null);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, user]);

  if (loading) return <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 16px" }}><div className="ox-skeleton" style={{ height: "180px" }} /></div>;
  if (!assignment) return <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "var(--ox-muted)" }}>Challenge not found.</div>;

  const expired = isPast(new Date(assignment.deadline));
  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);
  const canSubmit = user && !mySubmission && !expired && (!assignment.isPremium || isPremiumActive);
  const diffClass = { easy: "ox-badge-easy", medium: "ox-badge-medium", hard: "ox-badge-hard" };

  return (
    <div className="page-enter" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
      <Link to="/challenges" style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>← Challenges</Link>

      {/* Header card */}
      <div className="ox-card" style={{ padding: "28px", marginBottom: "16px" }}>
        <div className="flex flex-wrap items-start justify-between gap-4" style={{ marginBottom: "20px" }}>
          <div>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "10px" }}>
              <span className={diffClass[assignment.difficulty] || "ox-badge-free"}>{assignment.difficulty}</span>
              {assignment.isPremium && <span className="ox-badge-premium">✦ Premium</span>}
              {assignment.prize && <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "#FBBF24" }}>🏆 {assignment.prize}</span>}
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,30px)", color: "var(--ox-text)", lineHeight: 1.2 }}>{assignment.title}</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {canSubmit && <Link to={`/challenges/${id}/submit`} className="ox-btn-primary" style={{ fontSize: "13px", padding: "9px 20px" }}>Submit →</Link>}
            {mySubmission && <Link to={`/submissions/${mySubmission._id}`} className="ox-btn-ghost" style={{ fontSize: "13px", padding: "9px 18px" }}>My Submission</Link>}
            {!user && <Link to="/login" className="ox-btn-primary" style={{ fontSize: "13px", padding: "9px 20px" }}>Sign in to Submit</Link>}
            {assignment.isPremium && !isPremiumActive && user && (
              <Link to="/pricing" className="ox-btn-ghost" style={{ fontSize: "13px", padding: "9px 18px", color: "var(--ox-orange)", borderColor: "var(--ox-orange-bd)" }}>✦ Upgrade to Submit</Link>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={{ color: "var(--ox-muted)", fontSize: "14.5px", lineHeight: 1.8, fontWeight: 300 }}>{assignment.description}</p>

        {/* Tags */}
        {assignment.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: "16px" }}>
            {assignment.tags.map(t => (
              <span key={t} style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", background: "var(--ox-orange-lo)", color: "var(--ox-orange)", border: "1px solid var(--ox-orange-bd)", padding: "3px 10px", borderRadius: "8px" }}>{t}</span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-5" style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--ox-border)" }}>
          <span>Deadline: <span style={{ color: expired ? "#F87171" : "#FBBF24" }}>
            {format(new Date(assignment.deadline), "MMM d, yyyy")}
            {!expired && ` (${formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })})`}
          </span></span>
          <span>{assignment.submissionsCount} submissions</span>
        </div>
      </div>

      {/* Rules — only shown if rules exist */}
      {assignment.rules && (
        <div className="ox-card" style={{ padding: "24px", marginBottom: "16px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
            <span style={{ fontSize: "14px" }}>📋</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--ox-text)" }}>Rules & How to Build</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {assignment.rules.split("\n").filter(l => l.trim()).map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ color: "var(--ox-orange)", fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", marginTop: "3px", flexShrink: 0 }}>—</span>
                <p style={{ fontSize: "14px", color: "var(--ox-muted)", lineHeight: 1.7, fontWeight: 300 }}>{line.replace(/^[-•]\s*/, "")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Criteria — only shown if criteria exist */}
      {assignment.criteria && (
        <div className="ox-card" style={{ padding: "24px", marginBottom: "16px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
            <span style={{ fontSize: "14px" }}>🎯</span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--ox-text)" }}>Evaluation Criteria</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {assignment.criteria.split("\n").filter(l => l.trim()).map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ color: "var(--ox-orange)", fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", marginTop: "3px", flexShrink: 0 }}>—</span>
                <p style={{ fontSize: "14px", color: "var(--ox-muted)", lineHeight: 1.7, fontWeight: 300 }}>{line.replace(/^[-•]\s*/, "")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Submissions */}
      <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--ox-text)" }}>Top Submissions</h2>
        <Link to={`/leaderboard/challenge/${id}`} style={{ fontSize: "12px", color: "var(--ox-orange)", textDecoration: "none", fontFamily: "'JetBrains Mono',monospace" }}>View all →</Link>
      </div>
      {topSubs.length === 0 ? (
        <div className="ox-card" style={{ padding: "32px", textAlign: "center", color: "var(--ox-muted)", fontSize: "13.5px" }}>No published submissions yet. Be the first!</div>
      ) : (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          {topSubs.map((sub, i) => (
            <Link key={sub._id} to={`/submissions/${sub._id}`} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px",
              textDecoration: "none", transition: "background .2s",
              borderBottom: i < topSubs.length - 1 ? "1px solid var(--ox-border)" : "none"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#111"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <span style={{ fontSize: "16px", width: "24px", textAlign: "center", flexShrink: 0 }}>{["🥇","🥈","🥉"][i] || `#${i+1}`}</span>
              <img src={sub.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.userId?.name}&backgroundColor=FF6B00&textColor=ffffff`}
                style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid var(--ox-border)", flexShrink: 0 }} alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "12.5px", color: "var(--ox-text)" }}>{sub.userId?.name}</p>
                <p style={{ fontSize: "10.5px", color: "var(--ox-muted)", fontFamily: "'Inter',sans-serif" }}>{sub.description?.slice(0, 60)}…</p>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "var(--ox-text)", fontSize: "14px", flexShrink: 0 }}>{sub.finalScore}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}