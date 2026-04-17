import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { username } = useParams();
  const { user: me, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "", githubUsername: "", username: "" });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwn = me?.username === username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/submissions/user/${username}`),
        ]);
        setProfile(uRes.data.user);
        setSubmissions(sRes.data.submissions);
        setEditForm({ name: uRes.data.user.name, bio: uRes.data.user.bio || "", githubUsername: uRes.data.user.githubUsername || "", username: uRes.data.user.username });
      } catch { /* not found */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [username]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put("/users/me/profile", editForm);
      setProfile(r.data.user);
      updateUserProfile(r.data.user);
      setEditing(false);
      toast.success("Profile updated!");
      if (editForm.username !== username) window.location.href = `/u/${editForm.username}`;
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success("Profile link copied!");
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      <div className="ix-card p-8"><div className="skeleton h-16 w-16 rounded-xl mb-4" /><div className="skeleton h-6 w-48 mb-2" /><div className="skeleton h-4 w-72" /></div>
    </div>
  );

  if (!profile) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-ix-muted font-display text-xl">User not found — <span className="font-mono text-ix-subtle">@{username}</span></p>
      <Link to="/leaderboard" className="btn-ghost mt-4 inline-block">← Leaderboard</Link>
    </div>
  );

  const avatar = profile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=1e1e4e&textColor=ffffff`;
  const isPremiumActive = profile.plan !== "free" && profile.planExpiresAt && new Date() < new Date(profile.planExpiresAt);
  const bestScore = submissions.length ? Math.max(...submissions.map(s => s.finalScore || 0)) : 0;
  const avgScore = submissions.length ? Math.round(submissions.reduce((a, s) => a + (s.finalScore || 0), 0) / submissions.length) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 page-enter">
      {/* Profile card */}
      <div className="ix-card p-7 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(79,70,229,0.06) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />

        <div className="flex flex-col sm:flex-row items-start gap-5 relative">
          <img src={avatar} alt={profile.name} className="w-20 h-20 rounded-2xl border-2 border-ix-border flex-shrink-0" />

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input className="ix-input font-display font-bold text-lg" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your name" />
                <input className="ix-input text-sm font-mono" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value.toLowerCase() })} placeholder="username" />
                <textarea className="ix-input resize-none text-sm" rows={2} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Short bio…" />
                <input className="ix-input text-sm" value={editForm.githubUsername} onChange={e => setEditForm({ ...editForm, githubUsername: e.target.value })} placeholder="GitHub username" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary px-4 py-1.5 text-sm">{saving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setEditing(false)} className="btn-ghost px-4 py-1.5 text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <h1 className="font-display font-bold text-2xl text-ix-white">{profile.name}</h1>
                  {isPremiumActive && <span className="premium-badge">✦ Premium</span>}
                </div>
                <p className="text-ix-muted font-mono text-sm mb-2">@{profile.username}</p>
                {profile.bio && <p className="text-ix-subtle text-sm leading-relaxed mb-3 max-w-lg">{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-4 text-xs text-ix-muted">
                  {profile.githubUsername && (
                    <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ix-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      @{profile.githubUsername}
                    </a>
                  )}
                  <span>Joined {format(new Date(profile.createdAt), "MMM yyyy")}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Share link */}
            <button onClick={copyLink} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
              {copied ? "✓ Copied" : (<><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Share</>)}
            </button>
            {isOwn && !editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ix-border">
          {[{ label: "Projects", value: submissions.length }, { label: "Avg Score", value: avgScore }, { label: "Best Score", value: bestScore }].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-2xl text-ix-white">{s.value}</div>
              <div className="text-xs text-ix-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shareable link bar */}
      <div className="ix-card p-3 mb-6 flex items-center gap-3">
        <span className="text-xs text-ix-muted font-mono flex-shrink-0">Profile URL:</span>
        <code className="text-xs text-ix-primary font-mono flex-1 truncate">{window.location.href}</code>
        <button onClick={copyLink} className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0">{copied ? "✓ Copied" : "Copy"}</button>
      </div>

      {/* Portfolio */}
      <h2 className="font-display font-semibold text-lg text-ix-white mb-4">
        Portfolio <span className="text-ix-muted font-normal text-sm">({submissions.length})</span>
      </h2>

      {submissions.length === 0 ? (
        <div className="ix-card p-10 text-center">
          <p className="text-ix-muted">No published projects yet.</p>
          {isOwn && <Link to="/challenges" className="btn-primary mt-4 inline-block">Browse Challenges →</Link>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {submissions.map(sub => (
            <Link key={sub._id} to={`/submissions/${sub._id}`} className="ix-card-hover p-5 block">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className={`badge-${sub.assignmentId?.difficulty} mb-2 inline-block`}>{sub.assignmentId?.difficulty}</span>
                  <p className="font-display font-semibold text-sm text-ix-white leading-snug">{sub.assignmentId?.title}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="font-display font-bold text-xl text-ix-white">{sub.finalScore}</div>
                  <div className="text-[10px] font-mono text-ix-muted">final</div>
                </div>
              </div>
              <p className="text-xs text-ix-muted line-clamp-2 leading-relaxed mb-3">{sub.description}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-ix-muted pt-3 border-t border-ix-border">
                <span>AI: {sub.aiScore ?? "—"}</span>
                <span>Rank #{sub.rank}</span>
                <Link to={`/leaderboard/challenge/${sub.assignmentId?._id}`} onClick={e => e.stopPropagation()} className="text-ix-primary hover:underline">leaderboard →</Link>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
