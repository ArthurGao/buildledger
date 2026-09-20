"use client";

import * as React from "react";

/**
 * Minimal light/dark theming. The colour tokens already exist in globals.css
 * under `.dark`; this only decides when that class is on <html>.
 *
 * The matching inline script in the document head applies the stored choice
 * before first paint, so there is no flash of the wrong theme.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "buildledger-theme";

/** Runs before hydration. Kept in sync with the logic below by hand — it is tiny on purpose. */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start as "light" on both server and client, then reconcile after mount so
  // the markup matches and React does not complain about hydration.
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private browsing and similar — the theme just will not persist.
      }
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
