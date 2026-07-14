import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHeader, Panel, Badge, Input, EmptyState } from "../../components/UI";
import { listMembers } from "../../lib/store";

export default function AdminMembers() {
  const [q, setQ] = useState("");
  const members = listMembers().filter(
    (m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.email.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Members" subtitle={`${listMembers().length} total`} />

      <div className="mb-6 max-w-sm relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <Input placeholder="Search members..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" style={{ paddingLeft: "2.5rem" }} />
      </div>

      {members.length === 0 ? (
        <EmptyState>No members found.</EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <Link key={m.id} to={`/admin/members/${m.id}`}>
              <Panel className="flex items-center justify-between hover:opacity-90">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0"
                    style={{ background: "var(--color-panel-2)" }}
                  >
                    {m.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>{m.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge>{m.plan}</Badge>
                  <Badge tone={m.status === "active" ? "accent" : "default"}>{m.status}</Badge>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
