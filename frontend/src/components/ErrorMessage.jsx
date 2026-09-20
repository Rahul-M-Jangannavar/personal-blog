export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <p className="status status-error" role="alert">
      {message}
    </p>
  );
}
