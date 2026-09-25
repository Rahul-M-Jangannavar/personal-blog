import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Posts" },
  { to: "/contact", label: "Contact" },
];

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, ready } = useAuth();

  return (
    <div className="shell">
      <header className="site-header">
        <Link to="/" className="brand">
          Achintya
        </Link>
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
        <button type="button" className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
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
