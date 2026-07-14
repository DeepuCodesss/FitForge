import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Activity,
  CreditCard,
  CalendarCheck,
  UserRoundCheck,
  MessageSquareMore,
  TrendingUp,
  ShieldCheck,
  BadgeIndianRupee,
  CalendarDays,
} from "lucide-react";
import { PageHeader, Panel, StatCard, Badge } from "../../components/UI";
import { Skeleton } from "../../components/Skeleton";
import { listMembers, getDB, todayISO } from "../../lib/store";

const bars = [58, 72, 62, 84, 68, 90, 76, 86];

function MiniChart({ title, values }) {
  return (
    <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <Badge tone="muted">Auto-refresh</Badge>
      </div>
      <div className="flex items-end gap-2 h-40">
        {values.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-xl"
              style={{
                height: `${value}%`,
                minHeight: 16,
                background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-2))",
                boxShadow: "0 10px 30px rgba(255, 106, 31, 0.16)",
              }}
            />
            <span className="mono text-[10px]" style={{ color: "var(--color-muted)" }}>
              W{index + 1}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [db, setDB] = useState({ fees: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let timer = null;

    const load = async () => {
      try {
        const [loadedMembers, loadedDB] = await Promise.all([listMembers(), getDB()]);
        if (!alive) return;
        const nextMembers = Array.isArray(loadedMembers)
          ? loadedMembers
          : Array.isArray(loadedMembers?.members)
            ? loadedMembers.members
            : [];
        setMembers(nextMembers);
        setDB({
          fees: Array.isArray(loadedDB?.fees) ? loadedDB.fees : [],
          attendance: Array.isArray(loadedDB?.attendance) ? loadedDB.attendance : [],
        });
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    timer = setInterval(load, 45000);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const safeMembers = Array.isArray(members) ? members : [];
  const safeFees = Array.isArray(db?.fees) ? db.fees : [];
  const safeAttendance = Array.isArray(db?.attendance) ? db.attendance : [];

  const summary = useMemo(() => {
    const activeMembers = safeMembers.filter((m) => m.status === "active").length;
    const inactiveMembers = safeMembers.length - activeMembers;
    const today = todayISO();
    const thisMonth = today.slice(0, 7);
    const todayAttendance = safeAttendance.filter((a) => a.date === today && a.status === "present").length;
    const monthlyAttendance = safeAttendance.filter((a) => a.date?.startsWith(thisMonth) && a.status === "present").length;
    const totalRevenue = safeFees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount || 0), 0);
    const monthlyRevenue = safeFees.filter((f) => f.status === "paid" && f.due?.startsWith(thisMonth)).reduce((s, f) => s + Number(f.amount || 0), 0);
    const pendingFees = safeFees.filter((f) => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + Number(f.amount || 0), 0);
    const paidFees = safeFees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount || 0), 0);
    const expiredMemberships = safeMembers.filter((m) => m.membershipExpiry && m.membershipExpiry < today).length;
    const newMembers = safeMembers.filter((m) => m.createdAt?.startsWith(thisMonth)).length;
    const feedbackCount = safeMembers.reduce((s, m) => s + (Array.isArray(m.feedback) ? m.feedback.length : 0), 0);
    const workoutCompletionRate = Math.min(100, Math.max(18, 52 + activeMembers * 2));
    const onlineMembers = Math.min(activeMembers, Math.max(1, Math.round(activeMembers * 0.4)));

    return {
      activeMembers,
      inactiveMembers,
      todayAttendance,
      monthlyAttendance,
      totalRevenue,
      monthlyRevenue,
      pendingFees,
      paidFees,
      expiredMemberships,
      newMembers,
      feedbackCount,
      workoutCompletionRate,
      onlineMembers,
    };
  }, [safeAttendance, safeFees, safeMembers]);

  const memberTrend = useMemo(() => [34, 42, 48, 57, 66, 72, 79], []);
  const revenueTrend = useMemo(() => [46, 54, 63, 58, 71, 82, 90], []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Overview" subtitle="Gym-wide snapshot" />
        <Panel className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-60" />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Live operations snapshot"
        right={<Badge tone="accent">Updating every 45s</Badge>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Members" value={safeMembers.length} icon={<Users size={16} />} />
        <StatCard label="Active Members" value={summary.activeMembers} icon={<Activity size={16} />} />
        <StatCard label="Inactive Members" value={summary.inactiveMembers} icon={<ShieldCheck size={16} />} />
        <StatCard label="New Members" value={summary.newMembers} icon={<TrendingUp size={16} />} />
        <StatCard label="Online Members" value={summary.onlineMembers} icon={<UserRoundCheck size={16} />} />
        <StatCard label="Today's Attendance" value={summary.todayAttendance} icon={<CalendarCheck size={16} />} />
        <StatCard label="Monthly Attendance" value={summary.monthlyAttendance} icon={<CalendarDays size={16} />} />
        <StatCard label="Total Revenue" value={`$${summary.totalRevenue}`} icon={<CreditCard size={16} color="#fff" />} iconBg="var(--color-accent)" />
        <StatCard label="Monthly Revenue" value={`$${summary.monthlyRevenue}`} icon={<BadgeIndianRupee size={16} />} />
        <StatCard label="Pending Fees" value={`$${summary.pendingFees}`} icon={<CreditCard size={16} />} />
        <StatCard label="Paid Fees" value={`$${summary.paidFees}`} icon={<CreditCard size={16} color="#fff" />} iconBg="var(--color-accent)" />
        <StatCard label="Expired Memberships" value={summary.expiredMemberships} icon={<ShieldCheck size={16} />} />
        <StatCard label="Feedback Count" value={summary.feedbackCount} icon={<MessageSquareMore size={16} />} />
        <StatCard label="Workout Completion" value={`${summary.workoutCompletionRate}%`} icon={<TrendingUp size={16} />} />
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <MiniChart title="Member Growth" values={memberTrend} />
        <MiniChart title="Revenue" values={revenueTrend} />
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <h3 className="font-bold text-lg mb-4">Attendance & Plan Mix</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Workout Progress", summary.workoutCompletionRate],
              ["Attendance", Math.min(100, summary.monthlyAttendance % 100)],
              ["Membership Plans", Math.min(100, 55 + summary.activeMembers)],
              ["Fee Collection", Math.min(100, summary.paidFees > 0 ? 78 : 14)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border p-4" style={{ borderColor: "var(--color-border)", background: "rgba(31,26,22,0.66)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>{label}</p>
                  <span className="text-sm font-semibold">{value}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-2))" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Members</h3>
            <Link to="/admin/members" className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
              View all
            </Link>
          </div>
          <div className="flex flex-col">
            {safeMembers.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                to={`/admin/members/${m.id}`}
                className="flex items-center justify-between py-3 border-b last:border-0 hover:opacity-80"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {m.name?.[0]?.toUpperCase() || "M"}
                  </div>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>{m.email}</p>
                  </div>
                </div>
                <Badge tone={m.status === "active" ? "accent" : "default"}>{m.status}</Badge>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
