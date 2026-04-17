import { useState, useEffect } from "react";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending: "text-ix-muted border-ix-border",
  ai_evaluated: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  admin_reviewed: "text-blue-400 border-blue-500/30 bg-blue-500/5",
  published: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  rejected: "text-red-400 border-red-500/30 bg-red-500/5",
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ adminScore: "", adminNote: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const q = filter !== "all" ? `?status=${filter}` : "";
      const res = await adminApi.get(`/submissions${q}`);
      setSubmissions(res.data.submissions);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const triggerAI = async (id) => {
    setActionLoading(id);
    try {
      await adminApi.post(`/submissions/${id}/evaluate`);
      toast.success("AI evaluation complete!");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation failed");
    } finally { setActionLoading(null); }
  };

  const review = async (id, action) => {
    setActionLoading(`review_${id}`);
    try {
      await adminApi.patch(`/submissions/${id}/review`, {
        adminScore: reviewForm.adminScore ? parseInt(reviewForm.adminScore) : undefined,
        adminNote: reviewForm.adminNote,
        action,
      });
      toast.success(action === "publish" ? "Published!" : action === "reject" ? "Rejected" : "Saved");
      setSelected(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setActionLoading(null); }
  };

  const filtered = submissions;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-white">Submissions</h1>
          <p className="text-ix-muted text-sm mt-0.5">Evaluate and publish project results</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "ai_evaluated", "admin_reviewed", "published", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium capitalize transition-all ${filter === s ? "bg-ix-primary text-white" : "border border-ix-border text-ix-muted hover:border-ix-border-bright"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="ix-card h-16 skeleton" />)}</div>
      ) : (
        <div className="ix-card overflow-hidden">
          <div className="divide-y divide-ix-border">
            {filtered.map((sub) => (
              <div key={sub._id} className="p-4 hover:bg-ix-card-hover transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-display font-semibold text-sm text-ix-white">
                        {sub.userId?.name}
                      </span>
                      <span className="text-ix-muted text-xs font-mono">@{sub.userId?.username}</span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[sub.status] || ""}`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-ix-muted text-xs mb-1">
                      Challenge: <span className="text-ix-subtle">{sub.assignmentId?.title}</span>
                    </p>
                    <a href={sub.repoLink} target="_blank" rel="noreferrer" className="text-ix-primary text-xs font-mono hover:underline">
                      {sub.repoLink.replace("https://", "")}
                    </a>
                    {sub.status === "ai_evaluated" && (
                      <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                        <span className="text-amber-400">AI Score: {sub.aiScore}/100</span>
                      </div>
                    )}
                    {sub.status === "published" && (
                      <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                        <span className="text-emerald-400">Final: {sub.finalScore}/100</span>
                        <span className="text-ix-muted">Rank #{sub.rank}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    {sub.status === "pending" && (
                      <button onClick={() => triggerAI(sub._id)}
                        disabled={actionLoading === sub._id}
                        className="text-xs font-display font-medium px-3 py-1.5 rounded-lg border border-ix-primary/40 text-ix-primary hover:bg-ix-primary/10 transition-all disabled:opacity-50">
                        {actionLoading === sub._id ? "Running AI..." : "🤖 Run AI Eval"}
                      </button>
                    )}
                    {(sub.status === "ai_evaluated" || sub.status === "admin_reviewed") && (
                      <button onClick={() => { setSelected(sub); setReviewForm({ adminScore: sub.adminScore || "", adminNote: sub.adminNote || "" }); }}
                        className="text-xs font-display font-medium px-3 py-1.5 rounded-lg border border-ix-border text-ix-text hover:border-ix-border-bright transition-all">
                        Review
                      </button>
                    )}
                    {sub.aiFeedback?.strengths?.length > 0 && (
                      <button onClick={() => setSelected(sub)}
                        className="text-xs text-ix-muted hover:text-ix-text border border-ix-border px-3 py-1.5 rounded-lg transition-all">
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-ix-muted">No submissions found.</div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="ix-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-ix-white text-lg">
                {selected.status === "published" ? "View Report" : "Review Submission"}
              </h2>
              <button onClick={() => setSelected(null)} className="text-ix-muted hover:text-ix-white text-xl">×</button>
            </div>

            {/* AI Feedback */}
            {selected.aiFeedback?.strengths?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-mono text-ix-muted mb-3">AI Score: <span className="text-amber-400 font-bold">{selected.aiScore}/100</span></p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Strengths", items: selected.aiFeedback.strengths, color: "emerald" },
                    { label: "Weaknesses", items: selected.aiFeedback.weaknesses, color: "red" },
                    { label: "Suggestions", items: selected.aiFeedback.suggestions, color: "blue" },
                  ].map(({ label, items, color }) => (
                    <div key={label} className={`bg-${color}-500/5 border border-${color}-500/20 rounded-xl p-4`}>
                      <p className={`text-${color}-400 text-xs font-display font-semibold mb-2`}>{label}</p>
                      <ul className="space-y-1.5">
                        {items?.map((item, i) => <li key={i} className="text-xs text-ix-muted leading-relaxed">{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review form */}
            {selected.status !== "published" && selected.status !== "rejected" && (
              <div className="space-y-4">
                <div>
                  <label className="ix-label">Admin Score (0–100)</label>
                  <input type="number" min="0" max="100" className="ix-input"
                    placeholder={`Leave blank to use AI score (${selected.aiScore})`}
                    value={reviewForm.adminScore}
                    onChange={(e) => setReviewForm({ ...reviewForm, adminScore: e.target.value })} />
                </div>
                <div>
                  <label className="ix-label">Internal Note</label>
                  <textarea rows={3} className="ix-input resize-none" placeholder="Optional note for your records..."
                    value={reviewForm.adminNote}
                    onChange={(e) => setReviewForm({ ...reviewForm, adminNote: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => review(selected._id, "publish")}
                    disabled={actionLoading === `review_${selected._id}`}
                    className="btn-primary flex-1 py-2.5">
                    ✓ Publish & Rank
                  </button>
                  <button onClick={() => review(selected._id, "reject")} className="btn-danger px-4">
                    Reject
                  </button>
                </div>
              </div>
            )}

            {(selected.status === "published") && (
              <div className="text-center py-4">
                <p className="text-emerald-400 font-display font-semibold">Published · Final Score: {selected.finalScore}</p>
                <p className="text-ix-muted text-sm">Rank #{selected.rank}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
