import { useState, useEffect } from "react";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  pending:        { color: "var(--ox-muted)", bg: "rgba(255,255,255,0.04)", border: "var(--ox-border)" },
  ai_evaluated:   { color: "#FBBF24", bg: "rgba(251,191,36,0.07)", border: "rgba(251,191,36,0.25)" },
  admin_reviewed: { color: "#60a5fa", bg: "rgba(96,165,250,0.07)", border: "rgba(96,165,250,0.25)" },
  published:      { color: "#34D399", bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.25)" },
  rejected:       { color: "#F87171", bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)" },
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ adminScore: "", adminNote: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = filter !== "all" ? `?status=${filter}` : "";
      const res = await adminApi.get(`/submissions${q}`);
      setSubmissions(res.data.submissions);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const triggerAI = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.post(`/submissions/${id}/evaluate`);
      toast.success("AI evaluation complete!");
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Evaluation failed"); }
    finally { setActionLoading(null); }
  };

  const review = async (id, action) => {
    setActionLoading(`review_${id}`);
    try {
      await adminApi.patch(`/submissions/${id}/review`, {
        adminScore: reviewForm.adminScore ? parseInt(reviewForm.adminScore) : undefined,
        adminNote: reviewForm.adminNote, action,
      });
      toast.success(action === "publish" ? "Published!" : action === "reject" ? "Rejected" : "Saved");
      setSelected(null); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Action failed"); }
    finally { setActionLoading(null); }
  };

  const filtered = submissions;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Submissions</h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>Evaluate and publish project results</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: "24px" }}>
        {["all", "pending", "ai_evaluated", "admin_reviewed", "published", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "7px 14px", borderRadius: "9px", fontSize: "11.5px",
            fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, cursor: "pointer",
            textTransform: "capitalize", transition: "all .2s",
            background: filter === s ? "var(--ox-orange)" : "none",
            color: filter === s ? "#fff" : "var(--ox-muted)",
            border: filter === s ? "1px solid transparent" : "1px solid var(--ox-border)",
            boxShadow: filter === s ? "0 2px 10px rgba(255,107,0,0.25)" : "none"
          }}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(5).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "64px" }} />)}</div>
      ) : (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          {filtered.map((sub, idx) => {
            const ss = STATUS_STYLES[sub.status] || STATUS_STYLES.pending;
            return (
              <div key={sub._id} style={{ padding: "16px 20px", transition: "background .2s", borderBottom: idx < filtered.length - 1 ? "1px solid var(--ox-border)" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0e0e0e"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <div className="flex items-start justify-between gap-4">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "4px" }}>
                      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px", color: "var(--ox-text)" }}>{sub.userId?.name}</span>
                      <span style={{ fontSize: "11px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>@{sub.userId?.username}</span>
                      <span style={{ fontSize: "10.5px", fontFamily: "'JetBrains Mono',monospace", padding: "2px 8px", borderRadius: "100px", color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--ox-muted)", marginBottom: "3px" }}>
                      Challenge: <span style={{ color: "var(--ox-subtle)" }}>{sub.assignmentId?.title}</span>
                    </p>
                    <a href={sub.repoLink} target="_blank" rel="noreferrer" style={{ fontSize: "11.5px", color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace", textDecoration: "none" }}>
                      {sub.repoLink?.replace("https://", "")}
                    </a>
                    {sub.status === "ai_evaluated" && (
                      <div style={{ marginTop: "6px", fontSize: "11.5px", fontFamily: "'JetBrains Mono',monospace", color: "#FBBF24" }}>AI Score: {sub.aiScore}/100</div>
                    )}
                    {sub.status === "published" && (
                      <div className="flex items-center gap-3" style={{ marginTop: "4px", fontSize: "11.5px", fontFamily: "'JetBrains Mono',monospace" }}>
                        <span style={{ color: "#34D399" }}>Final: {sub.finalScore}/100</span>
                        <span style={{ color: "var(--ox-muted)" }}>Rank #{sub.rank}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    {sub.status === "pending" && (
                      <button onClick={() => triggerAI(sub._id)} disabled={actionLoading === sub._id}
                        style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "9px", border: "1px solid var(--ox-orange-bd)", color: "var(--ox-orange)", background: "var(--ox-orange-lo)", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, opacity: actionLoading === sub._id ? 0.5 : 1, transition: "all .2s" }}>
                        {actionLoading === sub._id ? "Running AI..." : "🤖 Run AI Eval"}
                      </button>
                    )}
                    {(sub.status === "ai_evaluated" || sub.status === "admin_reviewed") && (
                      <button onClick={() => { setSelected(sub); setReviewForm({ adminScore: sub.adminScore || "", adminNote: sub.adminNote || "" }); }}
                        className="ox-btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>
                        Review
                      </button>
                    )}
                    {sub.aiFeedback?.strengths?.length > 0 && (
                      <button onClick={() => setSelected(sub)} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: "var(--ox-muted)", fontSize: "13.5px" }}>No submissions found.</div>}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="ox-card" style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "28px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "18px" }}>
                {selected.status === "published" ? "View Report" : "Review Submission"}
              </h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--ox-muted)", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>

            {selected.aiFeedback?.strengths?.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", marginBottom: "12px" }}>AI Score: <span style={{ color: "#FBBF24", fontWeight: 700 }}>{selected.aiScore}/100</span></p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Strengths", items: selected.aiFeedback.strengths, color: "#34D399", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.18)" },
                    { label: "Weaknesses", items: selected.aiFeedback.weaknesses, color: "#F87171", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.18)" },
                    { label: "Suggestions", items: selected.aiFeedback.suggestions, color: "#60a5fa", bg: "rgba(96,165,250,0.06)", border: "rgba(96,165,250,0.18)" },
                  ].map(({ label, items, color, bg, border }) => (
                    <div key={label} style={{ borderRadius: "12px", padding: "16px", background: bg, border: `1px solid ${border}` }}>
                      <p style={{ color, fontSize: "12px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, marginBottom: "8px" }}>{label}</p>
                      <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {items?.map((item, i) => <li key={i} style={{ fontSize: "12px", color: "var(--ox-muted)", lineHeight: 1.6 }}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.status !== "published" && selected.status !== "rejected" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="ox-label">Admin Score (0–100)</label>
                  <input type="number" min="0" max="100" className="ox-input"
                    placeholder={`Leave blank to use AI score (${selected.aiScore})`}
                    value={reviewForm.adminScore}
                    onChange={(e) => setReviewForm({ ...reviewForm, adminScore: e.target.value })} />
                </div>
                <div>
                  <label className="ox-label">Internal Note</label>
                  <textarea rows={3} className="ox-input" placeholder="Optional note for your records..."
                    value={reviewForm.adminNote}
                    onChange={(e) => setReviewForm({ ...reviewForm, adminNote: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => review(selected._id, "publish")}
                    disabled={actionLoading === `review_${selected._id}`}
                    className="ox-btn-primary" style={{ flex: 1, padding: "11px", fontSize: "14px" }}>
                    ✓ Publish & Rank
                  </button>
                  <button onClick={() => review(selected._id, "reject")} className="ox-btn-danger" style={{ padding: "11px 20px" }}>Reject</button>
                </div>
              </div>
            )}

            {selected.status === "published" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#34D399", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "15px" }}>Published · Final Score: {selected.finalScore}</p>
                <p style={{ color: "var(--ox-muted)", fontSize: "13px", marginTop: "4px" }}>Rank #{selected.rank}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
