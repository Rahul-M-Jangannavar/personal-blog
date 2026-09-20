import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

/** Theme is global (header + every page), so context beats threading a prop. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={theme} className="theme-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
