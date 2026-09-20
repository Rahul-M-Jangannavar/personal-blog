import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loginRequest,
  setAccessToken,
  setRefreshToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const body = await api("/api/auth/token/refresh/", {
          method: "POST",
          json: { refresh: getRefreshToken() },
          auth: false,
          retry: false,
        });
        if (cancelled) return;
        setAccessToken(body.access);
        setAccess(body.access);
      } catch {
        if (!cancelled) clearTokens();
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    if (getRefreshToken()) restore();
    else setReady(true);

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      ready,
      isAuthenticated: Boolean(access || getAccessToken()),
      async login(username, password) {
        const body = await loginRequest(username, password);
        setAccessToken(body.access);
        setRefreshToken(body.refresh);
        setAccess(body.access);
      },
      logout() {
        clearTokens();
        setAccess(null);
      },
    }),
    [access, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
