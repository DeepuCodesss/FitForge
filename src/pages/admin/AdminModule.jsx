import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader, Panel, StatCard, Badge } from "../../components/UI";
import { Skeleton } from "../../components/Skeleton";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

const CHARTS = [
  "Member Growth",
  "Revenue",
  "Attendance",
  "Workout Progress",
  "Membership Plans",
  "Fee Collection",
];

export default function AdminModule() {
  const { section = "" } = useParams();
  const [data, setData] = useState({
    title: "Admin Module",
    description: "Live workspace for gym operations.",
    stats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/modules/${section}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (!alive) return;
        setData({
          title: json?.title || "Admin Module",
          description: json?.description || "Live workspace for gym operations.",
          stats: Array.isArray(json?.stats) ? json.stats : [],
        });
      } catch {
        if (alive) {
          setData({
            title: "Admin Module",
            description: "Could not load module data.",
            stats: [],
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [section]);

  const bars = useMemo(() => [72, 52, 84, 66, 90, 58, 78, 64], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        subtitle={data.description}
        right={<Badge tone="accent">Live workspace</Badge>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))
          : data.stats.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} />
            ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Module Snapshot</h2>
            <Badge>Auto-refresh</Badge>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-28 mt-4" />
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>{data.description}</p>
          )}
        </Panel>

        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <h2 className="font-bold text-lg mb-4">Live Charts</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CHARTS.map((item) => (
              <div
                key={item}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ background: "rgba(31, 26, 22, 0.7)", borderColor: "var(--color-border)" }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 h-40">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-xl"
                  style={{
                    height: `${h}%`,
                    minHeight: 24,
                    background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-2))",
                  }}
                />
                <span className="mono text-[10px]" style={{ color: "var(--color-muted)" }}>
                  Q{i + 1}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
