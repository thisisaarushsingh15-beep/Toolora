import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const KEY = "toolora:theme";

/**
 * Runs before the page paints so there is no flash of the wrong theme.
 * Default comes from prefers-color-scheme; an explicit choice wins and is kept.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("toolora:theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial: Theme;
    try {
      const stored = window.localStorage.getItem(KEY);
      initial =
        stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch {
      initial = "light";
    }
    setTheme(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* private mode — the theme still applies for this visit */
    }
  }, [theme, ready]);

  return {
    theme,
    ready,
    toggle: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}
