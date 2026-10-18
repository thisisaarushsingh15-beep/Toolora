import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_BREAK_MINUTES,
  DEFAULT_FOCUS_MINUTES,
  MAX_MINUTES,
  MIN_MINUTES,
  createTimer,
  pause,
  reset,
  snapshot,
  start,
  tick,
  withDurations,
} from "~/lib/calc/timer";
import { Notice } from "./fields";

type Permission = "unsupported" | "default" | "granted" | "denied";

const MINUTE = 60000;

export function StudyTimer() {
  const [state, setState] = useState(() =>
    createTimer(DEFAULT_FOCUS_MINUTES * MINUTE, DEFAULT_BREAK_MINUTES * MINUTE),
  );
  const [now, setNow] = useState(() => Date.now());
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [permission, setPermission] = useState<Permission>("default");
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const lastPhase = useRef<string>("focus:0");

  const view = snapshot(state, now);

  /**
   * The tick only triggers a re-render: the remaining time always comes from
   * `endsAt − Date.now()`, so a throttled or backgrounded tab cannot drift.
   */
  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      const stamp = Date.now();
      setNow(stamp);
      setState((current) => tick(current, stamp));
    }, 250);
    return () => window.clearInterval(id);
  }, [state.running]);

  useEffect(() => {
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  // One notification per finished block, and only when the visitor asked for it.
  useEffect(() => {
    const key = `${state.phase}:${state.completedFocus}`;
    if (key === lastPhase.current) return;
    lastPhase.current = key;
    if (permission === "granted" && typeof Notification !== "undefined") {
      try {
        new Notification(
          state.phase === "break" ? "Focus block finished" : "Break over",
          { body: state.phase === "break" ? "Time for a break." : "Back to it — next focus block." },
        );
      } catch {
        setNotificationMessage("The browser refused a desktop notification, so watch this page instead.");
      }
    }
  }, [state.phase, state.completedFocus, permission]);

  const stamp = () => Date.now();

  const handleStart = () => {
    const moment = stamp();
    setNow(moment);
    setState((current) => start(current, moment));
  };

  const handlePause = () => {
    const moment = stamp();
    setNow(moment);
    setState((current) => pause(current, moment));
  };

  const handleReset = () => {
    const moment = stamp();
    setNow(moment);
    setState((current) => reset(current));
    lastPhase.current = "focus:0";
  };

  const applyDurations = (focus: number, rest: number) => {
    setFocusMinutes(focus);
    setBreakMinutes(rest);
    setState((current) =>
      withDurations(current, Math.max(MIN_MINUTES, focus) * MINUTE, Math.max(MIN_MINUTES, rest) * MINUTE),
    );
  };

  const askForNotifications = async () => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      setNotificationMessage(
        "This browser has no notification support, so the timer keeps you informed on the page instead.",
      );
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setNotificationMessage(
        result === "granted"
          ? "Notifications are on for this page. You will get one when a block ends."
          : "Notifications were declined. Nothing breaks — the countdown and the on-page state are the timer.",
      );
    } catch {
      setPermission("denied");
      setNotificationMessage(
        "Notification permission could not be requested, so the timer stays on the page.",
      );
    }
  };

  return (
    <div className="min-w-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="timer-focus" className="block text-sm font-medium text-ink">
            Study block (minutes)
          </label>
          <input
            id="timer-focus"
            name="timer-focus"
            type="number"
            inputMode="numeric"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            step={1}
            value={focusMinutes}
            onChange={(event) =>
              applyDurations(Number(event.target.value || MIN_MINUTES), breakMinutes)
            }
            className="field mt-2"
          />
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {MIN_MINUTES}–{MAX_MINUTES} minutes. A block already under way keeps the time it has
            left; the new length applies from the next block.
          </p>
        </div>
        <div className="min-w-0">
          <label htmlFor="timer-break" className="block text-sm font-medium text-ink">
            Break (minutes)
          </label>
          <input
            id="timer-break"
            name="timer-break"
            type="number"
            inputMode="numeric"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            step={1}
            value={breakMinutes}
            onChange={(event) =>
              applyDurations(focusMinutes, Number(event.target.value || MIN_MINUTES))
            }
            className="field mt-2"
          />
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Breaks are never counted as study time.
          </p>
        </div>
      </div>

      <div className="mt-7 min-w-0 rounded-card border border-line bg-surface-2 px-5 py-8 text-center">
        <p className="eyebrow">{view.phaseLabel}</p>
        <p
          data-countdown
          className="mt-3 font-mono text-5xl font-semibold tracking-tight break-words text-ink sm:text-7xl"
        >
          {view.countdown}
        </p>
        <div
          role="progressbar"
          aria-label="Progress through this block"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(view.progress * 100)}
          className="mx-auto mt-6 h-2 w-full max-w-md overflow-hidden rounded-pill bg-surface-3"
        >
          <div
            className="h-full rounded-pill bg-accent transition-[width] duration-300"
            style={{ width: `${(view.progress * 100).toFixed(1)}%` }}
          />
        </div>
        <p data-timer-state className="mt-4 text-sm leading-relaxed text-muted">
          {state.running
            ? view.phase === "focus"
              ? "Focused study in progress."
              : "Break in progress — the next study block starts on its own."
            : state.hasRun
              ? "Paused. The time you already spent is kept."
              : "Ready. Press Start when you begin."}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {state.running ? (
          <button type="button" className="btn btn-primary min-h-11" onClick={handlePause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn btn-primary min-h-11" onClick={handleStart}>
            {state.hasRun ? "Resume" : "Start"}
          </button>
        )}
        <button type="button" className="btn btn-secondary min-h-11" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div
        aria-live="polite"
        className="mt-6 min-w-0 rounded-card border border-line bg-surface-2 p-4 sm:p-5"
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="eyebrow">Sessions completed</dt>
            <dd data-session-count className="mt-2 font-mono text-2xl font-semibold text-ink">
              {view.completedFocus}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="eyebrow">Total focus</dt>
            <dd data-total-focus className="mt-2 font-mono text-2xl font-semibold text-ink">
              {view.totalFocusLabel}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="eyebrow">This block</dt>
            <dd className="mt-2 font-mono text-2xl font-semibold text-ink">
              {Math.round(view.progress * 100)}%
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Only finished study blocks are counted — a block you reset or abandon is not added.
        </p>
      </div>

      <div className="mt-5 min-w-0">
        <button
          type="button"
          className="btn btn-secondary min-h-11"
          onClick={askForNotifications}
          disabled={permission === "granted"}
        >
          {permission === "granted" ? "Notifications are on" : "Notify me when a block ends"}
        </button>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Optional. The browser will ask for permission — say no and the timer still works, because
          everything is shown on this page.
        </p>
        {notificationMessage ? (
          <div className="mt-3">
            <Notice tone={permission === "granted" ? "info" : "warn"}>{notificationMessage}</Notice>
          </div>
        ) : null}
        {permission === "denied" ? (
          <div className="mt-3">
            <Notice tone="warn">
              Notifications are blocked for this site, so the countdown, the progress bar and the
              session counter on this page are your cue instead. You can change that in your browser
              settings if you want notifications later.
            </Notice>
          </div>
        ) : null}
        {permission === "unsupported" ? (
          <div className="mt-3">
            <Notice tone="warn">
              This browser does not support desktop notifications, so the timer keeps you informed
              on the page.
            </Notice>
          </div>
        ) : null}
      </div>

      <div className="prose-block mt-6 rounded-card border border-line bg-surface-2 p-4 text-sm">
        <p>
          <strong>The countdown runs on the clock, not on ticks.</strong> When a block starts, the
          page records the exact time it should end and recomputes what is left from that timestamp —
          so a tab that is backgrounded, throttled or briefly asleep still shows the right time when
          you come back, instead of drifting behind by however long it was away.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Study blocks and breaks alternate; each completed block adds one to the session count.</li>
          <li>Pause freezes the remaining time, and Resume continues from exactly there.</li>
          <li>Reset returns to a fresh study block and clears the session count.</li>
          <li>
            The timer lives in this page only: no account, no sign-in, no sound file and no data
            leaving your browser.
          </li>
        </ul>
      </div>
    </div>
  );
}
