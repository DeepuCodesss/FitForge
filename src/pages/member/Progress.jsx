import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, EmptyState, Button, Input } from "../../components/UI";
import { getProgress, addProgress, updateMember } from "../../lib/store";

export default function Progress() {
  const { member, refreshMember } = useAuth();
  const [, setTick] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!member) return;
    let alive = true;
    (async () => {
      const data = await getProgress(member.id);
      if (alive) setEntries(Array.isArray(data) ? data : []);
    })();
    return () => {
      alive = false;
    };
  }, [member, showForm]);

  if (!member) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!weight) return;
    (async () => {
      const item = await addProgress(member.id, { weight: Number(weight), bodyFat: bodyFat ? Number(bodyFat) : null, note });
      await updateMember(member.id, { currentWeight: weight, ...(bodyFat ? { bodyFat } : {}) });
      await refreshMember();
      setEntries((current) => [item, ...current]);
    })();
    setWeight("");
    setBodyFat("");
    setNote("");
    setShowForm(false);
    setTick((t) => t + 1);
  };

  const maxW = Math.max(...entries.map((e) => e.weight), 1);
  const minW = Math.min(...entries.map((e) => e.weight), 0);

  return (
    <div>
      <PageHeader
        title="Progress"
        subtitle={`${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}
        right={<Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "Add Entry"}</Button>}
      />

      {showForm && (
        <Panel className="mb-6">
          <form onSubmit={submit} className="grid md:grid-cols-3 gap-4 items-end">
            <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            <Input label="Body Fat (%)" type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
            <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" className="md:col-span-3">Save Entry</Button>
          </form>
        </Panel>
      )}

      {entries.length === 0 ? (
        <EmptyState>0 entries. Log your weight to start tracking progress.</EmptyState>
      ) : (
        <>
          <Panel className="mb-6">
            <div className="flex items-end gap-3 h-40">
              {entries.slice().reverse().map((e) => {
                const range = maxW - minW || 1;
                const h = 20 + ((e.weight - minW) / range) * 100;
                return (
                  <div key={e.id} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-lg"
                      style={{ height: `${h}px`, background: "var(--color-accent)" }}
                      title={`${e.weight}kg on ${e.date}`}
                    />
                    <span className="mono text-[10px]" style={{ color: "var(--color-muted)" }}>
                      {e.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="flex flex-col gap-3">
            {entries.map((e) => (
              <Panel key={e.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="mono text-sm" style={{ color: "var(--color-muted)" }}>{e.date}</p>
                  {e.note && <p className="mt-0.5">{e.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold">{e.weight} kg</p>
                  {e.bodyFat && (
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>{e.bodyFat}% fat</p>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
