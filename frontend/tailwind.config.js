/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ix: {
          // Core backgrounds
          bg: "#000000",
          surface: "#0a0a0a",
          card: "#111111",
          "card-hover": "#1a1a1a",
          border: "#222222",
          "border-bright": "#333333",
          // Brand
          primary: "#f97316",
          "primary-hover": "#ea580c",
          "primary-glow": "rgba(249,115,22,0.15)",
          cyan: "#facc15",
          "cyan-glow": "rgba(250,204,21,0.15)",
          // Text
          white: "#f0f0ff",
          text: "#c8cce8",
          muted: "#6b7280",
          subtle: "#9198b8",
          // Status
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          // Rank
          gold: "#fbbf24",
          silver: "#94a3b8",
          bronze: "#cd7c3a",
          // Plan
          premium: "#a78bfa",
        },
      },
      backgroundImage: {
        "ix-grid": "linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)",
        "ix-hero": "radial-gradient(ellipse 80% 50% at 50% -10%,rgba(249,115,22,0.2) 0%,transparent 70%)",
        "ix-card-shine": "linear-gradient(135deg,rgba(255,255,255,0.03) 0%,transparent 50%)",
        "brand-gradient": "linear-gradient(135deg,#f97316 0%,#facc15 100%)",
        "premium-gradient": "linear-gradient(135deg,#ea580c 0%,#f97316 50%,#facc15 100%)",
      },
      boxShadow: {
        "ix-glow": "0 0 40px rgba(249,115,22,0.12)",
        "ix-card": "0 1px 3px rgba(0,0,0,0.4),0 0 0 1px rgba(249,115,22,0.05)",
        "ix-primary": "0 4px 24px rgba(249,115,22,0.3)",
        "ix-cyan": "0 4px 24px rgba(250,204,21,0.25)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        shimmer: "shimmer 2s infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [],
};
