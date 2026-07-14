import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Panel, PageHeader, Badge, Input, Button } from "../../components/UI";
import { updateMember } from "../../lib/store";

const FIELDS = [
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "goal", label: "Goal" },
  { key: "height", label: "Height" },
  { key: "currentWeight", label: "Current Weight" },
  { key: "targetWeight", label: "Target Weight" },
  { key: "bmi", label: "BMI", derived: true },
  { key: "bodyFat", label: "Body Fat" },
  { key: "membershipExpiry", label: "Membership Expiry" },
];

function computeBMI(member) {
  const h = Number(member.height);
  const w = Number(member.currentWeight);
  if (!h || !w) return null;
  const m = h / 100;
  return (w / (m * m)).toFixed(1);
}

export default function Profile() {
  const { member, refreshMember } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(member || {});

  useEffect(() => {
    setForm(member || {});
  }, [member]);

  if (!member) return null;

  const startEdit = () => {
    setForm(member);
    setEditing(true);
  };

  const save = () => {
    updateMember(member.id, form);
    refreshMember();
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const bmi = computeBMI(member);

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Your account details"
        right={
          editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={cancel}>
                <span className="flex items-center gap-1.5"><X size={16} /> Cancel</span>
              </Button>
              <Button onClick={save}>
                <span className="flex items-center gap-1.5"><Check size={16} /> Save</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={startEdit}>
              <span className="flex items-center gap-1.5"><Pencil size={15} /> Edit Profile</span>
            </Button>
          )
        }
      />

      <Panel>
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            {member.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">{member.name}</h2>
            <p style={{ color: "var(--color-muted)" }}>{member.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{member.plan}</Badge>
              <Badge tone="accent">{member.status}</Badge>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
            {FIELDS.filter((f) => !f.derived).map((f) => (
              <Input
                key={f.key}
                label={f.label}
                value={form[f.key] || ""}
                onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <p className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
                  {f.label}
                </p>
                <p className="mt-1 text-lg">
                  {f.derived ? bmi ?? "—" : member[f.key] || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
