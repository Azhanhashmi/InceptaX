import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const RANK_STYLES = {
  1: { ring: "rgba(251,191,36,0.3)", glow: "rgba(251,191,36,0.06)", label: "🥇", text: "#fbbf24" },
  2: { ring: "rgba(148,163,184,0.3)", glow: "rgba(148,163,184,0.04)", label: "🥈", text: "#94a3b8" },
  3: { ring: "rgba(205,124,58,0.3)", glow: "rgba(205,124,58,0.04)", label: "🥉", text: "#cd7c3a" },
};

export default function ProjectLeaderboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/leaderboard/assignment/${id}`).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const myEntry = data?.leaderboard?.find(e => e.userId?._id === user?._id || e.userId === user?._id);
  const diffClass = { easy: "ox-badge-easy", medium: "ox-badge-medium", hard: "ox-badge-hard" };

  if (loading) return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 16px" }}>
      <div className="ox-skeleton" style={{ height: "28px", width: "260px", marginBottom: "32px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(5).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "60px" }} />)}</div>
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
      <Link to={`/challenges/${id}`} style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>← Back to Challenge</Link>

      <div style={{ marginBottom: "32px" }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "8px" }}>
          <span className={diffClass[data?.assignment?.difficulty] || "ox-badge-free"}>{data?.assignment?.difficulty}</span>
          {myEntry && (
            <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", background: "var(--ox-orange-lo)", color: "var(--ox-orange)", border: "1px solid var(--ox-orange-bd)", padding: "3px 10px", borderRadius: "100px" }}>
              Your rank: #{myEntry.rank}
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(22px,3vw,28px)", color: "var(--ox-text)" }}>{data?.assignment?.title}</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "13.5px", marginTop: "4px" }}>{data?.leaderboard?.length || 0} published submissions</p>
      </div>

      {/* Top 3 podium */}
      {data?.leaderboard?.length >= 3 && (
        <div className="grid grid-cols-3 gap-3" style={{ marginBottom: "28px", alignItems: "flex-end" }}>
          {[1, 0, 2].map((idx) => {
            const entry = data.leaderboard[idx];
            if (!entry) return <div key={idx} />;
            const rs = RANK_STYLES[idx + 1] || {};
            const isFirst = idx === 0;
            return (
              <div key={idx} className="ox-card" style={{
                padding: isFirst ? "28px 18px" : "18px",
                textAlign: "center",
                borderColor: rs.ring || "var(--ox-border)",
                background: rs.glow ? `linear-gradient(180deg,${rs.glow} 0%,transparent 100%)` : "var(--ox-card)"
              }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{rs.label}</div>
                <img src={entry.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userId?.name}&backgroundColor=FF6B00&textColor=ffffff`}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", border: `2px solid ${rs.ring}`, margin: "0 auto 8px" }} alt="" />
                <Link to={`/u/${entry.userId?.username}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "12px", color: "var(--ox-text)", textDecoration: "none", display: "block" }}>
                  {entry.userId?.name}
                </Link>
                <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: isFirst ? "22px" : "17px", marginTop: "4px", color: rs.text || "var(--ox-text)" }}>{entry.finalScore}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="ox-card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr 2fr 2fr 2fr", padding: "10px 20px", borderBottom: "1px solid var(--ox-border)", fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ox-subtle)" }}>
          <div>#</div><div>Developer</div><div style={{ textAlign: "center" }}>AI Score</div><div style={{ textAlign: "center" }}>Admin</div><div style={{ textAlign: "center" }}>Final</div>
        </div>
        <div>
          {data?.leaderboard?.map((entry) => {
            const isMe = entry.userId?._id === user?._id;
            const rs = RANK_STYLES[entry.rank];
            return (
              <div key={entry._id} style={{
                display: "grid", gridTemplateColumns: "1fr 5fr 2fr 2fr 2fr",
                padding: "14px 20px", alignItems: "center", transition: "background .2s",
                background: isMe ? "rgba(255,107,0,0.04)" : "none",
                borderLeft: isMe ? "2px solid var(--ox-orange)" : "2px solid transparent",
                borderBottom: "1px solid var(--ox-border)"
              }}
              onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = "#0e0e0e"; }}
              onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = "none"; }}>
                <div>
                  {rs ? <span style={{ fontSize: "14px" }}>{rs.label}</span> : <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", fontSize: "12px" }}>#{entry.rank}</span>}
                </div>
                <div className="flex items-center gap-2.5">
                  <img src={entry.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userId?.name}&backgroundColor=FF6B00&textColor=ffffff`}
                    style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid var(--ox-border)", flexShrink: 0 }} alt="" />
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/u/${entry.userId?.username}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "12.5px", color: "var(--ox-text)", textDecoration: "none", display: "block" }}>
                      {entry.userId?.name}
                      {isMe && <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace" }}>(you)</span>}
                    </Link>
                    <Link to={`/submissions/${entry._id}`} style={{ fontSize: "10px", color: "var(--ox-muted)", textDecoration: "none", fontFamily: "'JetBrains Mono',monospace" }}>view →</Link>
                  </div>
                </div>
                <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px", color: "var(--ox-muted)" }}>{entry.aiScore ?? "—"}</div>
                <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "12.5px", color: "var(--ox-muted)" }}>{entry.adminScore ?? "—"}</div>
                <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "var(--ox-text)", fontSize: "13px" }}>{entry.finalScore}</div>
              </div>
            );
          })}
          {!data?.leaderboard?.length && (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--ox-muted)", fontSize: "13.5px" }}>No published results yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
