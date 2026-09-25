import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/studio";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  if (!ready) return <Spinner />;
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack">
      <h1>Log in</h1>
      <p className="muted">Login page in only for admin</p>
      <ErrorMessage message={error} />
      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p>
        <Link to="/">Back home</Link>
      </p>
    </div>
  );
}
