import { useState } from "react";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

export default function AdminEmailBlast() {
  const [form, setForm] = useState({ subject: "", htmlBody: "", targetPlan: "" });
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!confirm(`Send to all ${form.targetPlan || "users"}? This cannot be undone.`)) return;
    setSending(true);
    try {
      const r = await adminApi.post("/email/blast", form);
      setResult(r.data);
      toast.success(`Email queued for ${r.data.count} users`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Send failed");
    } finally { setSending(false); }
  };

  const templates = [
    { label: "New challenge", body: "<h2 style='color:#F0F0F0'>New challenge live! 🚀</h2><p style='color:#7A7A7A'>Check out the latest challenge on InceptaX and start building.</p><a href='https://inceptax.vercel.app/' style='background:#FF6B00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>View Challenge</a>" },
    { label: "Upgrade reminder", body: "<h2 style='color:#F0F0F0'>Unlock premium challenges ✦</h2><p style='color:#7A7A7A'>Get access to team collaboration, premium challenges, and more from ₹99.</p><a href='https://inceptax.vercel.app/pricing' style='background:#FF6B00;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>Upgrade Now</a>" },
  ];

  return (
    <div className="page-enter" style={{ maxWidth: "720px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Email Blast</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>Send emails directly to your user base</p>
      </div>

      {result && (
        <div className="ox-card" style={{ padding: "16px 20px", marginBottom: "24px", borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.05)" }}>
          <p style={{ color: "#34D399", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px" }}>✓ Email queued for {result.count} recipients</p>
        </div>
      )}

      <div className="ox-card" style={{ padding: "28px" }}>
        <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="ox-label">Target Audience</label>
            <select className="ox-select" value={form.targetPlan} onChange={e => setForm({ ...form, targetPlan: e.target.value })}>
              <option value="">All users</option>
              <option value="free">Free plan users only</option>
              <option value="ten_day">10-Day Sprint users</option>
              <option value="monthly">Monthly Pro users</option>
            </select>
          </div>

          <div>
            <label className="ox-label">Subject Line</label>
            <input className="ox-input" placeholder="e.g. New challenges are live on InceptaX 🚀" value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })} required />
          </div>

          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
              <label className="ox-label" style={{ margin: 0 }}>Email Body (HTML)</label>
              <button type="button" onClick={() => setPreview(!preview)}
                style={{ fontSize: "12px", color: "var(--ox-orange)", background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", textDecoration: "underline" }}>
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="ox-input" style={{ minHeight: "200px", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: form.htmlBody }} />
            ) : (
              <textarea className="ox-input" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", resize: "none" }} rows={10}
                placeholder={'<h1>Hello!</h1>\n<p>New challenges are live...</p>'}
                value={form.htmlBody} onChange={e => setForm({ ...form, htmlBody: e.target.value })} required />
            )}
            <p style={{ fontSize: "11.5px", color: "var(--ox-muted)", marginTop: "6px" }}>
              Write HTML directly. Use <code style={{ color: "var(--ox-orange)", fontFamily: "'JetBrains Mono',monospace" }}>{"{name}"}</code> for personalization (coming soon).
            </p>
          </div>

          {/* Template shortcuts */}
          <div>
            <p className="ox-label">Quick Templates</p>
            <div className="flex gap-2 flex-wrap">
              {templates.map(t => (
                <button key={t.label} type="button" onClick={() => setForm(f => ({ ...f, htmlBody: t.body }))}
                  className="ox-btn-ghost" style={{ fontSize: "12px", padding: "6px 14px" }}>{t.label}</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={sending} className="ox-btn-primary" style={{ width: "100%", padding: "13px", fontSize: "14px" }}>
            {sending ? "Sending..." : "Send Email Blast →"}
          </button>
        </form>
      </div>
    </div>
  );
}
