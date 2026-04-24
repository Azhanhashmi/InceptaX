import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, isPast } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DiffBadge = ({ d }) => {
  const cls = { easy: "ox-badge-easy", medium: "ox-badge-medium", hard: "ox-badge-hard" };
  return <span className={cls[d] || "ox-badge-free"}>{d}</span>;
};

const ChallengeCard = ({ a, i, isPremiumActive }) => {
  const expired = isPast(new Date(a.deadline));
  const locked = a.isPremium && !isPremiumActive;

  return (
    <Link to={`/challenges/${a._id}`} style={{
      display: "flex", flexDirection: "column", padding: "22px", borderRadius: "14px",
      background: "var(--ox-card)", border: "1px solid var(--ox-border)",
      textDecoration: "none", transition: "all .22s", height: "100%",
      animationDelay: `${i * 40}ms`, animation: "fadeUp 0.4s ease forwards",
      position: "relative", overflow: "hidden"
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.25)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,0.5)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ox-border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

      {locked && (
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <span className="ox-badge-premium">✦ Premium</span>
        </div>
      )}

      <div style={{ flex: 1 }}>
        {a.coverImage && (
          <div style={{ width: "100%", height: "110px", borderRadius: "10px", marginBottom: "14px", overflow: "hidden" }}>
            <img src={a.coverImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
          </div>
        )}

        <div className="flex items-center gap-2" style={{ marginBottom: "10px", flexWrap: "wrap" }}>
          <DiffBadge d={a.difficulty} />
          {a.prize && <span style={{ fontSize: "11.5px", fontFamily: "'JetBrains Mono',monospace", color: "#FBBF24" }}>🏆 {a.prize}</span>}
        </div>

        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "15px", lineHeight: 1.35, marginBottom: "8px" }}>
          {a.title}
        </h3>

        <p style={{ fontSize: "12.5px", color: "var(--ox-muted)", lineHeight: 1.65, marginBottom: "14px", fontWeight: 300 }}>
          {a.description?.slice(0, 100)}{a.description?.length > 100 ? "…" : ""}
        </p>

        {a.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5" style={{ marginBottom: "12px" }}>
            {a.tags.slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", color: "var(--ox-muted)", border: "1px solid var(--ox-border)" }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between" style={{ paddingTop: "12px", borderTop: "1px solid var(--ox-border)", marginTop: "auto" }}>
        <span style={{ fontSize: "11.5px", color: "var(--ox-muted)" }}>{a.submissionsCount} built</span>
        <span style={{ fontSize: "11.5px", color: expired ? "#F87171" : "var(--ox-orange)" }}>
          {expired ? "Ended" : formatDistanceToNow(new Date(a.deadline), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
};

export default function Challenges() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [showPremium, setShowPremium] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isPremiumActive = user && user.plan !== "free" && user.planExpiresAt && new Date() < new Date(user.planExpiresAt);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (diff !== "all") params.difficulty = diff;
        if (showPremium !== "all") { params.premium = showPremium === "premium"; }
        const res = await api.get("/assignments", { params });
        setAssignments(res.data.assignments || []);
        setTotalPages(res.data.pages || 1);
      } catch (err) { console.error("API ERROR:", err); }
      finally { setLoading(false); }
    };
    fetchAssignments();
  }, [search, diff, showPremium, page]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "30px", color: "var(--ox-text)", marginBottom: "6px" }}>Challenges</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "14px" }}>Pick a challenge, build something great, get ranked.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3" style={{ marginBottom: "28px" }}>
        <input className="ox-input" style={{ flex: 1, padding: "10px 16px" }} placeholder="Search challenges..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <div className="flex gap-2 flex-wrap">
          {["all", "easy", "medium", "hard"].map((d) => (
            <button key={d} onClick={() => { setDiff(d); setPage(1); }} style={{
              padding: "9px 14px", borderRadius: "10px", fontSize: "12px",
              fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: "pointer",
              textTransform: "capitalize", transition: "all .2s",
              background: diff === d ? "var(--ox-orange)" : "none",
              color: diff === d ? "#fff" : "var(--ox-muted)",
              border: diff === d ? "1px solid transparent" : "1px solid var(--ox-border)",
              boxShadow: diff === d ? "0 2px 12px rgba(255,107,0,0.28)" : "none"
            }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "220px" }} />)}
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--ox-muted)", padding: "80px 0", fontSize: "14px" }}>No challenges found</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assignments.map((a, i) => (
              <ChallengeCard key={a._id} a={a} i={i} isPremiumActive={isPremiumActive} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4" style={{ marginTop: "40px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="ox-btn-ghost" style={{ fontSize: "13px", padding: "8px 18px" }}>← Prev</button>
              <span style={{ display: "flex", alignItems: "center", color: "var(--ox-muted)", fontSize: "13px", fontFamily: "'JetBrains Mono',monospace" }}>{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="ox-btn-ghost" style={{ fontSize: "13px", padding: "8px 18px" }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
