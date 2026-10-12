import { useEffect, useState } from "react";
import { getTool, type Tool } from "~/lib/tools";

/**
 * "Recently used" history.
 *
 * Stores tool SLUGS ONLY — never a number, a date or any text a visitor typed.
 * Everything lives in this browser's localStorage and is never sent anywhere.
 */
const KEY = "toolora:recent-tools";
const EVENT = "toolora:recent-tools-changed";
export const MAX_RECENT = 6;

export function readRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string" && Boolean(getTool(value)))
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberTool(slug: string): void {
  if (typeof window === "undefined" || !getTool(slug)) return;
  try {
    const next = [slug, ...readRecentSlugs().filter((item) => item !== slug)].slice(0, MAX_RECENT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage full or blocked — history is a nicety, never a requirement */
  }
}

export function clearRecent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function useRecentTools() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSlugs(readRecentSlugs());
      setReady(true);
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const tools: Tool[] = slugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is Tool => Boolean(tool));

  return { tools, ready, clear: clearRecent };
}
