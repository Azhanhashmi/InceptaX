import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const plans = [
  { id: "free", name: "Free", price: 0, period: null, features: ["All public challenges", "AI evaluation (after review)", "Public portfolio /u/username", "Global + project leaderboard"], cta: "Get Started", popular: false },
  { id: "ten_day", name: "10-Day Sprint", price: 9, period: "10 days", features: ["Everything in Free", "All premium challenges", "Team collaboration (3 members)", "Real-time team chat", "Priority evaluation"], cta: "Start Sprint", popular: false },
  { id: "monthly", name: "Monthly Pro", price: 99, period: "month", features: ["Everything in Sprint", "Unlimited team members", "Exclusive monthly challenges", "Pro badge on profile", "Early feature access"], cta: "Go Pro", popular: true },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(null);

  const handleUpgrade = async (planId) => {
    if (!user) return navigate("/login?plan=" + planId);
    if (planId === "free") return;
    setUpgrading(planId);
    try {
      const r = await api.post("/plans/upgrade", { plan: planId });
      toast.success(`${planId === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} activated! 🎉`);
    } catch (err) { toast.error(err.response?.data?.message || "Upgrade failed"); }
    finally { setUpgrading(null); }
  };

  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  return (
    <div className="page-enter" style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Pricing</p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,46px)", color: "var(--ox-text)", letterSpacing: "-0.03em", marginBottom: "12px" }}>Simple, honest pricing</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "16px", maxWidth: "480px", margin: "0 auto", fontWeight: 300 }}>Start free. Upgrade when you need teams and premium challenges.</p>
      </div>

      {isPremiumActive && (
        <div className="ox-card" style={{ padding: "16px 20px", textAlign: "center", marginBottom: "32px", borderColor: "var(--ox-orange-bd)", background: "var(--ox-orange-lo)" }}>
          <p style={{ color: "var(--ox-orange)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px" }}>✦ You have an active {user.plan === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} plan</p>
          <p style={{ color: "var(--ox-muted)", fontSize: "12px", marginTop: "4px" }}>Expires: {new Date(user.planExpiresAt).toLocaleDateString()}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const isPopular = plan.popular;
          const isCurrent = user?.plan === plan.id;
          return (
            <div key={plan.id} className="ox-card" style={{
              padding: "28px", display: "flex", flexDirection: "column", position: "relative",
              ...(isPopular ? { borderColor: "var(--ox-orange-bd)", boxShadow: "0 0 48px rgba(255,107,0,0.12), 0 0 0 1px rgba(255,107,0,0.22)" } : {})
            }}>
              {isPopular && (
                <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)",
                  padding: "3px 14px", borderRadius: "100px", fontSize: "11px",
                  background: "var(--ox-orange)", color: "#fff", fontWeight: 700, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
                  Best Value
                </div>
              )}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "16px", marginBottom: "12px" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "38px", color: "var(--ox-text)" }}>{plan.price === 0 ? "Free" : `₹${plan.price}`}</span>
                  {plan.period && <span style={{ color: "var(--ox-muted)", fontSize: "13px" }}>/ {plan.period}</span>}
                </div>
              </div>
              <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2" style={{ fontSize: "13px", color: "var(--ox-muted)", fontWeight: 300 }}>
                    <span style={{ color: "#34D399", marginTop: "2px", flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade(plan.id)} disabled={upgrading === plan.id || isCurrent}
                className={isPopular ? "ox-btn-brand" : isCurrent ? "" : "ox-btn-ghost"}
                style={{
                  width: "100%", padding: "12px", fontSize: "13.5px", textAlign: "center",
                  ...(isCurrent ? { border: "1px solid rgba(52,211,153,0.25)", color: "#34D399", background: "rgba(52,211,153,0.05)", borderRadius: "10px", cursor: "default", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 } : {})
                }}>
                {isCurrent ? "✓ Current plan" : upgrading === plan.id ? "Processing…" : plan.cta}
              </button>
              {plan.id !== "free" && (
                <p style={{ textAlign: "center", fontSize: "11px", color: "var(--ox-subtle)", marginTop: "10px" }}>Payment via Razorpay · Auto-expires</p>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: "12.5px", color: "var(--ox-muted)", marginTop: "40px" }}>
        Questions? Drop us a line at <span style={{ color: "var(--ox-orange)" }}>hello@inceptax.io</span>
      </p>
    </div>
  );
}
