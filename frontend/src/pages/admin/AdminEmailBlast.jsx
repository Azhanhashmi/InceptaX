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

  return (
    <div className="page-enter max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-ix-white">Email Blast</h1>
        <p className="text-ix-muted text-sm mt-0.5">Send emails directly to your user base</p>
      </div>

      {result && (
        <div className="ix-card p-4 border-emerald-500/30 bg-emerald-500/5 mb-6">
          <p className="text-emerald-400 font-display font-semibold text-sm">✓ Email queued for {result.count} recipients</p>
        </div>
      )}

      <div className="ix-card p-7">
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="ix-label">Target Audience</label>
            <select className="ix-select" value={form.targetPlan} onChange={e => setForm({ ...form, targetPlan: e.target.value })}>
              <option value="">All users</option>
              <option value="free">Free plan users only</option>
              <option value="ten_day">10-Day Sprint users</option>
              <option value="monthly">Monthly Pro users</option>
            </select>
          </div>
          <div>
            <label className="ix-label">Subject Line</label>
            <input className="ix-input" placeholder="e.g. New challenges are live on InceptaX 🚀" value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="ix-label mb-0">Email Body (HTML)</label>
              <button type="button" onClick={() => setPreview(!preview)}
                className="text-xs text-ix-primary hover:underline font-mono">
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="ix-input min-h-[200px] overflow-auto" dangerouslySetInnerHTML={{ __html: form.htmlBody }} />
            ) : (
              <textarea className="ix-input resize-none font-mono text-xs" rows={10}
                placeholder={'<h1>Hello!</h1>\n<p>New challenges are live...</p>'}
                value={form.htmlBody} onChange={e => setForm({ ...form, htmlBody: e.target.value })} required />
            )}
            <p className="text-xs text-ix-muted mt-1.5">Write HTML directly. Use <code className="text-ix-primary">{"{{name}}"}</code> for personalization (coming soon).</p>
          </div>

          {/* Template shortcuts */}
          <div>
            <p className="ix-label">Quick Templates</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "New challenge", body: "<h2 style='color:#fff'>New challenge live! 🚀</h2><p style='color:#94a3b8'>Check out the latest challenge on InceptaX and start building.</p><a href='https://inceptax.io/challenges' style='background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>View Challenge</a>" },
                { label: "Upgrade reminder", body: "<h2 style='color:#fff'>Unlock premium challenges ✦</h2><p style='color:#94a3b8'>Get access to team collaboration, premium challenges, and more from ₹99.</p><a href='https://inceptax.io/pricing' style='background:linear-gradient(135deg,#4f46e5,#06b6d4);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px'>Upgrade Now</a>" },
              ].map(t => (
                <button key={t.label} type="button" onClick={() => setForm(f => ({ ...f, htmlBody: t.body }))}
                  className="text-xs btn-ghost px-3 py-1.5">{t.label}</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={sending} className="btn-primary w-full py-3">
            {sending ? "Sending..." : `Send Email Blast →`}
          </button>
        </form>
      </div>
    </div>
  );
}
