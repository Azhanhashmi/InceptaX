import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 

const features = [
  { icon: "🤖", title: "AI Evaluation", desc: "Every submission is analyzed by GPT for code quality, structure, and real-world impact." },
  { icon: "🏆", title: "Per-Project Rankings", desc: "See exactly where you rank on every challenge — not just globally." },
  { icon: "👥", title: "Team Collaboration", desc: "Invite partners, build together, and chat in real time. Premium plans only." },
  { icon: "🎯", title: "Admin-Curated Quality", desc: "Admins review AI results before publishing — no junk scores, ever." },
];

const plans = [
  { id: "free", name: "Free", price: 0, period: null, tag: null, features: ["All public challenges", "AI evaluation (after admin review)", "Public portfolio at /u/username", "Global + per-project leaderboard"], cta: "Start Free", href: "/login" },
  { id: "ten_day", name: "10-Day Sprint", price: 99, period: "10 days", tag: "Popular", features: ["Everything in Free", "All premium challenges", "Team collaboration (up to 3)", "Real-time team chat", "Priority evaluation"], cta: "Start Sprint", href: "/login?plan=ten_day" },
  { id: "monthly", name: "Monthly Pro", price: 199, period: "month", tag: "Best Value", features: ["Everything in Sprint", "Unlimited team members", "Exclusive monthly challenges", "Pro badge on profile", "Early feature access"], cta: "Go Pro", href: "/login?plan=monthly" },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-ix-hero pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 border border-ix-border-bright bg-ix-card px-4 py-1.5 rounded-full text-xs font-mono text-ix-subtle mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live challenges open
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-ix-white leading-[1.05] tracking-tight mb-6">
            Where builders
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#4f46e5 0%,#06b6d4 100%)" }}>
              get ranked.
            </span>
          </h1>

          <p className="text-ix-subtle text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Tackle real-world challenges. Submit your GitHub project. Get AI-powered feedback. Compete on a public leaderboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-brand px-8 py-3.5 text-base">
                  Go to Dashboard →
                </Link>
                <Link to="/challenges" className="btn-ghost px-8 py-3.5 text-base">
                  Browse Challenges
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-brand px-8 py-3.5 text-base">
                  Start Building →
                </Link>
                <Link to="/challenges" className="btn-ghost px-8 py-3.5 text-base">
                  Browse Challenges
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-ix-border">
            {[["100+", "Challenges"], ["AI-Powered", "Evaluation"], ["Free", "To Start"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-2xl text-ix-white">{val}</div>
                <div className="text-xs text-ix-muted mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line mx-auto max-w-4xl" />

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl text-ix-white mb-3">Built for serious builders</h2>
            <p className="text-ix-muted max-w-xl mx-auto">Not just another portfolio project site.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="ix-card p-6">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-ix-white text-sm mb-2">{f.title}</h3>
                <p className="text-ix-muted text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-ix-primary uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="font-display font-bold text-3xl text-ix-white mb-3">Simple, honest plans</h2>
            <p className="text-ix-muted">Start free. Upgrade when you need teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isPopular = plan.id === "monthly";
              return (
                <div
                  key={plan.id}
                  className={`ix-card p-7 relative flex flex-col ${isPopular ? "border-ix-primary" : ""}`}
                  style={isPopular ? { boxShadow: "0 0 40px rgba(79,70,229,0.12), 0 0 0 1px rgba(79,70,229,0.3)" } : {}}
                >
                  {plan.tag && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-white" style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>
                      {plan.tag}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display font-bold text-ix-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-extrabold text-3xl text-ix-white">
                        {plan.price === 0 ? "₹0" : `₹${plan.price}`}
                      </span>
                      {plan.period && <span className="text-ix-muted text-sm">/ {plan.period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-ix-subtle">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={user ? "/dashboard" : plan.href}
                    className={`block text-center py-2.5 rounded-xl text-sm font-display font-semibold transition-all ${isPopular ? "btn-brand" : "btn-ghost"}`}
                  >
                    {user ? "Open Dashboard" : plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ix-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-semibold text-ix-muted text-sm">InceptaX</span>
          <p className="text-xs text-ix-muted">© {new Date().getFullYear()} InceptaX · Building the future, one commit at a time.</p>
        </div>
      </footer>
    </div>
  );
}