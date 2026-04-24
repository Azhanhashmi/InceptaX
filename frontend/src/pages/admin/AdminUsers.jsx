import { useState, useEffect } from "react";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try { const r = await adminApi.get("/users"); setUsers(r.data.users); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const grantPlan = async (userId, currentPlan) => {
    const plan = prompt(`Grant plan (free / ten_day / monthly)\nCurrent: ${currentPlan}`);
    if (!plan) return;
    if (!["free", "ten_day", "monthly"].includes(plan)) return toast.error("Invalid plan");
    const days = plan === "ten_day" ? 10 : plan === "monthly" ? 30 : 0;
    try {
      await adminApi.patch(`/users/${userId}/plan`, { plan, days });
      toast.success(`Plan updated to ${plan}`);
      fetchData();
    } catch { toast.error("Update failed"); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const planColor = { free: "var(--ox-muted)", ten_day: "#60a5fa", monthly: "var(--ox-orange)" };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between" style={{ marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--ox-text)", marginBottom: "4px" }}>Users</h1>
          <p style={{ color: "var(--ox-muted)", fontSize: "13.5px" }}>{users.length} registered users</p>
        </div>
        <input className="ox-input" style={{ width: "260px", padding: "9px 14px", fontSize: "13px" }}
          placeholder="Search name, email, username…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{Array(6).fill(0).map((_, i) => <div key={i} className="ox-skeleton" style={{ height: "64px" }} />)}</div>
      ) : (
        <div className="ox-card" style={{ overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "4fr 3fr 2fr 2fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--ox-border)", fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ox-subtle)" }}>
            <div>User</div><div>Email</div><div>Plan</div><div>Joined</div><div />
          </div>
          {filtered.map((u, idx) => {
            const isPremiumActive = u.plan !== "free" && u.planExpiresAt && new Date() < new Date(u.planExpiresAt);
            return (
              <div key={u._id} style={{
                display: "grid", gridTemplateColumns: "4fr 3fr 2fr 2fr 1fr",
                padding: "14px 20px", alignItems: "center", transition: "background .2s",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--ox-border)" : "none"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#0e0e0e"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <div className="flex items-center gap-3">
                  <img src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=FF6B00&textColor=ffffff`}
                    style={{ width: "32px", height: "32px", borderRadius: "9px", border: "1px solid var(--ox-border)", flexShrink: 0 }} alt="" />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: "13px", color: "var(--ox-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>@{u.username}</p>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "var(--ox-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                <div>
                  <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: planColor[u.plan] || "var(--ox-muted)" }}>
                    {u.plan}{isPremiumActive ? " ✓" : u.plan !== "free" ? " (exp)" : ""}
                  </span>
                  {isPremiumActive && u.planExpiresAt && (
                    <p style={{ fontSize: "10px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace", marginTop: "2px" }}>until {format(new Date(u.planExpiresAt), "MMM d")}</p>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "var(--ox-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                  {format(new Date(u.createdAt), "MMM d, yyyy")}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => grantPlan(u._id, u.plan)} className="ox-btn-ghost" style={{ fontSize: "11px", padding: "5px 10px" }}>
                    Plan ↑
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "var(--ox-muted)", fontSize: "13.5px" }}>No users found.</div>}
        </div>
      )}
    </div>
  );
}
