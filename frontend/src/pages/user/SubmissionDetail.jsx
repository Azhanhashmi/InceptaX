import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function SubmissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  useEffect(() => {
    api.get(`/submissions/${id}`).then(r => setSub(r.data.submission)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const isTeamMember = sub && (
    sub.userId?._id === user?._id ||
    sub.teamMembers?.some(m => m._id === user?._id || m === user?._id)
  );

  // Load chat + socket if premium team member
  useEffect(() => {
    if (!sub || !isPremiumActive || !isTeamMember) return;
    api.get(`/chat/${id}`).then(r => setMessages(r.data.messages)).catch(() => {});

    const socket = io("/", { path: "/socket.io" });
    socketRef.current = socket;
    socket.emit("join_room", id);
    socket.on("new_message", (msg) => setMessages(prev => [...prev, msg]));
    return () => { socket.emit("leave_room", id); socket.disconnect(); };
  }, [sub, isPremiumActive, isTeamMember, id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await api.post(`/chat/${id}`, { text: msgText });
      setMsgText("");
    } catch (err) { toast.error(err.response?.data?.message || "Send failed"); }
    finally { setSendingMsg(false); }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 space-y-3"><div className="ix-card h-40 skeleton" /><div className="ix-card h-60 skeleton" /></div>;
  if (!sub) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-ix-muted">Submission not found.</div>;

  const { aiFeedback } = sub;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <Link to={`/challenges/${sub.assignmentId?._id}`} className="text-xs font-mono text-ix-muted hover:text-ix-subtle flex items-center gap-1 mb-6">
        ← {sub.assignmentId?.title}
      </Link>

      {/* Header */}
      <div className="ix-card p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img src={sub.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.userId?.name}&backgroundColor=1e1e4e&textColor=ffffff`}
              className="w-11 h-11 rounded-xl border border-ix-border" alt="" />
            <div>
              <Link to={`/u/${sub.userId?.username}`} className="font-display font-semibold text-ix-white hover:text-ix-primary transition-colors">{sub.userId?.name}</Link>
              <p className="text-xs text-ix-muted font-mono">@{sub.userId?.username}</p>
            </div>
          </div>
          {sub.status === "published" && (
            <div className="text-right">
              <div className="font-display font-bold text-2xl text-ix-white">{sub.finalScore}</div>
              <div className="text-[10px] font-mono text-ix-muted">Rank #{sub.rank}</div>
            </div>
          )}
        </div>

        <p className="text-ix-subtle text-sm leading-relaxed mb-4">{sub.description}</p>

        {/* Team members */}
        {sub.teamMembers?.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-ix-muted">Team:</span>
            {sub.teamMembers.map(m => (
              <Link key={m._id} to={`/u/${m.username}`} className="text-xs text-ix-primary hover:underline font-mono">@{m.username}</Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a href={sub.repoLink} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub Repo
          </a>
          {sub.liveLink && <a href={sub.liveLink} target="_blank" rel="noreferrer" className="btn-ghost text-xs px-3 py-1.5">🔗 Live Demo</a>}
          <Link to={`/leaderboard/challenge/${sub.assignmentId?._id}`} className="btn-ghost text-xs px-3 py-1.5">🏆 Rankings</Link>
        </div>
      </div>

      {/* Pending */}
      {sub.status === "pending" && (
        <div className="ix-card p-8 text-center mb-5">
          <div className="w-8 h-8 border-2 border-ix-border border-t-ix-primary rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-display font-semibold text-ix-white mb-2">Awaiting Admin Review</h3>
          <p className="text-ix-muted text-sm">The admin will evaluate your project and publish results.</p>
        </div>
      )}

      {/* AI Feedback */}
      {sub.status === "published" && aiFeedback?.strengths?.length > 0 && (
        <div className="ix-card p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-ix-primary/20 flex items-center justify-center text-xs">🤖</div>
            <h2 className="font-display font-semibold text-ix-white">AI Evaluation</h2>
            <span className="font-mono font-bold text-lg text-ix-white ml-auto">{sub.aiScore}/100</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: "strengths", label: "Strengths", color: "emerald", icon: "✓" },
              { key: "weaknesses", label: "Weaknesses", color: "red", icon: "⚠" },
              { key: "suggestions", label: "Suggestions", color: "blue", icon: "→" },
            ].map(({ key, label, color, icon }) => (
              <div key={key} className={`rounded-xl p-4 bg-${color}-500/5 border border-${color}-500/20`}>
                <p className={`text-${color}-400 text-xs font-display font-semibold mb-2`}>{icon} {label}</p>
                <ul className="space-y-1.5">{(aiFeedback[key] || []).map((s, i) => <li key={i} className="text-xs text-ix-muted leading-relaxed">{s}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-ix-border text-xs font-mono text-ix-muted flex gap-4">
            <span>AI 70%: {sub.aiScore}</span>
            <span>Admin 30%: {sub.adminScore ?? "N/A"}</span>
            <span className="text-ix-primary font-bold">Final: {sub.finalScore}</span>
          </div>
        </div>
      )}

      {/* Team Chat (premium only) */}
      {isTeamMember && (
        <div className="ix-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-ix-border flex items-center gap-2">
            <span className="text-sm font-display font-semibold text-ix-white">Team Chat</span>
            {!isPremiumActive && <span className="badge-premium text-[10px]">✦ Premium required</span>}
          </div>
          {isPremiumActive ? (
            <>
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-xs text-ix-muted text-center pt-8">No messages yet. Start the conversation!</p>}
                {messages.map(msg => {
                  const isMe = msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                      <img src={msg.senderId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderId?.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                        className="w-6 h-6 rounded-lg border border-ix-border flex-shrink-0" alt="" />
                      <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${isMe ? "bg-ix-primary text-white" : "bg-ix-surface text-ix-text border border-ix-border"}`}>
                        {!isMe && <p className="font-mono text-[10px] mb-1 opacity-60">@{msg.senderId?.username}</p>}
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-ix-border flex gap-2">
                <input className="ix-input flex-1 text-xs py-2" placeholder="Type a message…" value={msgText} onChange={e => setMsgText(e.target.value)} />
                <button type="submit" disabled={sendingMsg || !msgText.trim()} className="btn-primary px-4 py-2 text-xs disabled:opacity-40">Send</button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-ix-muted text-sm mb-3">Upgrade to premium to chat with your team</p>
              <Link to="/pricing" className="btn-brand text-xs px-4 py-2">Upgrade →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
