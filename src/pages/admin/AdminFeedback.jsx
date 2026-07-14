import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Panel, EmptyState, Textarea, Button } from "../../components/UI";
import { allFeedback, respondFeedback, listMembers } from "../../lib/store";

export default function AdminFeedback() {
  const [, setTick] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [items, setItems] = useState([]);
  const [memberNames, setMemberNames] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const [feedbackData, membersData] = await Promise.all([allFeedback(), listMembers()]);
      if (!alive) return;
      setItems(Array.isArray(feedbackData) ? feedbackData : []);
      setMemberNames(
        Object.fromEntries((Array.isArray(membersData) ? membersData : []).map((m) => [m.id, m.name]))
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  const respond = (id) => {
    const text = drafts[id];
    if (!text?.trim()) return;
    respondFeedback(id, text.trim());
    setDrafts((d) => ({ ...d, [id]: "" }));
    setTick((t) => t + 1);
  };

  return (
    <div>
      <PageHeader title="Feedback" subtitle={`${items.length} messages from members`} />

      {items.length === 0 ? (
        <EmptyState>No feedback submitted yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((f) => {
            return (
              <Panel key={f.id}>
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/admin/members/${f.memberId}`} className="font-semibold hover:opacity-80">
                    {memberNames[f.memberId] || "Unknown member"}
                  </Link>
                  <span className="mono text-xs" style={{ color: "var(--color-muted)" }}>{f.date}</span>
                </div>
                <p>{f.message}</p>

                {f.response ? (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
                      Your response
                    </p>
                    <p className="mt-1" style={{ color: "var(--color-muted)" }}>{f.response}</p>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t flex gap-3 items-end flex-wrap" style={{ borderColor: "var(--color-border)" }}>
                    <Textarea
                      rows={2}
                      placeholder="Write a response..."
                      value={drafts[f.id] || ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                      className="flex-1 min-w-[200px]"
                    />
                    <Button onClick={() => respond(f.id)}>Respond</Button>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
