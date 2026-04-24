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
      } catch { }
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
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 16px" }}>
      <div className="ox-card" style={{ padding: "32px" }}>
        <div className="ox-skeleton" style={{ height: "64px", width: "64px", borderRadius: "14px", marginBottom: "16px" }} />
        <div className="ox-skeleton" style={{ height: "22px", width: "180px", marginBottom: "8px" }} />
        <div className="ox-skeleton" style={{ height: "14px", width: "280px" }} />
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
      <p style={{ color: "var(--ox-muted)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "18px" }}>User not found — <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-subtle)" }}>@{username}</span></p>
      <Link to="/leaderboard" className="ox-btn-ghost" style={{ display: "inline-flex", marginTop: "16px", fontSize: "13px" }}>← Leaderboard</Link>
    </div>
  );

  const avatar = profile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}&backgroundColor=FF6B00&textColor=ffffff`;
  const isPremiumActive = profile.plan !== "free" && profile.planExpiresAt && new Date() < new Date(profile.planExpiresAt);
  const bestScore = submissions.length ? Math.max(...submissions.map(s => s.finalScore || 0)) : 0;
  const avgScore = submissions.length ? Math.round(submissions.reduce((a, s) => a + (s.finalScore || 0), 0) / submissions.length) : 0;
  const diffClass = { easy: "ox-badge-easy", medium: "ox-badge-medium", hard: "ox-badge-hard" };

  return (
    <div className="page-enter" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
      {/* Profile card */}
      <div className="ox-card" style={{ padding: "28px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
        {/* subtle orange glow */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="flex flex-col sm:flex-row items-start gap-5" style={{ position: "relative" }}>
          <img src={avatar} alt={profile.name} style={{ width: "76px", height: "76px", borderRadius: "18px", border: "2px solid var(--ox-border)", flexShrink: 0 }} />

          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input className="ox-input" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "17px" }} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your name" />
                <input className="ox-input" style={{ fontSize: "13px", fontFamily: "'JetBrains Mono',monospace" }} value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value.toLowerCase() })} placeholder="username" />
                <textarea className="ox-input" rows={2} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Short bio…" />
                <input className="ox-input" value={editForm.githubUsername} onChange={e => setEditForm({ ...editForm, githubUsername: e.target.value })} placeholder="GitHub username" />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="ox-btn-primary" style={{ fontSize: "12.5px", padding: "8px 16px" }}>{saving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setEditing(false)} className="ox-btn-ghost" style={{ fontSize: "12.5px", padding: "8px 16px" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 flex-wrap" style={{ marginBottom: "4px" }}>
                  <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--ox-text)" }}>{profile.name}</h1>
                  {isPremiumActive && <span className="ox-premium-badge">✦ Premium</span>}
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace", marginBottom: "8px" }}>@{profile.username}</p>
                {profile.bio && <p style={{ fontSize: "13.5px", color: "var(--ox-muted)", lineHeight: 1.75, marginBottom: "12px", maxWidth: "480px", fontWeight: 300 }}>{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-4" style={{ fontSize: "12px", color: "var(--ox-muted)" }}>
                  {profile.githubUsername && (
                    <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--ox-muted)", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--ox-text)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--ox-muted)"}>
                      <svg style={{ width: "13px", height: "13px" }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      @{profile.githubUsername}
                    </a>
                  )}
                  <span>Joined {format(new Date(profile.createdAt), "MMM yyyy")}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={copyLink} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "7px 12px", gap: "6px" }}>
              {copied ? "✓ Copied" : (
                <><svg style={{ width: "12px", height: "12px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Share</>
              )}
            </button>
            {isOwn && !editing && (
              <button onClick={() => setEditing(true)} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "7px 12px" }}>Edit</button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4" style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--ox-border)" }}>
          {[{ label: "Projects", value: submissions.length }, { label: "Avg Score", value: avgScore }, { label: "Best Score", value: bestScore }].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--ox-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile URL bar */}
      <div className="ox-card" style={{ padding: "12px 16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "11px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>Profile URL:</span>
        <code style={{ fontSize: "11.5px", color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{window.location.href}</code>
        <button onClick={copyLink} className="ox-btn-ghost" style={{ flexShrink: 0, fontSize: "11.5px", padding: "5px 12px" }}>{copied ? "✓ Copied" : "Copy"}</button>
      </div>

      {/* Portfolio */}
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--ox-text)", marginBottom: "14px" }}>
        Portfolio <span style={{ color: "var(--ox-muted)", fontWeight: 400, fontSize: "13px" }}>({submissions.length})</span>
      </h2>

      {submissions.length === 0 ? (
        <div className="ox-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--ox-muted)", fontSize: "14px" }}>No published projects yet.</p>
          {isOwn && <Link to="/challenges" className="ox-btn-primary" style={{ display: "inline-flex", marginTop: "16px", fontSize: "13px" }}>Browse Challenges →</Link>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {submissions.map(sub => (
            <Link key={sub._id} to={`/submissions/${sub._id}`} className="ox-card-hover" style={{ padding: "20px", display: "block", textDecoration: "none" }}>
              <div className="flex items-start justify-between gap-3" style={{ marginBottom: "12px" }}>
                <div>
                  <span className={diffClass[sub.assignmentId?.difficulty] || "ox-badge-free"} style={{ marginBottom: "8px", display: "inline-flex" }}>{sub.assignmentId?.difficulty}</span>
                  <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "13.5px", color: "var(--ox-text)", lineHeight: 1.3 }}>{sub.assignmentId?.title}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)" }}>{sub.finalScore}</div>
                  <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)" }}>final</div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--ox-muted)", lineHeight: 1.65, marginBottom: "12px", fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{sub.description}</p>
              <div className="flex items-center justify-between" style={{ fontSize: "10.5px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", paddingTop: "12px", borderTop: "1px solid var(--ox-border)" }}>
                <span>AI: {sub.aiScore ?? "—"}</span>
                <span>Rank #{sub.rank}</span>
                <Link to={`/leaderboard/challenge/${sub.assignmentId?._id}`} onClick={e => e.stopPropagation()} style={{ color: "var(--ox-orange)", textDecoration: "none" }}>leaderboard →</Link>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
