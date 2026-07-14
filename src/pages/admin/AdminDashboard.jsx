import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Activity, CreditCard, CalendarCheck } from "lucide-react";
import { PageHeader, Panel, StatCard, Badge } from "../../components/UI";
import { listMembers, getDB, todayISO } from "../../lib/store";

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [db, setDB] = useState({ fees: [], attendance: [] });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedMembers, loadedDB] = await Promise.all([listMembers(), getDB()]);
      if (!alive) return;
      setMembers(loadedMembers);
      setDB(loadedDB);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const active = members.filter((m) => m.status === "active").length;
  const revenue = db.fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const presentToday = db.attendance.filter((a) => a.date === todayISO() && a.status === "present").length;

  return (
    <div>
      <PageHeader title="Overview" subtitle="Gym-wide snapshot" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Members" value={members.length} icon={<Users size={16} />} />
        <StatCard label="Active" value={active} icon={<Activity size={16} />} />
        <StatCard label="Revenue Collected" value={`$${revenue}`} icon={<CreditCard size={16} color="#fff" />} iconBg="var(--color-accent)" />
        <StatCard label="Present Today" value={presentToday} icon={<CalendarCheck size={16} />} />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Members</h2>
          <Link to="/admin/members" className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
            View all
          </Link>
        </div>
        <div className="flex flex-col">
          {members.slice(0, 6).map((m) => (
            <Link
              key={m.id}
              to={`/admin/members/${m.id}`}
              className="flex items-center justify-between py-3 border-b last:border-0 hover:opacity-80"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0"
                  style={{ background: "var(--color-panel-2)" }}
                >
                  {m.name[0]?.toUpperCase()}
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
  );
}
