import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const testimonials = [
  {
    name: "Michael Chen",
    title: "Senior Software Engineer, Cloud Infrastructure",
    description: "InceptaX completely changed how I approach portfolio building. The AI feedback was brutally honest and helped me land my first FAANG offer.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop",
    githubUrl: "#", twitterUrl: "#", youtubeUrl: "#", linkedinUrl: "#",
  },
  {
    name: "Jessica Roberts",
    title: "Lead Frontend Engineer, InsightX",
    description: "The per-project leaderboard kept me motivated. Seeing my rank improve week over week pushed me to write cleaner, more production-ready code.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop",
    githubUrl: "#", twitterUrl: "#", youtubeUrl: "#", linkedinUrl: "#",
  },
  {
    name: "William Carter",
    title: "VP Product, NovaLabs",
    description: "I shared my /u/username portfolio link with recruiters instead of a resume. Three interviews in one week. InceptaX is the real deal.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop",
    githubUrl: "#", twitterUrl: "#", youtubeUrl: "#", linkedinUrl: "#",
  },
];

export function TestimonialCarousel({ className }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => setCurrentIndex((i) => (i + 1) % testimonials.length);
  const handlePrevious = () => setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[currentIndex];

  const socialIcons = [
    { icon: GithubIcon, url: t.githubUrl, label: "GitHub" },
    { icon: TwitterIcon, url: t.twitterUrl, label: "Twitter" },
    { icon: YoutubeIcon, url: t.youtubeUrl, label: "YouTube" },
    { icon: LinkedinIcon, url: t.linkedinUrl, label: "LinkedIn" },
  ];

  return (
    <div className={cn("w-full max-w-5xl mx-auto px-4", className)}>
      {/* Desktop */}
      <div className="hidden md:flex relative items-center">
        <div style={{ width: "420px", height: "420px", borderRadius: "20px", overflow: "hidden", flexShrink: 0, background: "#1a1a1a" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={t.imageUrl}
              src={t.imageUrl}
              alt={t.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        <div style={{ background: "var(--ox-card, #111)", border: "1px solid var(--ox-border)", borderRadius: "20px", padding: "36px", marginLeft: "-70px", zIndex: 10, flex: 1, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={t.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--ox-text)", marginBottom: "6px" }}>{t.name}</h2>
              <p style={{ fontSize: "13px", color: "var(--ox-orange)", marginBottom: "18px", fontWeight: 500 }}>{t.title}</p>
              <p style={{ fontSize: "14px", color: "var(--ox-muted)", lineHeight: 1.8, marginBottom: "28px" }}>{t.description}</p>
              <div style={{ display: "flex", gap: "12px" }}>
                {socialIcons.map(({ icon: Icon, url, label }) => (
                  <a key={label} href={url || "#"} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid var(--ox-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ox-muted)", transition: "all .2s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--ox-orange)"; e.currentTarget.style.color = "var(--ox-orange)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ox-border)"; e.currentTarget.style.color = "var(--ox-muted)"; }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden text-center">
        <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "16px", overflow: "hidden", marginBottom: "24px", background: "#1a1a1a" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={t.imageUrl}
              src={t.imageUrl}
              alt={t.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              draggable={false}
            />
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--ox-text)", marginBottom: "4px" }}>{t.name}</h2>
            <p style={{ fontSize: "12px", color: "var(--ox-orange)", marginBottom: "14px" }}>{t.title}</p>
            <p style={{ fontSize: "13.5px", color: "var(--ox-muted)", lineHeight: 1.8, marginBottom: "20px" }}>{t.description}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              {socialIcons.map(({ icon: Icon, url, label }) => (
                <a key={label} href={url || "#"} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid var(--ox-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ox-muted)" }}>
                  <Icon />
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "36px" }}>
        <button onClick={handlePrevious} aria-label="Previous"
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--ox-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ox-muted)", cursor: "pointer" }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)} aria-label={`Go to ${i + 1}`}
              style={{ width: "10px", height: "10px", borderRadius: "50%", border: "none", cursor: "pointer", background: i === currentIndex ? "var(--ox-orange)" : "rgba(255,255,255,0.2)", transition: "background .2s" }} />
          ))}
        </div>
        <button onClick={handleNext} aria-label="Next"
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--ox-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ox-muted)", cursor: "pointer" }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}