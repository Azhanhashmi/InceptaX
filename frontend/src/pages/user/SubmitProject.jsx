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

  if (!assignment) return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div className="ox-skeleton" style={{ height: "32px", width: "60%" }} />
      <div className="ox-skeleton" style={{ height: "180px" }} />
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 16px" }}>
      <Link to={`/challenges/${id}`} style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "24px" }}>← Back</Link>

      {/* Challenge info pill */}
      <div className="ox-card" style={{ padding: "14px 18px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--ox-orange-lo)", border: "1px solid var(--ox-orange-bd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--ox-orange)", fontSize: "14px" }}>◈</span>
        </div>
        <div>
          <p style={{ fontSize: "10.5px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".08em" }}>Submitting for</p>
          <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "13.5px" }}>{assignment.title}</p>
        </div>
      </div>

      <div className="ox-card" style={{ padding: "28px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)", marginBottom: "6px" }}>Submit Your Project</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "13.5px", marginBottom: "28px", fontWeight: 300 }}>Your submission will be reviewed by an admin before results are published.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label className="ox-label">GitHub Repo URL *</label>
            <input className="ox-input" type="url" placeholder="https://github.com/you/project" value={form.repoLink} onChange={e => setForm({ ...form, repoLink: e.target.value })} required />
          </div>
          <div>
            <label className="ox-label">Live Demo <span style={{ color: "var(--ox-subtle)", textTransform: "none", letterSpacing: 0, fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>(optional)</span></label>
            <input className="ox-input" type="url" placeholder="https://your-app.vercel.app" value={form.liveLink} onChange={e => setForm({ ...form, liveLink: e.target.value })} />
          </div>
          <div>
            <label className="ox-label">Project Description *</label>
            <textarea className="ox-input" rows={5} placeholder="Describe what you built, tech stack, key features…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            <p style={{ fontSize: "10.5px", color: "var(--ox-subtle)", marginTop: "6px", fontFamily: "'JetBrains Mono',monospace" }}>{form.description.length} chars (min 20)</p>
          </div>

          {isPremiumActive && (
            <div>
              <label className="ox-label">Team Members <span className="ox-badge-premium" style={{ fontSize: "10px", padding: "2px 7px", marginLeft: "4px" }}>✦ Premium</span></label>
              <input className="ox-input" placeholder="username1, username2" value={form.teamMemberUsernames} onChange={e => setForm({ ...form, teamMemberUsernames: e.target.value })} />
              <p style={{ fontSize: "11px", color: "var(--ox-muted)", marginTop: "6px" }}>Comma-separated InceptaX usernames</p>
            </div>
          )}

          {/* How it works */}
          <div style={{ background: "var(--ox-orange-lo)", border: "1px solid var(--ox-orange-bd)", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-orange)", fontSize: "12.5px", marginBottom: "6px" }}>How evaluation works</p>
            <p style={{ fontSize: "12px", color: "var(--ox-muted)", lineHeight: 1.7, fontWeight: 300 }}>Admin triggers AI analysis of your repo. After review, results and rankings are published. Final score = 70% AI + 30% Admin.</p>
          </div>

          <button type="submit" disabled={loading} className="ox-btn-primary" style={{ width: "100%", padding: "13px", fontSize: "15px" }}>
            {loading ? "Submitting…" : "Submit Project →"}
          </button>
        </form>
      </div>
    </div>
  );
}
