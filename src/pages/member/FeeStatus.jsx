import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, Badge, EmptyState } from "../../components/UI";
import { getFees, feeSummary } from "../../lib/store";

export default function FeeStatus() {
  const { member } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, paid: 0 });
  if (!member) return null;

  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedFees, loadedSummary] = await Promise.all([
        getFees(member.id),
        feeSummary(member.id),
      ]);
      if (!alive) return;
      setFees(Array.isArray(loadedFees) ? loadedFees : []);
      setSummary(loadedSummary || { pending: 0, paid: 0 });
    })();
    return () => {
      alive = false;
    };
  }, [member.id]);
  const { pending, paid } = summary;

  return (
    <div>
      <PageHeader title="Fee Status" subtitle="Your payment history" />

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <Panel>
          <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
            Pending
          </p>
          <p className="text-3xl font-bold mt-2" style={{ color: pending > 0 ? "var(--color-accent)" : "var(--color-text)" }}>
            ${pending}
          </p>
        </Panel>
        <Panel>
          <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
            Paid to date
          </p>
          <p className="text-3xl font-bold mt-2">${paid}</p>
        </Panel>
      </div>

      {fees.length === 0 ? (
        <EmptyState>No payment history yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {fees.map((f) => (
            <Panel key={f.id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-bold text-lg">${f.amount}</p>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>due {f.due}</p>
              </div>
              <Badge tone={f.status === "paid" ? "accent" : "default"}>{f.status}</Badge>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
