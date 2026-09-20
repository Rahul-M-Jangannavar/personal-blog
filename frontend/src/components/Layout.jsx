import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, ready } = useAuth();

  return (
    <div className="shell">
      <header className="site-header">
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
          {ready && isAuthenticated ? (
            <NavLink
              to="/studio"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Studio
            </NavLink>
          ) : null}
        </nav>
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"}
        </button>
        {ready && isAuthenticated ? (
          <button type="button" className="theme-toggle" onClick={logout}>
            Log out
          </button>
        ) : (
          <NavLink to="/login" className="nav-link">
            Log in
          </NavLink>
        )}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Personal blog · live data from the Django API</p>
      </footer>
    </div>
  );
}
