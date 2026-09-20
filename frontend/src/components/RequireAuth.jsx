import { Navigate, useLocation } from "react-router-dom";

import { Spinner } from "./Spinner";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Spinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
