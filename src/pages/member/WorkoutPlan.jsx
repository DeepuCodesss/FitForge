import { useAuth } from "../../context/AuthContext";
import { PageHeader, Panel, EmptyState } from "../../components/UI";
import { getWorkoutPlan } from "../../lib/store";

export default function WorkoutPlan() {
  const { member } = useAuth();
  if (!member) return null;
  const plan = getWorkoutPlan(member.id);

  return (
    <div>
      <PageHeader title="Workout Plan" />

      {!plan || !plan.days?.length ? (
        <EmptyState>No workout plan assigned yet. Contact your admin.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {plan.title && <p style={{ color: "var(--color-muted)" }}>{plan.title}</p>}
          {plan.days.map((d, i) => (
            <Panel key={i}>
              <h3 className="font-bold text-lg mb-4">{d.day}</h3>
              <div className="flex flex-col gap-2">
                {d.exercises.map((ex, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between py-2.5 border-b last:border-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span>{ex.name}</span>
                    <span className="mono text-sm" style={{ color: "var(--color-muted)" }}>
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
