/**
 * Downloading text as a real .txt file, entirely in the browser: a Blob plus a
 * temporary object URL. Nothing is uploaded, and the URL is released as soon as
 * the click has been dispatched.
 */
export function downloadTextFile(fileName: string, text: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export type ClipboardResult = { ok: true } | { ok: false; message: string };

/** Writes to the clipboard, reporting — not throwing — when the browser refuses. */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  try {
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard;
    if (!clipboard || typeof clipboard.writeText !== "function") {
      return { ok: false, message: "This browser does not allow copying from a script." };
    }
    await clipboard.writeText(text);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Your browser blocked clipboard access — this happens in private windows and on non-secure pages.",
    };
  }
}
