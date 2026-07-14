import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, EmptyState, Button, Textarea } from "../../components/UI";
import { getFeedback, addFeedback } from "../../lib/store";

export default function Feedback() {
  const { member } = useAuth();
  const [, setTick] = useState(0);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);

  if (!member) return null;

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await getFeedback(member.id);
      if (alive) setItems(Array.isArray(data) ? data : []);
    })();
    return () => {
      alive = false;
    };
  }, [member.id]);

  const submit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    addFeedback(member.id, message.trim());
    setMessage("");
    setTick((t) => t + 1);
  };

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Tell us what's working and what's not" />

      <Panel className="mb-6">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Textarea
            rows={4}
            placeholder="Share your feedback about the gym, trainers, or this app..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" className="self-start">Send Feedback</Button>
        </form>
      </Panel>

      {items.length === 0 ? (
        <EmptyState>You haven't sent any feedback yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((f) => (
            <Panel key={f.id}>
              <p className="mono text-xs" style={{ color: "var(--color-muted)" }}>{f.date}</p>
              <p className="mt-2">{f.message}</p>
              {f.response && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
                    Admin response
                  </p>
                  <p className="mt-1" style={{ color: "var(--color-muted)" }}>{f.response}</p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
