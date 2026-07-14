import { Scale, Target, Calendar, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Panel, StatCard } from "../../components/UI";
import { attendanceThisMonth, feeSummary, getNotifications } from "../../lib/store";

export default function Dashboard() {
  const { member } = useAuth();
  if (!member) return null;

  const daysThisMonth = attendanceThisMonth(member.id);
  const { pending } = feeSummary(member.id);
  const notifications = getNotifications(member.id).slice(0, 3);

  const current = Number(member.currentWeight) || 0;
  const target = Number(member.targetWeight) || 0;
  const hasGoal = member.currentWeight && member.targetWeight;
  const total = hasGoal ? Math.abs(current - target) : 0;
  const progressPct = hasGoal && total > 0
    ? Math.min(100, Math.max(0, 100 - (Math.abs(current - target) / total) * 100))
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          Hey, {member.name.split(" ")[0]} <span>👋</span>
        </h1>
        <p className="mt-1.5" style={{ color: "var(--color-muted)" }}>
          Your fitness journey at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Current wt."
          value={member.currentWeight ? `${member.currentWeight} kg` : "0 kg"}
          icon={<Scale size={16} />}
        />
        <StatCard
          label="Target wt."
          value={member.targetWeight ? `${member.targetWeight} kg` : "0 kg"}
          icon={<Target size={16} />}
        />
        <StatCard label="This month" value={`${daysThisMonth} days`} icon={<Calendar size={16} />} />
        <StatCard
          label="Pending fee"
          value={`$${pending}`}
          icon={<Activity size={16} color="#fff" />}
          iconBg="var(--color-accent)"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel>
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
            <span style={{ color: "var(--color-accent)" }}>◎</span> Goal Progress
          </h2>
          {member.goal ? (
            <>
              <p className="mb-4" style={{ color: "var(--color-muted)" }}>{member.goal}</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-panel-2)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progressPct}%`, background: "var(--color-accent)" }}
                />
              </div>
              <p className="mono text-xs mt-2" style={{ color: "var(--color-muted)" }}>
                {member.currentWeight || 0}kg → {member.targetWeight || 0}kg
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "var(--color-muted)" }}>Set your fitness goal in your profile.</p>
              <div className="h-2 rounded-full overflow-hidden mt-4" style={{ background: "var(--color-panel-2)" }}>
                <div className="h-full rounded-full" style={{ width: "6%", background: "var(--color-accent)" }} />
              </div>
              <p className="mono text-xs mt-2" style={{ color: "var(--color-muted)" }}>0kg → 0kg</p>
            </>
          )}
        </Panel>

        <Panel>
          <h2 className="font-bold text-lg mb-3">Latest Notifications</h2>
          {notifications.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }}>No notifications.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div key={n.id} className="pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
