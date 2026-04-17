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

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 space-y-3"><div className="ix-card h-48 skeleton" /></div>;
  if (!assignment) return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-ix-muted">Challenge not found.</div>;

  const expired = isPast(new Date(assignment.deadline));
  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);
  const canSubmit = user && !mySubmission && !expired && (!assignment.isPremium || isPremiumActive);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <Link to="/challenges" className="text-xs font-mono text-ix-muted hover:text-ix-subtle flex items-center gap-1 mb-6">← Challenges</Link>

      <div className="ix-card p-7 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`badge-${assignment.difficulty}`}>{assignment.difficulty}</span>
              {assignment.isPremium && <span className="badge-premium">✦ Premium</span>}
              {assignment.prize && <span className="text-xs font-mono text-ix-gold">🏆 {assignment.prize}</span>}
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ix-white leading-tight">{assignment.title}</h1>
          </div>
          <div className="flex gap-2">
            {canSubmit && <Link to={`/challenges/${id}/submit`} className="btn-brand px-5 py-2.5">Submit →</Link>}
            {mySubmission && <Link to={`/submissions/${mySubmission._id}`} className="btn-ghost">My Submission</Link>}
            {!user && <Link to="/login" className="btn-brand px-5 py-2.5">Sign in to Submit</Link>}
            {assignment.isPremium && !isPremiumActive && user && (
              <Link to="/pricing" className="btn-ghost text-ix-premium border-ix-premium/30">✦ Upgrade to Submit</Link>
            )}
          </div>
        </div>

        <p className="text-ix-subtle text-sm sm:text-base leading-relaxed mb-5">{assignment.description}</p>

        {assignment.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {assignment.tags.map(t => <span key={t} className="text-xs font-mono bg-ix-primary/10 text-ix-primary border border-ix-primary/20 px-2.5 py-1 rounded-lg">{t}</span>)}
          </div>
        )}

        <div className="flex flex-wrap gap-5 text-xs text-ix-muted font-mono pt-4 border-t border-ix-border">
          <span>Deadline: <span className={expired ? "text-red-400" : "text-ix-warning"}>
            {format(new Date(assignment.deadline), "MMM d, yyyy")}
            {!expired && ` (${formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })})`}
          </span></span>
          <span>{assignment.submissionsCount} submissions</span>
        </div>
      </div>

      {/* Mini leaderboard */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-ix-white">Top Submissions</h2>
        <Link to={`/leaderboard/challenge/${id}`} className="text-xs text-ix-primary hover:underline font-mono">View all →</Link>
      </div>
      {topSubs.length === 0 ? (
        <div className="ix-card p-8 text-center text-ix-muted text-sm">No published submissions yet. Be the first!</div>
      ) : (
        <div className="ix-card overflow-hidden">
          {topSubs.map((sub, i) => (
            <Link key={sub._id} to={`/submissions/${sub._id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ix-card-hover transition-colors border-b border-ix-border last:border-0 group">
              <span className="text-base w-6 text-center flex-shrink-0">{["🥇", "🥈", "🥉"][i] || `#${i + 1}`}</span>
              <img src={sub.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.userId?.name}&backgroundColor=1e1e4e&textColor=ffffff`} className="w-7 h-7 rounded-lg border border-ix-border flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium text-xs text-ix-white truncate">{sub.userId?.name}</p>
                <p className="text-[10px] text-ix-muted truncate">{sub.description?.slice(0, 60)}…</p>
              </div>
              <span className="font-mono font-bold text-ix-white text-sm flex-shrink-0">{sub.finalScore}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
