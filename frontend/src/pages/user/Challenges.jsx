import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, isPast } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ---------------- BADGE ---------------- */
const DiffBadge = ({ d }) => {
  const styles = {
    easy: "bg-green-500/10 text-green-400",
    medium: "bg-yellow-500/10 text-yellow-400",
    hard: "bg-red-500/10 text-red-400",
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] rounded-md font-medium ${styles[d]}`}>
      {d}
    </span>
  );
};

/* ---------------- CARD ---------------- */
const ChallengeCard = ({ a, i, isPremiumActive }) => {
  const expired = isPast(new Date(a.deadline));
  const locked = a.isPremium && !isPremiumActive;

  return (
    <Link
      to={`/challenges/${a._id}`}
      className="group relative h-full flex flex-col p-5 rounded-2xl border border-white/10 bg-[#0B0F19] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20"
      style={{
        animationDelay: `${i * 40}ms`,
        animation: "fadeUp 0.4s ease forwards",
      }}
    >
      {/* PREMIUM BADGE */}
      {locked && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-400">
            ✦ Premium
          </span>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {a.coverImage && (
            <div className="w-full h-28 rounded-lg mb-4 overflow-hidden">
              <img
                src={a.coverImage}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <DiffBadge d={a.difficulty} />
            {a.prize && (
              <span className="text-xs font-mono text-yellow-400">
                🏆 {a.prize}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-white text-base leading-tight mb-2 line-clamp-2">
            {a.title}
          </h3>

          <p className="text-sm text-white/70 mb-4 line-clamp-3">
            {a.description}
          </p>

          {a.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {a.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/70 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <span className="text-xs text-white/60">
            {a.submissionsCount} built
          </span>

          <span
            className={`text-xs ${
              expired ? "text-red-400" : "text-orange-400"
            }`}
          >
            {expired
              ? "Ended"
              : formatDistanceToNow(new Date(a.deadline), {
                  addSuffix: true,
                })}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ---------------- MAIN PAGE ---------------- */
export default function Challenges() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("all");
  const [showPremium, setShowPremium] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isPremiumActive =
    user &&
    user.plan !== "free" &&
    user.planExpiresAt &&
    new Date() < new Date(user.planExpiresAt);

  /* -------- FETCH -------- */
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const params = { page, limit: 12 };
        if (search) params.search = search;
        if (diff !== "all") params.difficulty = diff;
        if (showPremium !== "all") {
          params.premium = showPremium === "premium";
        }

        const res = await api.get("/assignments", { params });

        setAssignments(res.data.assignments || []);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        console.error("API ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [search, diff, showPremium, page]);

  /* -------- UI -------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-white/60">
          Pick a challenge, build something great, get ranked.
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-7">
        <input
          className="flex-1 px-4 py-2 rounded-lg bg-[#0B0F19] border border-white/10 text-white placeholder:text-white/40"
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="flex gap-2 flex-wrap">
          {["all", "easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => {
                setDiff(d);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs capitalize ${
                diff === d
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/60"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-white/5 animate-pulse" />
            ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center text-white/50 py-20">
          No challenges found
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {assignments.map((a, i) => (
              <ChallengeCard
                key={a._id}
                a={a}
                i={i}
                isPremiumActive={isPremiumActive}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-white/60"
              >
                ← Prev
              </button>
              <span className="text-white/60">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-white/60"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}