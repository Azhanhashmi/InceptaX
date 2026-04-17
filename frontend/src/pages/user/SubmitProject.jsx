import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function SubmitProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [form, setForm] = useState({ repoLink: "", liveLink: "", description: "", teamMemberUsernames: "" });
  const [loading, setLoading] = useState(false);
  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  useEffect(() => { api.get(`/assignments/${id}`).then(r => setAssignment(r.data.assignment)).catch(() => navigate("/challenges")); }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.repoLink.includes("github.com")) return toast.error("Please enter a valid GitHub URL");
    if (form.description.trim().length < 20) return toast.error("Description must be at least 20 characters");
    setLoading(true);
    try {
      const payload = { assignmentId: id, repoLink: form.repoLink.trim(), liveLink: form.liveLink.trim(), description: form.description.trim() };
      if (form.teamMemberUsernames && isPremiumActive) {
        payload.teamMemberUsernames = form.teamMemberUsernames.split(",").map(u => u.trim()).filter(Boolean);
      }
      const r = await api.post("/submissions", payload);
      toast.success("Submitted! Awaiting admin review 🎉");
      navigate(`/submissions/${r.data.submission._id}`);
    } catch (err) { toast.error(err.response?.data?.message || "Submission failed"); }
    finally { setLoading(false); }
  };

  if (!assignment) return <div className="max-w-xl mx-auto px-4 py-12 space-y-3"><div className="ix-card h-8 skeleton" /><div className="ix-card h-48 skeleton" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 page-enter">
      <Link to={`/challenges/${id}`} className="text-xs font-mono text-ix-muted hover:text-ix-subtle flex items-center gap-1 mb-6">← Back</Link>
      <div className="ix-card p-4 mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-ix-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-ix-primary">◈</span>
        </div>
        <div>
          <p className="text-[10px] text-ix-muted font-mono uppercase tracking-widest">Submitting for</p>
          <p className="font-display font-semibold text-ix-white text-sm">{assignment.title}</p>
        </div>
      </div>
      <div className="ix-card p-7">
        <h1 className="font-display font-bold text-xl text-ix-white mb-1">Submit Your Project</h1>
        <p className="text-ix-muted text-sm mb-7">Your submission will be reviewed by an admin before results are published.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="ix-label">GitHub Repo URL *</label>
            <input className="ix-input" type="url" placeholder="https://github.com/you/project" value={form.repoLink} onChange={e => setForm({ ...form, repoLink: e.target.value })} required />
          </div>
          <div>
            <label className="ix-label">Live Demo <span className="text-ix-muted normal-case font-body tracking-normal">(optional)</span></label>
            <input className="ix-input" type="url" placeholder="https://your-app.vercel.app" value={form.liveLink} onChange={e => setForm({ ...form, liveLink: e.target.value })} />
          </div>
          <div>
            <label className="ix-label">Project Description *</label>
            <textarea className="ix-input resize-none" rows={5} placeholder="Describe what you built, tech stack, key features…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <p className="text-[10px] text-ix-muted mt-1 font-mono">{form.description.length} chars (min 20)</p>
          </div>
          {isPremiumActive && (
            <div>
              <label className="ix-label">Team Members <span className="text-ix-premium font-mono text-[10px] normal-case tracking-normal">✦ Premium</span></label>
              <input className="ix-input" placeholder="username1, username2" value={form.teamMemberUsernames} onChange={e => setForm({ ...form, teamMemberUsernames: e.target.value })} />
              <p className="text-[10px] text-ix-muted mt-1">Comma-separated InceptaX usernames</p>
            </div>
          )}
          <div className="bg-ix-primary/5 border border-ix-primary/20 rounded-xl p-4">
            <p className="text-xs font-display font-semibold text-ix-primary mb-1">How evaluation works</p>
            <p className="text-xs text-ix-muted leading-relaxed">Admin triggers AI analysis of your repo. After review, results and rankings are published. Final score = 70% AI + 30% Admin.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Submitting…" : "Submit Project →"}
          </button>
        </form>
      </div>
    </div>
  );
}
