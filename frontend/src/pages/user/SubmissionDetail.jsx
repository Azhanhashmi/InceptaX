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

  if (loading) return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="ox-skeleton" style={{ height: "160px" }} />
      <div className="ox-skeleton" style={{ height: "240px" }} />
    </div>
  );
  if (!sub) return <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 16px", textAlign: "center", color: "var(--ox-muted)" }}>Submission not found.</div>;

  const { aiFeedback } = sub;

  return (
    <div className="page-enter" style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 16px" }}>
      <Link to={`/challenges/${sub.assignmentId?._id}`} style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>
        ← {sub.assignmentId?.title}
      </Link>

      {/* Header card */}
      <div className="ox-card" style={{ padding: "24px", marginBottom: "18px" }}>
        <div className="flex items-start justify-between gap-4" style={{ marginBottom: "16px" }}>
          <div className="flex items-center gap-3">
            <img src={sub.userId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.userId?.name}&backgroundColor=FF6B00&textColor=ffffff`}
              style={{ width: "44px", height: "44px", borderRadius: "12px", border: "1px solid var(--ox-border)" }} alt="" />
            <div>
              <Link to={`/u/${sub.userId?.username}`} style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", textDecoration: "none", fontSize: "15px" }}>{sub.userId?.name}</Link>
              <p style={{ fontSize: "12px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>@{sub.userId?.username}</p>
            </div>
          </div>
          {sub.status === "published" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "28px", color: "var(--ox-text)" }}>{sub.finalScore}</div>
              <div style={{ fontSize: "10.5px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)" }}>Rank #{sub.rank}</div>
            </div>
          )}
        </div>

        <p style={{ color: "var(--ox-muted)", fontSize: "14px", lineHeight: 1.75, marginBottom: "16px", fontWeight: 300 }}>{sub.description}</p>

        {sub.teamMembers?.length > 0 && (
          <div className="flex items-center gap-2" style={{ marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--ox-muted)" }}>Team:</span>
            {sub.teamMembers.map(m => (
              <Link key={m._id} to={`/u/${m.username}`} style={{ fontSize: "12px", color: "var(--ox-orange)", textDecoration: "none", fontFamily: "'JetBrains Mono',monospace" }}>@{m.username}</Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a href={sub.repoLink} target="_blank" rel="noreferrer" className="ox-btn-ghost" style={{ fontSize: "12px", padding: "7px 14px", gap: "6px" }}>
            <svg style={{ width: "12px", height: "12px" }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub Repo
          </a>
          {sub.liveLink && <a href={sub.liveLink} target="_blank" rel="noreferrer" className="ox-btn-ghost" style={{ fontSize: "12px", padding: "7px 14px" }}>🔗 Live Demo</a>}
          <Link to={`/leaderboard/challenge/${sub.assignmentId?._id}`} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "7px 14px" }}>🏆 Rankings</Link>
        </div>
      </div>

      {/* Pending */}
      {sub.status === "pending" && (
        <div className="ox-card" style={{ padding: "36px", textAlign: "center", marginBottom: "18px" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid var(--ox-border)", borderTop: "2px solid var(--ox-orange)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "16px", marginBottom: "8px" }}>Awaiting Admin Review</h3>
          <p style={{ color: "var(--ox-muted)", fontSize: "13.5px", fontWeight: 300 }}>The admin will evaluate your project and publish results.</p>
        </div>
      )}

      {/* AI Feedback */}
      {sub.status === "published" && aiFeedback?.strengths?.length > 0 && (
        <div className="ox-card" style={{ padding: "24px", marginBottom: "18px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "20px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--ox-orange-lo)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "15px" }}>AI Evaluation</h2>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)", marginLeft: "auto" }}>{sub.aiScore}/100</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3" style={{ marginBottom: "16px" }}>
            {[
              { key: "strengths", label: "Strengths", color: "#34D399", bgColor: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.18)", icon: "✓" },
              { key: "weaknesses", label: "Weaknesses", color: "#F87171", bgColor: "rgba(248,113,113,0.06)", borderColor: "rgba(248,113,113,0.18)", icon: "⚠" },
              { key: "suggestions", label: "Suggestions", color: "#60a5fa", bgColor: "rgba(96,165,250,0.06)", borderColor: "rgba(96,165,250,0.18)", icon: "→" },
            ].map(({ key, label, color, bgColor, borderColor, icon }) => (
              <div key={key} style={{ borderRadius: "12px", padding: "16px", background: bgColor, border: `1px solid ${borderColor}` }}>
                <p style={{ color, fontSize: "12px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, marginBottom: "10px" }}>{icon} {label}</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {(aiFeedback[key] || []).map((s, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "var(--ox-muted)", lineHeight: 1.6, fontWeight: 300 }}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex gap-4" style={{ paddingTop: "12px", borderTop: "1px solid var(--ox-border)", fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)" }}>
            <span>AI 70%: {sub.aiScore}</span>
            <span>Admin 30%: {sub.adminScore ?? "N/A"}</span>
            <span style={{ color: "var(--ox-orange)", fontWeight: 700 }}>Final: {sub.finalScore}</span>
          </div>
        </div>
      )}

      {/* Team Chat */}
      {isTeamMember && (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--ox-border)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "14px" }}>Team Chat</span>
            {!isPremiumActive && <span className="ox-badge-premium" style={{ fontSize: "10px" }}>✦ Premium required</span>}
          </div>

          {isPremiumActive ? (
            <>
              <div style={{ height: "256px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.length === 0 && <p style={{ fontSize: "12px", color: "var(--ox-muted)", textAlign: "center", paddingTop: "32px" }}>No messages yet. Start the conversation!</p>}
                {messages.map(msg => {
                  const isMe = msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id} style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexDirection: isMe ? "row-reverse" : "row" }}>
                      <img src={msg.senderId?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderId?.name}&backgroundColor=FF6B00&textColor=ffffff`}
                        style={{ width: "24px", height: "24px", borderRadius: "7px", border: "1px solid var(--ox-border)", flexShrink: 0 }} alt="" />
                      <div style={{
                        maxWidth: "72%", padding: "8px 12px", borderRadius: "12px", fontSize: "12.5px",
                        background: isMe ? "var(--ox-orange)" : "#111",
                        color: isMe ? "#fff" : "var(--ox-text)",
                        border: isMe ? "none" : "1px solid var(--ox-border)"
                      }}>
                        {!isMe && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", marginBottom: "4px", opacity: 0.6 }}>@{msg.senderId?.username}</p>}
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: "12px 16px", borderTop: "1px solid var(--ox-border)", display: "flex", gap: "8px" }}>
                <input className="ox-input" style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }} placeholder="Type a message…" value={msgText} onChange={e => setMsgText(e.target.value)} />
                <button type="submit" disabled={sendingMsg || !msgText.trim()} className="ox-btn-primary" style={{ padding: "8px 16px", fontSize: "12.5px", opacity: (sendingMsg || !msgText.trim()) ? 0.4 : 1 }}>Send</button>
              </form>
            </>
          ) : (
            <div style={{ padding: "36px", textAlign: "center" }}>
              <p style={{ color: "var(--ox-muted)", fontSize: "13.5px", marginBottom: "14px" }}>Upgrade to premium to chat with your team</p>
              <Link to="/pricing" className="ox-btn-primary" style={{ fontSize: "12.5px", padding: "9px 20px" }}>Upgrade →</Link>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
