import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, Badge, Button, EmptyState } from "../../components/UI";
import { getAttendance, markAttendance, attendanceThisMonth, todayISO } from "../../lib/store";

export default function Attendance() {
  const { member } = useAuth();
  const [, setTick] = useState(0);
  const [records, setRecords] = useState([]);
  const [days, setDays] = useState(0);

  useEffect(() => {
    if (!member) return;
    let alive = true;
    (async () => {
      const [loadedRecords, loadedDays] = await Promise.all([
        getAttendance(member.id),
        attendanceThisMonth(member.id),
      ]);
      if (!alive) return;
      setRecords(Array.isArray(loadedRecords) ? loadedRecords : []);
      setDays(Number(loadedDays) || 0);
    })();
    return () => {
      alive = false;
    };
  }, [member]);

  if (!member) return null;

  const markedToday = records.some((r) => r.date === todayISO());

  const checkIn = () => {
    markAttendance(member.id, todayISO(), "present");
    setTick((t) => t + 1);
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={`${days} day${days === 1 ? "" : "s"} this month`}
        right={
          !markedToday && (
            <Button onClick={checkIn}>Check In Today</Button>
          )
        }
      />

      {records.length === 0 ? (
        <EmptyState>No attendance records yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <Panel key={r.id} className="flex items-center justify-between py-4">
              <span className="mono">{r.date}</span>
              <Badge tone="accent">{r.status}</Badge>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
