import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { ProjectCard } from "@/components/ui/project-card";
// Add import at top
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";
const features = [
  {
    title: "AI Evaluation",
    desc: "Every submission is analyzed by GPT for code quality, structure, and real-world impact.",
    img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
  },
  {
    title: "Per-Project Rankings",
    desc: "See exactly where you rank on every challenge — not just globally.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
  },
  {
    title: "Team Collaboration",
    desc: "Invite partners, build together, and chat in real time. Premium plans only.",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
  },
  {
    title: "Admin-Curated Quality",
    desc: "Admins review AI results before publishing — no junk scores, ever.",
    img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop",
  },
  {
    title: "GitHub Integration",
    desc: "Submit your public repo directly. We analyse your commit history, README, and code.",
    img: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop",
  },
  {
    title: "Public Portfolio",
    desc: "Every published project lives at /u/username — a live portfolio you can share with recruiters.",
    img: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop",
  },
];
const plans = [
  { id: "free", name: "Free", price: 0, period: null, tag: null, features: ["All public challenges", "AI evaluation (after admin review)", "Public portfolio at /u/username", "Global + per-project leaderboard", "Community access"], cta: "Start Free", href: "/login" },
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

          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(46px, 6vw, 80px)", lineHeight: 1.0, letterSpacing: "-0.04em", color: "var(--ox-text)", marginBottom: "22px" }}>
            Where builders<br />
            <em style={{ fontStyle: "normal", color: "var(--ox-orange)" }}>get ranked</em>
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
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {features.map((f) => (
    <ProjectCard
      key={f.title}
      imgSrc={f.img}
      title={f.title}
      description={f.desc}
      link="#"
      linkText="Learn more"
    />
  ))}
</div>
        </div>
      </section>
      
      {/* Testimonials */}
<section style={{ padding: "88px 6%" }}>
  <div className="max-w-5xl mx-auto">
    <div className="text-center" style={{ marginBottom: "52px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Wall of Love</p>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", color: "var(--ox-text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Builders who leveled up</h2>
      <p style={{ color: "var(--ox-muted)", fontSize: "15px", fontWeight: 300 }}>Real results from real developers.</p>
    </div>
    <TestimonialCarousel />
  </div>
</section>

<div className="ox-glow-line" style={{ maxWidth: "900px", margin: "0 auto" }} />

      {/* Pricing */}
      <section style={{ padding: "88px 6%" }} id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: "52px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ox-orange)", marginBottom: "8px" }}>Pricing</p>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.2vw,40px)", color: "var(--ox-text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "10px" }}>Simple, honest plans</h2>
            <p style={{ color: "var(--ox-muted)", fontSize: "15px", fontWeight: 300 }}>Start free. Upgrade when you need teams.</p>
          </div>

         <div className="grid md:grid-cols-3 gap-5 items-stretch">
  {plans.map((plan) => {
    const isPopular = plan.id === "monthly";
    return (
      <div key={plan.id} style={{
        padding: "6px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: isPopular ? "var(--ox-orange-bd)" : "var(--ox-border)",
        boxShadow: isPopular ? "0 0 48px rgba(255,107,0,0.12), 0 0 0 1px rgba(255,107,0,0.22)" : "0 20px 60px rgba(0,0,0,0.4)",
        background: "var(--ox-card, #111)",
        backdropFilter: "blur(12px)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Tag */}
        {plan.tag && (
          <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", padding: "3px 14px", borderRadius: "100px", fontSize: "11px", fontFamily: "'Inter',sans-serif", fontWeight: 700, background: "var(--ox-orange)", color: "#fff", whiteSpace: "nowrap" }}>
            {plan.tag}
          </div>
        )}

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "4px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, height: "120px", borderRadius: "inherit", background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)", pointerEvents: "none" }} />

          {/* Plan name + badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ox-muted)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{plan.name}</span>
            <span style={{ border: "1px solid", borderColor: isPopular ? "rgba(255,107,0,0.4)" : "var(--ox-border)", color: isPopular ? "var(--ox-orange)" : "var(--ox-muted)", borderRadius: "100px", padding: "2px 10px", fontSize: "11px", fontWeight: 500 }}>
              {plan.price === 0 ? "No credit card" : isPopular ? "Best Value" : "Short & focused"}
            </span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "16px" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "36px", color: "var(--ox-text)", letterSpacing: "-0.03em" }}>
              {plan.price === 0 ? "₹0" : `₹${plan.price}`}
            </span>
            {plan.period && <span style={{ fontSize: "13px", color: "var(--ox-muted)", paddingBottom: "6px" }}>/ {plan.period}</span>}
          </div>

          {/* CTA */}
          <Link
            to={user ? "/dashboard" : plan.href}
            style={{
              display: "block", width: "100%", padding: "11px", fontSize: "13.5px",
              borderRadius: "10px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600,
              textAlign: "center", textDecoration: "none", transition: "all .2s ease",
              ...(isPopular
                ? { background: "linear-gradient(to bottom, #ff6b00, #e55a00)", color: "#fff", border: "none", boxShadow: "0 10px 25px rgba(255,107,0,0.3)" }
                : { background: "rgba(255,255,255,0.06)", color: "var(--ox-text)", border: "1px solid var(--ox-border)" }
              ),
            }}
          >
            {user ? "Open Dashboard" : plan.cta}
          </Link>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {plan.features.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "var(--ox-muted)" }}>
              <span style={{ color: "#34D399", flexShrink: 0, marginTop: "1px" }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
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