import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, EmptyState } from "../../components/UI";
import { getNotifications, markNotificationRead } from "../../lib/store";

export default function Notifications() {
  const { member } = useAuth();
  const [, setTick] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!member) return;
    let alive = true;
    (async () => {
      const data = await getNotifications(member.id);
      if (alive) setNotifications(Array.isArray(data) ? data : []);
    })();
    return () => {
      alive = false;
    };
  }, [member]);

  if (!member) return null;

  const read = (id) => {
    markNotificationRead(member.id, id);
    setTick((t) => t + 1);
  };

  return (
    <div>
      <PageHeader title="Notifications" subtitle={`${notifications.filter((n) => !n.read).length} unread`} />

      {notifications.length === 0 ? (
        <EmptyState>No notifications.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <Panel
              key={n.id}
              className="cursor-pointer"
              onClick={() => read(n.id)}
              style={{ opacity: n.read ? 0.6 : 1 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{n.title}</p>
                  <p style={{ color: "var(--color-muted)" }} className="mt-1">{n.message}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "var(--color-accent)" }} />}
              </div>
              <p className="mono text-xs mt-3" style={{ color: "var(--color-muted)" }}>{n.date}</p>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
