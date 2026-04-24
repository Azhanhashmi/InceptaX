import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    title: "AI Evaluation",
    desc: "Every submission is analyzed by GPT for code quality, structure, and real-world impact.",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/><path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/></svg>
  },
  {
    title: "Per-Project Rankings",
    desc: "See exactly where you rank on every challenge — not just globally.",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
  },
  {
    title: "Team Collaboration",
    desc: "Invite partners, build together, and chat in real time. Premium plans only.",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
  },
  {
    title: "Admin-Curated Quality",
    desc: "Admins review AI results before publishing — no junk scores, ever.",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
  },
  {
    title: "GitHub Integration",
    desc: "Submit your public repo directly. We analyse your commit history, README, and code.",
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  },
  {
    title: "Public Portfolio",
    desc: "Every published project lives at /u/username — a live portfolio you can share with recruiters.",
    svg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
  },
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
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 6% 90px", minHeight: "86vh", display: "flex", alignItems: "center" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "8%", width: "360px", height: "360px", background: "radial-gradient(circle, rgba(255,107,0,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="max-w-5xl mx-auto w-full text-center" style={{ position: "relative", zIndex: 1 }}>
          <div className="inline-flex items-center gap-2 mb-8 ox-live-badge">
            <span className="ox-blink-dot" />
            Challenges open
          </div>

          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(46px, 6vw, 80px)", lineHeight: 1.0, letterSpacing: "-0.04em", color: "var(--ox-text)", marginBottom: "22px" }}>
            Where builders<br />
            <em style={{ fontStyle: "normal", color: "var(--ox-orange)" }}>get ranked.</em>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--ox-muted)", maxWidth: "560px", margin: "0 auto 36px", lineHeight: 1.8, fontWeight: 300 }}>
            Tackle real world challenges. Submit your GitHub project. Get AI powered feedback. Compete on a public leaderboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="ox-btn-primary" style={{ fontSize: "15px", padding: "13px 32px" }}>Go to Dashboard →</Link>
                <Link to="/challenges" className="ox-btn-ghost" style={{ fontSize: "15px", padding: "13px 30px" }}>Browse Challenges</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="ox-btn-primary" style={{ fontSize: "15px", padding: "13px 32px" }}>Start Building →</Link>
                <Link to="/challenges" className="ox-btn-ghost" style={{ fontSize: "15px", padding: "13px 30px" }}>Browse Challenges</Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 mt-14 pt-10" style={{ borderTop: "1px solid var(--ox-border)" }}>
            {[["100+", "Challenges"], ["AI-Powered", "Evaluation"], ["Free", "To Start"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)" }}>{val}</div>
                <div style={{ fontSize: "11px", color: "var(--ox-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: ".07em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ox-glow-line" style={{ maxWidth: "900px", margin: "0 auto" }} />

      {/* Features */}
      <section style={{ padding: "88px 6%" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: "52px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Platform</p>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", color: "var(--ox-text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Built for serious builders</h2>
            <p style={{ color: "var(--ox-muted)", fontSize: "15px", fontWeight: 300 }}>Not just another portfolio project site.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="ox-card" style={{ padding: "28px", transition: "all .22s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--ox-border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", color: "#fff" }}>
                  <div style={{ width: "22px", height: "22px" }}>{f.svg}</div>
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--ox-text)", marginBottom: "10px", letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: "13.5px", color: "var(--ox-muted)", lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "88px 6%" }} id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: "52px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Pricing</p>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", color: "var(--ox-text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Simple, honest plans</h2>
            <p style={{ color: "var(--ox-muted)", fontSize: "15px", fontWeight: 300 }}>Start free. Upgrade when you need teams.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isPopular = plan.id === "monthly";
              return (
                <div key={plan.id} className="ox-card" style={{ padding: "28px", display: "flex", flexDirection: "column", position: "relative",
                  ...(isPopular ? { borderColor: "var(--ox-orange-bd)", boxShadow: "0 0 40px rgba(255,107,0,0.10), 0 0 0 1px rgba(255,107,0,0.22)" } : {}) }}>
                  {plan.tag && (
                    <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", padding: "3px 14px", borderRadius: "100px", fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 700, background: "var(--ox-orange)", color: "#fff" }}>
                      {plan.tag}
                    </div>
                  )}

                  <div style={{ marginBottom: "22px" }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-text)", fontSize: "16px", marginBottom: "10px" }}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "34px", color: "var(--ox-text)" }}>
                        {plan.price === 0 ? "₹0" : `₹${plan.price}`}
                      </span>
                      {plan.period && <span style={{ color: "var(--ox-muted)", fontSize: "13px" }}>/ {plan.period}</span>}
                    </div>
                  </div>

                  <ul style={{ marginBottom: "28px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2" style={{ fontSize: "12.5px", color: "var(--ox-muted)", fontWeight: 400 }}>
                        <span style={{ color: "#34D399", marginTop: "2px", flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to={user ? "/dashboard" : plan.href}
                    className={isPopular ? "ox-btn-brand" : "ox-btn-ghost"}
                    style={{ textAlign: "center", fontSize: "13.5px", padding: "11px" }}>
                    {user ? "Open Dashboard" : plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--ox-border)", padding: "36px 6%", background: "#0c0c0c" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, color: "var(--ox-muted)", fontSize: "14px" }}>Incepta<span style={{ color: "var(--ox-orange)" }}>X</span></span>
          <p style={{ fontSize: "12px", color: "var(--ox-subtle)" }}>© {new Date().getFullYear()} InceptaX · Building the future, one commit at a time.</p>
        </div>
      </footer>
    </div>
  );
}
