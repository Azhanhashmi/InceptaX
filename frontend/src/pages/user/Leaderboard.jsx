import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/leaderboard").then(r => setBoard(r.data.leaderboard)).finally(() => setLoading(false)); }, []);

  const rankStyle = {
    1: { icon: "🥇", color: "#fbbf24" },
    2: { icon: "🥈", color: "#94a3b8" },
    3: { icon: "🥉", color: "#cd7c3a" }
  };
  const myEntry = board.find(e => e.username === user?.username);

  return (
    <div className="page-enter" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Rankings</p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,46px)", color: "var(--ox-text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>🏆 Global Rankings</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "14px" }}>Ranked by best project score across all challenges</p>
        {myEntry && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "14px",
            background: "var(--ox-orange-lo)", border: "1px solid var(--ox-orange-bd)",
            padding: "6px 16px", borderRadius: "100px", fontSize: "12px",
            color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace" }}>
            Your rank: #{myEntry.rank} · Best score: {myEntry.bestScore}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(8).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "56px" }} />)}</div>
      ) : board.length === 0 ? (
        <div className="ox-card" style={{ padding: "64px", textAlign: "center" }}>
          <p style={{ color: "var(--ox-muted)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "17px", marginBottom: "16px" }}>No rankings yet</p>
          <Link to="/challenges" className="ox-btn-primary">Browse Challenges →</Link>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3" style={{ marginBottom: "36px", alignItems: "flex-end" }}>
            {[1, 0, 2].map(idx => {
              const e = board[idx];
              if (!e) return <div key={idx} />;
              const rs = rankStyle[idx + 1];
              const isFirst = idx === 0;
              return (
                <div key={idx} className="ox-card" style={{
                  padding: isFirst ? "28px 20px" : "20px",
                  textAlign: "center",
                  borderColor: isFirst ? "rgba(251,191,36,0.25)" : "var(--ox-border)",
                  background: isFirst ? "linear-gradient(180deg,rgba(251,191,36,0.05) 0%,transparent 100%)" : "var(--ox-card)"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>{rs.icon}</div>
                  <img src={e.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${e.name}&backgroundColor=FF6B00&textColor=ffffff`}
                    style={{ width: isFirst ? "52px" : "38px", height: isFirst ? "52px" : "38px", borderRadius: "12px", border: `2px solid ${rs.color}44`, margin: "0 auto 8px" }} alt="" />
                  <Link to={`/u/${e.username}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "12px", color: "var(--ox-text)", textDecoration: "none", display: "block" }}>{e.name}</Link>
                  <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, marginTop: "4px", color: rs.color, fontSize: isFirst ? "24px" : "18px" }}>{e.bestScore}</p>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="ox-card" style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 5fr 2fr 2fr 2fr", padding: "10px 20px 10px", borderBottom: "1px solid var(--ox-border)", fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ox-subtle)" }}>
              <div>#</div><div>Developer</div><div style={{ textAlign: "center" }}>Best</div><div style={{ textAlign: "center" }}>Projects</div><div style={{ textAlign: "center" }}>Avg AI</div>
            </div>
            {board.map(entry => {
              const isMe = entry.username === user?.username;
              const rs = rankStyle[entry.rank];
              return (
                <div key={entry.userId} style={{
                  display: "grid", gridTemplateColumns: "1fr 5fr 2fr 2fr 2fr",
                  padding: "14px 20px", alignItems: "center", transition: "background .2s",
                  background: isMe ? "rgba(255,107,0,0.04)" : "none",
                  borderLeft: isMe ? "2px solid var(--ox-orange)" : "2px solid transparent",
                  borderBottom: "1px solid var(--ox-border)"
                }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = "#0e0e0e"; }}
                onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = "none"; }}>
                  <div>
                    {rs ? <span style={{ fontSize: "14px" }}>{rs.icon}</span> : <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", fontSize: "12px" }}>#{entry.rank}</span>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <img src={entry.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}&backgroundColor=FF6B00&textColor=ffffff`}
                      style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid var(--ox-border)", flexShrink: 0 }} alt="" />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/u/${entry.username}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "12.5px", color: "var(--ox-text)", textDecoration: "none", display: "block" }}>
                        {entry.name}{isMe && <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--ox-orange)" }}>(you)</span>}
                      </Link>
                      {entry.plan !== "free" && <span style={{ fontSize: "10px", color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace" }}>✦ premium</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "var(--ox-text)", fontSize: "13px" }}>{entry.bestScore}</div>
                  <div style={{ textAlign: "center", fontSize: "12px", color: "var(--ox-muted)" }}>{entry.totalSubmissions}</div>
                  <div style={{ textAlign: "center", fontSize: "12px", color: "var(--ox-muted)" }}>{entry.avgAiScore}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
