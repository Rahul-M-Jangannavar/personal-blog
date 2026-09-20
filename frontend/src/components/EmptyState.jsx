export function EmptyState({ title, detail }) {
  return (
    <div className="status">
      <p className="status-title">{title}</p>
      {detail ? <p className="muted">{detail}</p> : null}
    </div>
  );
}
