export function Spinner({ label = "Loading…" }) {
  return (
    <p className="status" role="status">
      {label}
    </p>
  );
}
