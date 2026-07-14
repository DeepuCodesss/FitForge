import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, EmptyState } from "../../components/UI";
import { getDietPlan } from "../../lib/store";

export default function DietPlan() {
  const { member } = useAuth();
  if (!member) return null;
  const plan = getDietPlan(member.id);

  return (
    <div>
      <PageHeader title="Diet Plan" />

      {!plan || !plan.meals?.length ? (
        <EmptyState>No diet plan assigned yet.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {plan.title && <p style={{ color: "var(--color-muted)" }}>{plan.title}</p>}
          {plan.meals.map((m, i) => (
            <Panel key={i} className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{m.name}</h3>
                <p style={{ color: "var(--color-muted)" }}>{m.items}</p>
              </div>
              {m.calories && (
                <span className="mono text-sm" style={{ color: "var(--color-muted)" }}>
                  {m.calories} kcal
                </span>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
