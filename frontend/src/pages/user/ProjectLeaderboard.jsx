import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const RANK_STYLES = {
  1: { ring: "border-ix-gold/50", glow: "rgba(251,191,36,0.08)", label: "🥇", text: "text-ix-gold" },
  2: { ring: "border-ix-silver/40", glow: "rgba(148,163,184,0.06)", label: "🥈", text: "text-ix-silver" },
  3: { ring: "border-ix-bronze/40", glow: "rgba(205,124,58,0.06)", label: "🥉", text: "text-ix-bronze" },
};

export default function ProjectLeaderboard() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/leaderboard/assignment/${id}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const myEntry = data?.leaderboard?.find(e => e.userId?._id === user?._id || e.userId === user?._id);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="skeleton h-8 w-64 mb-8" />
      <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="ix-card h-16 skeleton" />)}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <Link to={`/challenges/${id}`} className="text-xs font-mono text-ix-muted hover:text-ix-subtle flex items-center gap-1 mb-6">← Back to Challenge</Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`badge-${data?.assignment?.difficulty}`}>{data?.assignment?.difficulty}</span>
          {myEntry && (
            <span className="text-xs font-mono bg-ix-primary/10 text-ix-primary border border-ix-primary/25 px-2.5 py-1 rounded-full">
              Your rank: #{myEntry.rank}
            </span>
          )}
        </div>
        <h1 className="font-display font-bold text-2xl text-ix-white">{data?.assignment?.title}</h1>
        <p className="text-ix-muted text-sm mt-1">{data?.leaderboard?.length || 0} published submissions</p>
      </div>

      {/* Top 3 podium */}
      {data?.leaderboard?.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
          {[1, 0, 2].map((idx) => {
            const entry = data.leaderboard[idx];
            if (!entry) return <div key={idx} />;
            const rs = RANK_STYLES[idx + 1] || {};
            const isFirst = idx === 0;
            return (
              <div key={idx} className={`ix-card p-5 text-center border ${rs.ring || "border-ix-border"} ${isFirst ? "py-7" : ""}`}
                style={{ background: rs.glow ? `linear-gradient(180deg,${rs.glow} 0%,transparent 100%)` : undefined }}>
                <div className="text-2xl mb-2">{rs.label}</div>
                <img src={entry.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userId?.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                  className={`w-10 h-10 rounded-xl border ${rs.ring} mx-auto mb-2`} alt="" />
                <Link to={`/u/${entry.userId?.username}`} className="font-display font-semibold text-xs text-ix-white hover:text-ix-primary transition-colors block truncate">
                  {entry.userId?.name}
                </Link>
                <p className={`font-mono font-bold text-lg mt-1 ${rs.text || "text-ix-white"}`}>{entry.finalScore}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="ix-card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-2.5 border-b border-ix-border text-xs font-mono uppercase tracking-widest text-ix-muted">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Developer</div>
          <div className="col-span-2 text-center">AI Score</div>
          <div className="col-span-2 text-center">Admin</div>
          <div className="col-span-2 text-center">Final</div>
        </div>
        <div className="divide-y divide-ix-border">
          {data?.leaderboard?.map((entry) => {
            const isMe = entry.userId?._id === user?._id;
            return (
              <div key={entry._id} className={`grid grid-cols-12 px-5 py-3.5 items-center ${isMe ? "bg-ix-primary/5 border-l-2 border-ix-primary" : "hover:bg-ix-card-hover"} transition-colors`}>
                <div className="col-span-1 font-mono text-sm">
                  {RANK_STYLES[entry.rank] ? <span>{RANK_STYLES[entry.rank].label}</span> : <span className="text-ix-muted">#{entry.rank}</span>}
                </div>
                <div className="col-span-5 flex items-center gap-2.5">
                  <img src={entry.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.userId?.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                    className="w-7 h-7 rounded-lg border border-ix-border flex-shrink-0" alt="" />
                  <div className="min-w-0">
                    <Link to={`/u/${entry.userId?.username}`} className="font-display font-medium text-xs text-ix-white hover:text-ix-primary transition-colors truncate block">
                      {entry.userId?.name}
                      {isMe && <span className="ml-1.5 text-[10px] font-mono text-ix-primary">(you)</span>}
                    </Link>
                    <Link to={`/submissions/${entry._id}`} className="text-[10px] text-ix-muted hover:text-ix-primary font-mono">view →</Link>
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono text-xs text-ix-subtle">{entry.aiScore ?? "—"}</div>
                <div className="col-span-2 text-center font-mono text-xs text-ix-subtle">{entry.adminScore ?? "—"}</div>
                <div className="col-span-2 text-center font-mono font-bold text-ix-white">{entry.finalScore}</div>
              </div>
            );
          })}
          {!data?.leaderboard?.length && (
            <div className="p-12 text-center text-ix-muted">No published results yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
