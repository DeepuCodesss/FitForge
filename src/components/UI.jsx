export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1.5" style={{ color: "var(--color-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

export function Panel({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{ background: "var(--color-panel)", borderColor: "var(--color-border)", ...style }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, iconBg }) {
  return (
    <Panel className="flex flex-col justify-between min-h-[112px]">
      <div className="flex items-start justify-between">
        <span className="text-xs tracking-wide uppercase font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconBg || "var(--color-panel-2)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mt-3">{value}</div>
    </Panel>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: { background: "var(--color-panel-2)", color: "var(--color-text)" },
    accent: { background: "var(--color-accent)", color: "#fff" },
    muted: { background: "var(--color-panel-2)", color: "var(--color-muted)" },
  };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
      style={tones[tone] || tones.default}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }) {
  return (
    <Panel className="text-center py-10" style={{ color: "var(--color-muted)" }}>
      {children}
    </Panel>
  );
}

export function Input({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
      )}
      <input
        {...props}
        className="rounded-xl border px-4 py-2.5 text-[15px] outline-none focus:ring-2"
        style={{
          background: "var(--color-panel-2)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      />
    </label>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
      )}
      <textarea
        {...props}
        className="rounded-xl border px-4 py-2.5 text-[15px] outline-none focus:ring-2 resize-none"
        style={{
          background: "var(--color-panel-2)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      />
    </label>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
      )}
      <select
        {...props}
        className="rounded-xl border px-4 py-2.5 text-[15px] outline-none focus:ring-2"
        style={{
          background: "var(--color-panel-2)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        {children}
      </select>
    </label>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: { background: "var(--color-accent)", color: "#fff" },
    ghost: { background: "var(--color-panel-2)", color: "var(--color-text)" },
    outline: { background: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" },
  };
  return (
    <button
      {...props}
      className={`px-5 py-2.5 rounded-xl font-semibold text-[15px] transition-opacity hover:opacity-90 disabled:opacity-50 ${className}`}
      style={styles[variant]}
    >
      {children}
    </button>
  );
}
