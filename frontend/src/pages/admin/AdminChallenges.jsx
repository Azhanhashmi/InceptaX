import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

const empty = { title: "", description: "", rules: "", criteria: "", difficulty: "easy", deadline: "", tags: "", isPremium: false, requiredPlan: "free", prize: "", coverImage: "" };

export default function AdminChallenges() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await adminApi.get("/assignments"); setAssignments(r.data.assignments); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setForm(empty); setEditId(null); setShowForm(true); };
  const openEdit = (a) => {
    setForm({
      title: a.title,
      description: a.description,
      rules: a.rules || "",
      criteria: a.criteria || "",
      difficulty: a.difficulty,
      deadline: a.deadline?.slice(0, 10) || "",
      tags: a.tags?.join(", ") || "",
      isPremium: a.isPremium || false,
      requiredPlan: a.requiredPlan || "free",
      prize: a.prize || "",
      coverImage: a.coverImage || ""
    });
    setEditId(a._id); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editId) { await adminApi.put(`/assignments/${editId}`, payload); toast.success("Challenge updated!"); }
      else { await adminApi.post("/assignments", payload); toast.success("Challenge created!"); }
      setShowForm(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this challenge? All submissions will remain.")) return;
    try { await adminApi.delete(`/assignments/${id}`); toast.success("Deleted"); fetchData(); }
    catch { toast.error("Delete failed"); }
  };

  const toggle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const diffClass = { easy: "ox-badge-easy", medium: "ox-badge-medium", hard: "ox-badge-hard" };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Challenges</h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>Create and manage hackathon challenges</p>
        </div>
        <button onClick={openNew} className="ox-btn-primary" style={{ fontSize: "13px", padding: "9px 18px" }}>+ New Challenge</button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(4).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "80px" }} />)}</div>
      ) : (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          {assignments.map((a, idx) => (
            <div key={a._id} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", transition: "background .2s", borderBottom: idx < assignments.length - 1 ? "1px solid var(--ox-border)" : "none" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0e0e0e"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: "4px" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px", color: "var(--ox-text)" }}>{a.title}</span>
                  <span className={diffClass[a.difficulty] || "ox-badge-free"}>{a.difficulty}</span>
                  {a.isPremium && <span className="ox-badge-premium">✦ Premium</span>}
                </div>
                <div className="flex items-center gap-4" style={{ fontSize: "11.5px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                  <span>Due: {format(new Date(a.deadline), "MMM d, yyyy")}</span>
                  <span>{a.submissionsCount} submissions</span>
                  {a.prize && <span style={{ color: "#FBBF24" }}>🏆 {a.prize}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(a)} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "6px 14px" }}>Edit</button>
                <button onClick={() => handleDelete(a._id)} className="ox-btn-danger" style={{ fontSize: "12px", padding: "6px 14px" }}>Delete</button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <div style={{ padding: "48px", textAlign: "center", color: "var(--ox-muted)", fontSize: "13.5px" }}>No challenges yet.</div>}
        </div>
      )}

      {showForm && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px 20px" }}>
            <div className="ox-card" style={{ width: "100%", maxWidth: "640px", padding: "28px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "18px" }}>{editId ? "Edit Challenge" : "New Challenge"}</h2>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--ox-muted)", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}>×</button>
              </div>

              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <div>
                  <label className="ox-label">Title</label>
                  <input className="ox-input" placeholder="Build a REST API with auth..." value={form.title} onChange={toggle("title")} required />
                </div>

                <div>
                  <label className="ox-label">Description</label>
                  <textarea className="ox-input" rows={4} placeholder="Brief overview of the challenge..." value={form.description} onChange={toggle("description")} required />
                </div>

                {/* NEW — Rules */}
                <div>
                  <label className="ox-label">Rules <span style={{ color: "var(--ox-subtle)", textTransform: "none", letterSpacing: 0, fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>— how to build it</span></label>
                  <textarea className="ox-input" rows={4} placeholder={"- Two logging windows per day\n- Store entries in LocalStorage\n- No external charting libraries"} value={form.rules} onChange={toggle("rules")} />
                </div>

                {/* NEW — Evaluation Criteria */}
                <div>
                  <label className="ox-label">Evaluation Criteria <span style={{ color: "var(--ox-subtle)", textTransform: "none", letterSpacing: 0, fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>— how it's scored</span></label>
                  <textarea className="ox-input" rows={4} placeholder={"- Time-window logic — 25 pts\n- SVG/Canvas graph — 30 pts\n- Data export — 20 pts\n- Visual design — 25 pts"} value={form.criteria} onChange={toggle("criteria")} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="ox-label">Difficulty</label>
                    <select className="ox-select" value={form.difficulty} onChange={toggle("difficulty")}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="ox-label">Deadline</label>
                    <input type="date" className="ox-input" value={form.deadline} onChange={toggle("deadline")} required />
                  </div>
                </div>

                <div>
                  <label className="ox-label">Tags <span style={{ color: "var(--ox-subtle)", textTransform: "none", letterSpacing: 0, fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>(comma-separated)</span></label>
                  <input className="ox-input" placeholder="React, Node.js, MongoDB" value={form.tags} onChange={toggle("tags")} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="ox-label">Prize / Reward</label>
                    <input className="ox-input" placeholder="e.g. ₹5000 cash" value={form.prize} onChange={toggle("prize")} />
                  </div>
                  <div>
                    <label className="ox-label">Cover Image URL</label>
                    <input className="ox-input" placeholder="https://..." value={form.coverImage} onChange={toggle("coverImage")} />
                  </div>
                </div>

                <div className="ox-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px", color: "var(--ox-text)" }}>Premium Challenge</p>
                      <p style={{ fontSize: "12px", color: "var(--ox-muted)" }}>Only paid users can submit</p>
                    </div>
                    <button type="button" onClick={() => setForm(f => ({ ...f, isPremium: !f.isPremium }))}
                      style={{ width: "44px", height: "24px", borderRadius: "100px", border: "none", cursor: "pointer", position: "relative", transition: "background .2s", background: form.isPremium ? "var(--ox-orange)" : "#2a2a2a" }}>
                      <span style={{ position: "absolute", top: "2px", width: "20px", height: "20px", background: "#fff", borderRadius: "50%", transition: "transform .2s", transform: form.isPremium ? "translateX(22px)" : "translateX(2px)" }} />
                    </button>
                  </div>
                  {form.isPremium && (
                    <div>
                      <label className="ox-label">Required Plan</label>
                      <select className="ox-select" value={form.requiredPlan} onChange={toggle("requiredPlan")}>
                        <option value="ten_day">10-Day Sprint (₹99)</option>
                        <option value="monthly">Monthly Pro (₹199)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2" style={{ paddingTop: "8px" }}>
                  <button type="submit" disabled={saving} className="ox-btn-primary" style={{ flex: 1, padding: "11px", fontSize: "14px" }}>
                    {saving ? "Saving..." : editId ? "Save Changes" : "Create Challenge"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="ox-btn-ghost" style={{ padding: "11px 20px" }}>Cancel</button>
                </div>

              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
