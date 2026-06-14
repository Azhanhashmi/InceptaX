import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Zap, Star, Gift } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";

const plans = [
  {
    id: "free", name: "Free", price: 0, period: null, popular: false,
    icon: Gift,
    badge: "No credit card",
    features: ["All public challenges", "AI evaluation (after review)", "Public portfolio /u/username", "Global + project leaderboard"],
    lockedFeatures: ["Premium challenges", "Team collaboration", "Priority evaluation"],
    cta: "Get Started",
  },
  {
    id: "ten_day", name: "10-Day Sprint", price: 9, period: "10 days", popular: false,
    icon: Zap,
    badge: "Short & focused",
    features: ["Everything in Free", "All premium challenges", "Team collaboration (3 members)", "Real-time team chat", "Priority evaluation"],
    lockedFeatures: ["Unlimited team members", "Exclusive monthly challenges", "Pro badge"],
    cta: "Start Sprint",
  },
  {
    id: "monthly", name: "Monthly Pro", price: 99, period: "month", popular: true,
    icon: Star,
    badge: "Best Value",
    features: ["Everything in Sprint", "Unlimited team members", "Exclusive monthly challenges", "Pro badge on profile", "Early feature access"],
    lockedFeatures: [],
    cta: "Go Pro",
  },
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
      await api.post("/plans/upgrade", { plan: planId });
      toast.success(`${planId === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} activated! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upgrade failed");
    } finally {
      setUpgrading(null);
    }
  };

  const isPremiumActive = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user?.planExpiresAt);

  return (
    <div className="page-enter" style={{ maxWidth: "980px", margin: "0 auto", padding: "64px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Pricing</p>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(30px,4vw,46px)", color: "var(--ox-text)", letterSpacing: "-0.03em", marginBottom: "12px" }}>Simple, honest pricing</h1>
        <p style={{ color: "var(--ox-muted)", fontSize: "16px", maxWidth: "480px", margin: "0 auto", fontWeight: 300 }}>Start free. Upgrade when you need teams and premium challenges.</p>
      </div>

      {/* Active plan banner */}
      {isPremiumActive && (
        <div className="ox-card" style={{ padding: "16px 20px", textAlign: "center", marginBottom: "32px", borderColor: "var(--ox-orange-bd)", background: "var(--ox-orange-lo)" }}>
          <p style={{ color: "var(--ox-orange)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13.5px" }}>
            ✦ You have an active {user.plan === "ten_day" ? "10-Day Sprint" : "Monthly Pro"} plan
          </p>
          <p style={{ color: "var(--ox-muted)", fontSize: "12px", marginTop: "4px" }}>Expires: {new Date(user.planExpiresAt).toLocaleDateString()}</p>
        </div>
      )}

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          const PlanIcon = plan.icon;

          return (
            <PricingCard.Card
              key={plan.id}
              style={{
                ...(plan.popular ? {
                  borderColor: "var(--ox-orange-bd)",
                  boxShadow: "0 0 48px rgba(255,107,0,0.12), 0 0 0 1px rgba(255,107,0,0.22)",
                } : {}),
              }}
            >
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>
                    <PlanIcon size={16} />
                    <span>{plan.name}</span>
                  </PricingCard.PlanName>
                  <PricingCard.Badge
                    style={plan.popular ? { borderColor: "rgba(255,107,0,0.4)", color: "var(--ox-orange)" } : {}}
                  >
                    {plan.badge}
                  </PricingCard.Badge>
                </PricingCard.Plan>

                <PricingCard.Price>
                  <PricingCard.MainPrice>
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </PricingCard.MainPrice>
                  {plan.period && <PricingCard.Period>/ {plan.period}</PricingCard.Period>}
                </PricingCard.Price>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading === plan.id || isCurrent}
                  style={{
                    width: "100%", padding: "11px", fontSize: "13.5px", borderRadius: "10px",
                    fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, cursor: isCurrent ? "default" : "pointer",
                    transition: "all .2s ease", position: "relative", zIndex: 1,
                    ...(isCurrent
                      ? { border: "1px solid rgba(52,211,153,0.25)", color: "#34D399", background: "rgba(52,211,153,0.05)" }
                      : plan.popular
                      ? { background: "linear-gradient(to bottom, #ff6b00, #e55a00)", color: "#fff", border: "none", boxShadow: "0 10px 25px rgba(255,107,0,0.3)" }
                      : { background: "rgba(255,255,255,0.06)", color: "var(--ox-text)", border: "1px solid var(--ox-border)" }
                    ),
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent && !plan.popular) e.currentTarget.style.borderColor = "rgba(255,107,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent && !plan.popular) e.currentTarget.style.borderColor = "var(--ox-border)";
                  }}
                >
                  {isCurrent ? "✓ Current plan" : upgrading === plan.id ? "Processing…" : plan.cta}
                </button>
              </PricingCard.Header>

              <PricingCard.Body>
                <PricingCard.List>
                  {plan.features.map((f) => (
                    <PricingCard.ListItem key={f}>
                      <CheckCircle2 size={15} style={{ color: "#34D399", flexShrink: 0, marginTop: "1px" }} />
                      <span>{f}</span>
                    </PricingCard.ListItem>
                  ))}
                </PricingCard.List>

                {plan.lockedFeatures.length > 0 && (
                  <>
                    <PricingCard.Separator>Upgrade to access</PricingCard.Separator>
                    <PricingCard.List>
                      {plan.lockedFeatures.map((f) => (
                        <PricingCard.ListItem key={f} style={{ opacity: 0.5 }}>
                          <XCircle size={15} style={{ color: "#ef4444", flexShrink: 0, marginTop: "1px" }} />
                          <span>{f}</span>
                        </PricingCard.ListItem>
                      ))}
                    </PricingCard.List>
                  </>
                )}

                {plan.id !== "free" && (
                  <p style={{ textAlign: "center", fontSize: "11px", color: "var(--ox-subtle)" }}>
                    Payment via Razorpay · Auto-expires
                  </p>
                )}
              </PricingCard.Body>
            </PricingCard.Card>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: "12.5px", color: "var(--ox-muted)", marginTop: "40px" }}>
        Questions? Drop us a line at <span style={{ color: "var(--ox-orange)" }}>hello@inceptax.io</span>
      </p>
    </div>
  );
}