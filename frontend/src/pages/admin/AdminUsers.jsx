import { useState, useEffect } from "react";
import { format } from "date-fns";
import adminApi from "../../services/adminApi";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try { const r = await adminApi.get("/users"); setUsers(r.data.users); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const grantPlan = async (userId, currentPlan) => {
    const plan = prompt(`Grant plan (free / ten_day / monthly)\nCurrent: ${currentPlan}`);
    if (!plan) return;
    if (!["free", "ten_day", "monthly"].includes(plan)) return toast.error("Invalid plan");
    const days = plan === "ten_day" ? 10 : plan === "monthly" ? 30 : 0;
    try {
      await adminApi.patch(`/users/${userId}/plan`, { plan, days });
      toast.success(`Plan updated to ${plan}`);
      fetch();
    } catch { toast.error("Update failed"); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const planColor = { free: "text-ix-muted", ten_day: "text-ix-cyan", monthly: "text-ix-premium" };

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ix-white">Users</h1>
          <p className="text-ix-muted text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <input className="ix-input w-64" placeholder="Search name, email, username…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array(6).fill(0).map((_, i) => <div key={i} className="ix-card h-16 skeleton" />)}</div>
      ) : (
        <div className="ix-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-5 py-2.5 border-b border-ix-border text-xs font-mono uppercase tracking-widest text-ix-muted">
            <div className="col-span-4">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1" />
          </div>
          <div className="divide-y divide-ix-border">
            {filtered.map((u) => {
              const isPremiumActive = u.plan !== "free" && u.planExpiresAt && new Date() < new Date(u.planExpiresAt);
              return (
                <div key={u._id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-ix-card-hover transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <img src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=1e1e4e&textColor=ffffff`}
                      className="w-8 h-8 rounded-lg border border-ix-border flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <p className="font-display font-medium text-sm text-ix-white truncate">{u.name}</p>
                      <p className="text-xs text-ix-muted font-mono">@{u.username}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-xs text-ix-subtle truncate">{u.email}</div>
                  <div className="col-span-2">
                    <span className={`text-xs font-mono font-semibold ${planColor[u.plan] || "text-ix-muted"}`}>
                      {u.plan}{isPremiumActive ? " ✓" : u.plan !== "free" ? " (exp)" : ""}
                    </span>
                    {isPremiumActive && u.planExpiresAt && (
                      <p className="text-[10px] text-ix-muted">until {format(new Date(u.planExpiresAt), "MMM d")}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-xs text-ix-muted font-mono">
                    {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => grantPlan(u._id, u.plan)} className="btn-ghost text-xs px-2 py-1">
                      Plan ↑
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="p-10 text-center text-ix-muted">No users found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
