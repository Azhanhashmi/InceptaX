import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, isPast } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DiffBadge = ({ d }) => <span className={`badge-${d}`}>{d}</span>;

export default function Challenges() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [showPremium, setShowPremium] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const p = { page, limit: 12 };
      if (search) p.search = search;
      if (diff !== "all") p.difficulty = diff;
      if (showPremium !== "all") {
        p.premium = showPremium === "premium" ? "true" : "false";
      }

      const r = await api.get("/assignments", { params: p });

      console.log("API RESPONSE:", r.data);

      setAssignments(r.data.assignments);
      setTotalPages(r.data.pages || 1);
    } catch (err) {
      console.log("API ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAssignments();
}, [search, diff, showPremium, page]);

  const isPremiumActive = user && user.plan !== "free" && user.planExpiresAt && new Date() < new Date(user.planExpiresAt);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ix-white mb-2">Challenges</h1>
        <p className="text-ix-muted">Pick a challenge, build something great, get ranked.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ix-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="ix-input pl-10" placeholder="Search challenges…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "easy", "medium", "hard"].map(d => (
            <button key={d} onClick={() => { setDiff(d); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-display font-semibold capitalize transition-all ${diff === d ? "bg-ix-primary text-white" : "border border-ix-border text-ix-muted hover:border-ix-border-bright"}`}>
              {d}
            </button>
          ))}
          <button onClick={() => { setShowPremium(showPremium === "premium" ? "all" : "premium"); setPage(1); }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${showPremium === "premium" ? "bg-ix-premium/20 text-ix-premium border border-ix-premium/40" : "border border-ix-border text-ix-muted hover:border-ix-border-bright"}`}>
            ✦ Premium
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="ix-card h-52 skeleton" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="ix-card p-16 text-center">
          <p className="text-ix-muted font-display text-lg mb-2">No challenges found</p>
          {search && <button onClick={() => setSearch("")} className="text-ix-primary text-sm hover:underline">Clear search</button>}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assignments.map((a, i) => {
              const expired = isPast(new Date(a.deadline));
              const locked = a.isPremium && !isPremiumActive;
              return (
                <Link key={a._id} to={`/challenges/${a._id}`}
                  className="ix-card-hover p-5 block relative"
                  style={{ animationDelay: `${i * 40}ms`, animation: "fadeUp 0.4s ease forwards", opacity: 1 }}>
                  {locked && (
                    <div className="absolute top-3 right-3">
                      <span className="badge-premium">✦ Premium</span>
                    </div>
                  )}
                  {a.coverImage && (
                    <div className="w-full h-28 rounded-lg mb-4 overflow-hidden">
                      <img src={a.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <DiffBadge d={a.difficulty} />
                    {a.prize && <span className="text-xs font-mono text-ix-gold">🏆 {a.prize}</span>}
                  </div>
                  <h3 className="font-display font-semibold text-ix-white text-sm leading-snug mb-2 line-clamp-2">{a.title}</h3>
                  <p className="text-ix-muted text-xs leading-relaxed line-clamp-3 mb-4">{a.description}</p>
                  {a.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {a.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] font-mono bg-ix-primary/10 text-ix-primary border border-ix-primary/20 px-2 py-0.5 rounded-md">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-ix-border">
                    <span className="text-xs text-ix-muted">{a.submissionsCount} built</span>
                    <span className={`text-xs font-mono ${expired ? "text-red-400" : "text-ix-warning"}`}>
                      {expired ? "Ended" : formatDistanceToNow(new Date(a.deadline), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-30">← Prev</button>
              <span className="text-xs text-ix-muted font-mono">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost disabled:opacity-30">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
