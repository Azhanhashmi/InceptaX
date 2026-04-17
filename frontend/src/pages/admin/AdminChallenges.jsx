import { useState, useEffect } from "react";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

const empty = { title: "", description: "", difficulty: "easy", deadline: "", tags: "", isPremium: false, requiredPlan: "free", prize: "", coverImage: "" };

export default function AdminChallenges() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await adminApi.get("/assignments");
      setAssignments(r.data.assignments);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setForm(empty); setEditId(null); setShowForm(true); };
  const openEdit = (a) => {
    setForm({ title: a.title, description: a.description, difficulty: a.difficulty, deadline: a.deadline?.slice(0, 10) || "", tags: a.tags?.join(", ") || "", isPremium: a.isPremium || false, requiredPlan: a.requiredPlan || "free", prize: a.prize || "", coverImage: a.coverImage || "" });
    setEditId(a._id); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editId) { await adminApi.put(`/assignments/${editId}`, payload); toast.success("Challenge updated!"); }
      else { await adminApi.post("/assignments", payload); toast.success("Challenge created!"); }
      setShowForm(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this challenge? All submissions will remain.")) return;
    try { await adminApi.delete(`/assignments/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  const toggle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-white">Challenges</h1>
          <p className="text-ix-muted text-sm mt-0.5">Create and manage hackathon challenges</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ New Challenge</button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="ix-card h-20 skeleton" />)}</div>
      ) : (
        <div className="ix-card overflow-hidden">
          <div className="divide-y divide-ix-border">
            {assignments.map((a) => (
              <div key={a._id} className="p-5 flex items-center gap-4 hover:bg-ix-card-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-sm text-ix-white">{a.title}</span>
                    <span className={`badge-${a.difficulty}`}>{a.difficulty}</span>
                    {a.isPremium && <span className="badge-premium">✦ Premium</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-ix-muted font-mono">
                    <span>Due: {format(new Date(a.deadline), "MMM d, yyyy")}</span>
                    <span>{a.submissionsCount} submissions</span>
                    {a.prize && <span className="text-ix-gold">🏆 {a.prize}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                  <button onClick={() => handleDelete(a._id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && <div className="p-12 text-center text-ix-muted">No challenges yet.</div>}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="ix-card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-ix-white text-lg">{editId ? "Edit Challenge" : "New Challenge"}</h2>
              <button onClick={() => setShowForm(false)} className="text-ix-muted hover:text-ix-white text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="ix-label">Title</label>
                <input className="ix-input" placeholder="Build a REST API with auth..." value={form.title} onChange={toggle("title")} required />
              </div>
              <div>
                <label className="ix-label">Description</label>
                <textarea className="ix-input resize-none" rows={5} placeholder="Describe the challenge requirements..." value={form.description} onChange={toggle("description")} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ix-label">Difficulty</label>
                  <select className="ix-select" value={form.difficulty} onChange={toggle("difficulty")}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="ix-label">Deadline</label>
                  <input type="date" className="ix-input" value={form.deadline} onChange={toggle("deadline")} required />
                </div>
              </div>
              <div>
                <label className="ix-label">Tags <span className="text-ix-muted normal-case font-body tracking-normal">(comma-separated)</span></label>
                <input className="ix-input" placeholder="React, Node.js, MongoDB" value={form.tags} onChange={toggle("tags")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ix-label">Prize / Reward</label>
                  <input className="ix-input" placeholder="e.g. ₹5000 cash" value={form.prize} onChange={toggle("prize")} />
                </div>
                <div>
                  <label className="ix-label">Cover Image URL</label>
                  <input className="ix-input" placeholder="https://..." value={form.coverImage} onChange={toggle("coverImage")} />
                </div>
              </div>
              {/* Premium toggle */}
              <div className="ix-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-display font-medium text-ix-white">Premium Challenge</p>
                    <p className="text-xs text-ix-muted">Only paid users can submit</p>
                  </div>
                  <button type="button" onClick={() => setForm(f => ({ ...f, isPremium: !f.isPremium }))}
                    className={`w-11 h-6 rounded-full transition-colors ${form.isPremium ? "bg-ix-primary" : "bg-ix-border"} relative`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.isPremium ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {form.isPremium && (
                  <div>
                    <label className="ix-label">Required Plan</label>
                    <select className="ix-select" value={form.requiredPlan} onChange={toggle("requiredPlan")}>
                      <option value="ten_day">10-Day Sprint (₹99)</option>
                      <option value="monthly">Monthly Pro (₹199)</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
                  {saving ? "Saving..." : editId ? "Save Changes" : "Create Challenge"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
