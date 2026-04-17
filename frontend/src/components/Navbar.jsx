import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const IXLogo = () => (
  <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
    <div className="relative">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>
        <span className="font-display font-black text-white text-sm tracking-tight">IX</span>
      </div>
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: "0 0 16px rgba(79,70,229,0.6)" }} />
    </div>
    <span className="font-display font-bold text-lg text-ix-white tracking-tight">
      Incept<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}>aX</span>
    </span>
  </Link>
);

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link to={to} className={`text-sm font-body font-medium transition-colors duration-200 ${active ? "text-ix-white" : "text-ix-muted hover:text-ix-text"}`}>
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
  const avatar = user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "U"}&backgroundColor=4f46e5&textColor=ffffff`;

  return (
    <nav className="sticky top-0 z-50 border-b border-ix-border" style={{ background: "rgba(3,3,10,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
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
                <span className="premium-badge text-xs">✦ Premium</span>
              )}
              <Link to={`/u/${user.username}`} className="flex items-center gap-2 group">
                <img src={avatar} alt="" className="w-8 h-8 rounded-lg border border-ix-border group-hover:border-ix-primary transition-colors" />
                <span className="text-sm font-body text-ix-muted group-hover:text-ix-text transition-colors">
                  {user.name?.split(" ")[0]}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-1.5">Sign out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/login" className="btn-brand">Get started →</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-ix-muted hover:text-ix-white transition-colors p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-ix-border bg-ix-card px-4 py-4 space-y-3">
          {[["Challenges", "/challenges"], ["Leaderboard", "/leaderboard"], ["Pricing", "/pricing"]].map(([label, to]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block text-sm font-body text-ix-muted hover:text-ix-white py-1">{label}</Link>
          ))}
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-sm font-body text-ix-muted hover:text-ix-white py-1">Dashboard</Link>}
          <div className="pt-2 border-t border-ix-border">
            {user ? (
              <div className="space-y-2">
                <Link to={`/u/${user.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                  <img src={avatar} className="w-7 h-7 rounded-lg" alt="" />
                  <span className="text-sm text-ix-text">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost w-full text-left text-xs">Sign out</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-brand block text-center">Get started →</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
