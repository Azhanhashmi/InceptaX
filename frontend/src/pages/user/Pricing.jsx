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
      // In production: integrate Razorpay here before calling /plans/upgrade
      // For demo: direct upgrade
      const r = await api.post("/plans/upgrade", { plan: planId });
      toast.success(`${planId === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} activated! 🎉`);
    } catch (err) { toast.error(err.response?.data?.message || "Upgrade failed"); }
    finally { setUpgrading(null); }
  };

  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 page-enter">
      <div className="text-center mb-14">
        <p className="text-xs font-mono text-ix-primary uppercase tracking-widest mb-3">Pricing</p>
        <h1 className="font-display font-extrabold text-4xl text-ix-white mb-3">Simple, honest pricing</h1>
        <p className="text-ix-muted text-lg max-w-xl mx-auto">Start free. Upgrade when you need teams and premium challenges.</p>
      </div>

      {isPremiumActive && (
        <div className="mb-8 ix-card p-4 text-center" style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.08),rgba(79,70,229,0.08))", borderColor: "rgba(167,139,250,0.3)" }}>
          <p className="text-ix-premium font-display font-semibold text-sm">✦ You have an active {user.plan === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} plan</p>
          <p className="text-ix-muted text-xs mt-1">Expires: {new Date(user.planExpiresAt).toLocaleDateString()}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const isPopular = plan.popular;
          const isCurrent = user?.plan === plan.id;
          return (
            <div key={plan.id} className={`ix-card p-7 flex flex-col relative ${isPopular ? "border-ix-primary" : ""}`}
              style={isPopular ? { boxShadow: "0 0 60px rgba(79,70,229,0.15), 0 0 0 1px rgba(79,70,229,0.3)" } : {}}>
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-mono font-semibold text-white" style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>
                  Best Value
                </div>
              )}
              <div className="mb-7">
                <h3 className="font-display font-bold text-ix-white mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-4xl text-ix-white">{plan.price === 0 ? "Free" : `₹${plan.price}`}</span>
                  {plan.period && <span className="text-ix-muted text-sm">/ {plan.period}</span>}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ix-subtle">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0 font-mono">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade(plan.id)} disabled={upgrading === plan.id || isCurrent}
                className={`w-full py-3 rounded-xl text-sm font-display font-semibold transition-all ${isPopular ? "btn-brand" : isCurrent ? "border border-emerald-500/30 text-emerald-400 cursor-default" : "btn-ghost"}`}>
                {isCurrent ? "✓ Current plan" : upgrading === plan.id ? "Processing…" : plan.cta}
              </button>
              {plan.id !== "free" && (
                <p className="text-center text-[10px] text-ix-muted mt-3">Payment via Razorpay · Auto-expires</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-ix-muted mt-10">
        Questions? Drop us a line at <span className="text-ix-primary">hello@inceptax.io</span>
      </p>
    </div>
  );
}
