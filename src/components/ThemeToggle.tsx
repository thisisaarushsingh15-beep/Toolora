import { IconMoon, IconSun } from "~/components/icons";
import { useTheme } from "~/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={nextLabel}
      title={nextLabel}
      className="btn btn-ghost h-11 w-11 shrink-0 px-0"
    >
      {theme === "dark" ? <IconSun className="h-5 w-5" /> : <IconMoon className="h-5 w-5" />}
    </button>
  );
}
