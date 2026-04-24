import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const IXLogo = () => (
  <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" style={{ textDecoration: "none" }}>
  <div className="relative">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--ox-orange)", boxShadow: "0 0 16px rgba(255,107,0,0.35)" }}>
      <svg width="28" height="28" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ears */}
        <polygon points="9,18 6,6 14,14" fill="white"/>
        <polygon points="29,18 32,6 24,14" fill="white"/>
        {/* face */}
        <ellipse cx="19" cy="24" rx="11" ry="10" fill="white"/>
        {/* snout */}
        <ellipse cx="19" cy="28" rx="5" ry="3.5" fill="#FF6B00" opacity="0.25"/>
        {/* eyes */}
        <ellipse cx="15" cy="22" rx="2.5" ry="3" fill="#1a1a1a"/>
        <ellipse cx="23" cy="22" rx="2.5" ry="3" fill="#1a1a1a"/>
        <circle cx="16" cy="21" r="1" fill="white"/>
        <circle cx="24" cy="21" r="1" fill="white"/>
        {/* nose */}
        <ellipse cx="19" cy="27" rx="1.5" ry="1" fill="#1a1a1a"/>
      </svg>
    </div>
  </div>
  <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--ox-text)", letterSpacing: "-0.03em" }}>
    Incepta<span style={{ color: "var(--ox-orange)" }}>X</span>
  </span>
</Link>
 )
const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link to={to} style={{
      fontSize: "14px", fontFamily: "'Inter',sans-serif", fontWeight: 500,
      color: active ? "var(--ox-text)" : "var(--ox-muted)",
      textDecoration: "none", transition: "color .2s"
    }}
    onMouseEnter={e => { if (!active) e.target.style.color = "var(--ox-text)"; }}
    onMouseLeave={e => { if (!active) e.target.style.color = "var(--ox-muted)"; }}>
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
    setMenuOpen(false);
  };

  const isPremium = user?.plan !== "free" && user?.planExpiresAt && new Date() < new Date(user.planExpiresAt);
  const avatar =
    user?.profileImage && user.profileImage.startsWith("http")
      ? user.profileImage
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || "U")}&backgroundColor=FF6B00&textColor=ffffff`;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--ox-border)",
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(20px)"
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: "66px" }}>
        <IXLogo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/challenges">Challenges</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/pricing">Pricing</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isPremium && (
                <span className="ox-premium-badge">✦ Premium</span>
              )}
              <Link to={`/u/${user.username}`} className="flex items-center gap-2 group" style={{ textDecoration: "none" }}>
                <img src={avatar} alt="" className="w-8 h-8 rounded-lg" style={{ border: "1px solid var(--ox-border)", transition: "border-color .2s" }}
                  onMouseEnter={e => e.target.style.borderColor = "var(--ox-orange-bd)"}
                  onMouseLeave={e => e.target.style.borderColor = "var(--ox-border)"}
                />
                <span style={{ fontSize: "13.5px", color: "var(--ox-muted)", transition: "color .2s", fontFamily: "'Inter',sans-serif" }}
                  onMouseEnter={e => e.target.style.color = "var(--ox-text)"}
                  onMouseLeave={e => e.target.style.color = "var(--ox-muted)"}>
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button onClick={handleLogout} className="ox-btn-ghost" style={{ fontSize: "12px", padding: "6px 14px" }}>Sign out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="ox-btn-ghost" style={{ fontSize: "13px", padding: "8px 16px" }}>Sign in</Link>
              <Link to="/login" className="ox-btn-primary" style={{ fontSize: "13px", padding: "8px 18px" }}>Get started →</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: "var(--ox-muted)", background: "none", border: "none", cursor: "pointer" }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid var(--ox-border)", background: "#0c0c0c", padding: "16px" }} className="md:hidden space-y-3">
          {[["Challenges", "/challenges"], ["Leaderboard", "/leaderboard"], ["Pricing", "/pricing"]].map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={{ display: "block", fontSize: "14px", color: "var(--ox-muted)", textDecoration: "none", padding: "4px 0" }}>{label}</Link>
          ))}
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)}
            style={{ display: "block", fontSize: "14px", color: "var(--ox-muted)", textDecoration: "none", padding: "4px 0" }}>Dashboard</Link>}
          <div style={{ paddingTop: "8px", borderTop: "1px solid var(--ox-border)" }}>
            {user ? (
              <div className="space-y-2">
                <Link to={`/u/${user.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                  <img src={avatar} className="w-7 h-7 rounded-lg" alt="" style={{ border: "1px solid var(--ox-border)" }} />
                  <span style={{ fontSize: "13px", color: "var(--ox-text)", fontFamily: "'Inter',sans-serif" }}>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="ox-btn-ghost w-full" style={{ fontSize: "12px", padding: "7px 14px", textAlign: "left", justifyContent: "flex-start" }}>Sign out</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="ox-btn-brand" style={{ display: "block", textAlign: "center", fontSize: "13px" }}>Get started →</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
