import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/leaderboard").then(r => setBoard(r.data.leaderboard)).finally(() => setLoading(false)); }, []);

  const rankStyle = { 1: { icon: "🥇", color: "#fbbf24" }, 2: { icon: "🥈", color: "#94a3b8" }, 3: { icon: "🥉", color: "#cd7c3a" } };
  const myEntry = board.find(e => e.username === user?.username);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <div className="text-center mb-12">
        <h1 className="font-display font-extrabold text-4xl text-ix-white mb-3">🏆 Global Rankings</h1>
        <p className="text-ix-muted">Ranked by best project score across all challenges</p>
        {myEntry && (
          <div className="inline-flex items-center gap-2 mt-4 bg-ix-primary/10 border border-ix-primary/25 px-4 py-1.5 rounded-full text-xs font-mono text-ix-primary">
            Your rank: #{myEntry.rank} · Best score: {myEntry.bestScore}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{Array(8).fill(0).map((_, i) => <div key={i} className="ix-card h-14 skeleton" />)}</div>
      ) : board.length === 0 ? (
        <div className="ix-card p-16 text-center">
          <p className="text-ix-muted font-display text-lg mb-4">No rankings yet</p>
          <Link to="/challenges" className="btn-primary">Browse Challenges →</Link>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-3 mb-10 items-end">
            {[1, 0, 2].map(idx => {
              const e = board[idx];
              if (!e) return <div key={idx} />;
              const rs = rankStyle[idx + 1];
              const isFirst = idx === 0;
              return (
                <div key={idx} className={`ix-card p-5 text-center ${isFirst ? "py-8 border-ix-gold/30" : ""}`}
                  style={isFirst ? { background: "linear-gradient(180deg,rgba(251,191,36,0.06) 0%,transparent 100%)", boxShadow: "0 0 40px rgba(251,191,36,0.08)" } : {}}>
                  <div className="text-2xl mb-3">{rs.icon}</div>
                  <img src={e.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${e.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                    className={`${isFirst ? "w-14 h-14" : "w-10 h-10"} rounded-xl border mx-auto mb-2`}
                    style={{ borderColor: rs.color + "50" }} alt="" />
                  <Link to={`/u/${e.username}`} className="font-display font-semibold text-xs text-ix-white hover:text-ix-primary transition-colors block truncate">{e.name}</Link>
                  <p className="font-mono font-bold mt-1" style={{ color: rs.color, fontSize: isFirst ? "1.5rem" : "1.1rem" }}>{e.bestScore}</p>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="ix-card overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-2.5 border-b border-ix-border text-xs font-mono uppercase tracking-widest text-ix-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Developer</div>
              <div className="col-span-2 text-center">Best</div>
              <div className="col-span-2 text-center hidden sm:block">Projects</div>
              <div className="col-span-2 text-center hidden sm:block">Avg AI</div>
            </div>
            <div className="divide-y divide-ix-border">
              {board.map(entry => {
                const isMe = entry.username === user?.username;
                const rs = rankStyle[entry.rank];
                return (
                  <div key={entry.userId} className={`grid grid-cols-12 px-5 py-3.5 items-center transition-colors ${isMe ? "bg-ix-primary/5 border-l-2 border-ix-primary" : "hover:bg-ix-card-hover"}`}>
                    <div className="col-span-1">
                      {rs ? <span className="text-base">{rs.icon}</span> : <span className="font-mono text-ix-muted text-sm">#{entry.rank}</span>}
                    </div>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <img src={entry.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                        className="w-7 h-7 rounded-lg border border-ix-border flex-shrink-0" alt="" />
                      <div className="min-w-0">
                        <Link to={`/u/${entry.username}`} className="font-display font-medium text-xs text-ix-white hover:text-ix-primary transition-colors truncate block">
                          {entry.name}{isMe && <span className="ml-1 text-[10px] text-ix-primary">(you)</span>}
                        </Link>
                        {entry.plan !== "free" && <span className="text-[10px] text-ix-premium font-mono">✦ premium</span>}
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-mono font-bold text-ix-white text-sm">{entry.bestScore}</div>
                    <div className="col-span-2 text-center text-ix-subtle text-xs hidden sm:block">{entry.totalSubmissions}</div>
                    <div className="col-span-2 text-center text-ix-subtle text-xs hidden sm:block">{entry.avgAiScore}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
