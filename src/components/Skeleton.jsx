export function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "var(--color-panel-2)", ...style }}
    />
  );
}
