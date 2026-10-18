/**
 * Study timer maths — pure state transitions with an injected clock.
 *
 * The countdown is driven by wall-clock timestamps, not by counting ticks: while
 * running, the state stores the epoch millisecond at which the current phase
 * ends, and the remaining time is always recomputed as `endsAt − now`. A tab that
 * is throttled, backgrounded or suspended therefore cannot make the timer drift —
 * when it wakes up, the next tick simply reports the correct remaining time.
 *
 * Every transition takes `now` as a parameter, so the whole timer is testable
 * with a fake clock.
 */

export type TimerPhase = "focus" | "break";

export type TimerState = {
  phase: TimerPhase;
  running: boolean;
  /** Duration of the phase, in milliseconds. */
  focusMs: number;
  breakMs: number;
  /** Remaining milliseconds in the current phase. Authoritative while paused. */
  remainingMs: number;
  /** Epoch ms at which the current phase ends. Only meaningful while running. */
  endsAt: number | null;
  /** Focus blocks completed. Breaks never increment this. */
  completedFocus: number;
  /** True once the timer has been started — a fresh timer adopts new lengths. */
  hasRun: boolean;
};

export type Clock = () => number;

/** Durations below a second are clamped so a phase can never spin. */
const MIN_DURATION_MS = 1000;
const MAX_CATCH_UP_PHASES = 200;

export function createTimer(focusMs: number, breakMs: number): TimerState {
  const focus = Math.max(MIN_DURATION_MS, Math.round(focusMs));
  const rest = Math.max(MIN_DURATION_MS, Math.round(breakMs));
  return {
    phase: "focus",
    running: false,
    focusMs: focus,
    breakMs: rest,
    remainingMs: focus,
    endsAt: null,
    completedFocus: 0,
    hasRun: false,
  };
}

export function durationOf(state: TimerState, phase: TimerPhase = state.phase): number {
  return phase === "focus" ? state.focusMs : state.breakMs;
}

export function remainingAt(state: TimerState, now: number): number {
  if (!state.running || state.endsAt === null) return Math.max(0, state.remainingMs);
  return Math.max(0, state.endsAt - now);
}

export function start(state: TimerState, now: number): TimerState {
  if (state.running) return state;
  const remaining = Math.max(0, state.remainingMs);
  return { ...state, running: true, endsAt: now + remaining, remainingMs: remaining, hasRun: true };
}

export function pause(state: TimerState, now: number): TimerState {
  if (!state.running) return state;
  return { ...state, running: false, endsAt: null, remainingMs: remainingAt(state, now) };
}

/** Back to the start of a focus phase: paused, full length, sessions cleared. */
export function reset(state: TimerState): TimerState {
  return {
    ...state,
    phase: "focus",
    running: false,
    remainingMs: state.focusMs,
    endsAt: null,
    completedFocus: 0,
    hasRun: false,
  };
}

/**
 * Advances the clock. Phases that finished while the tab was away are carried
 * over from the original end time, so a throttled tab lands exactly where it
 * should have. Completed focus phases increment the session counter.
 */
export function tick(state: TimerState, now: number): TimerState {
  if (!state.running || state.endsAt === null) return state;

  let { phase, endsAt, completedFocus } = state;
  let guard = 0;

  while (now >= endsAt && guard < MAX_CATCH_UP_PHASES) {
    if (phase === "focus") {
      completedFocus += 1;
      phase = "break";
      endsAt += state.breakMs;
    } else {
      phase = "focus";
      endsAt += state.focusMs;
    }
    guard += 1;
  }

  if (guard >= MAX_CATCH_UP_PHASES && now >= endsAt) {
    // Absurdly long sleep: resynchronise instead of replaying thousands of blocks.
    endsAt = now + durationOf(state, phase);
  }

  return {
    ...state,
    phase,
    endsAt,
    completedFocus,
    remainingMs: Math.max(0, endsAt - now),
  };
}

/** Applies new durations. A running or paused session keeps its current phase. */
export function withDurations(state: TimerState, focusMs: number, breakMs: number): TimerState {
  const focus = Math.max(MIN_DURATION_MS, Math.round(focusMs));
  const rest = Math.max(MIN_DURATION_MS, Math.round(breakMs));
  // An untouched timer adopts the new focus length immediately; a session already
  // under way keeps the time it has left and uses the new lengths from the next
  // phase onward (the page says so in words).
  const untouched = !state.running && !state.hasRun;
  let remainingMs = state.remainingMs;
  if (untouched && state.phase === "focus") remainingMs = focus;
  else if (!state.running && state.phase === "break") remainingMs = Math.min(state.remainingMs, rest);
  return {
    ...state,
    focusMs: focus,
    breakMs: rest,
    remainingMs,
    endsAt: state.running ? state.endsAt : null,
  };
}

/** Fraction of the current phase already spent, 0–1. */
export function progressOf(state: TimerState, now: number): number {
  const total = durationOf(state);
  if (total <= 0) return 0;
  const remaining = remainingAt(state, now);
  return Math.min(1, Math.max(0, 1 - remaining / total));
}

/** "25:00" under an hour, "1:05:00" above it. Rounds up, so 0 shows as 0:00. */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function formatMinutes(ms: number): string {
  const totalMinutes = ms / 60000;
  const rounded = Math.round(totalMinutes * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} min`;
}

export type TimerSnapshot = {
  phase: TimerPhase;
  running: boolean;
  remainingMs: number;
  totalMs: number;
  progress: number;
  completedFocus: number;
  countdown: string;
  phaseLabel: string;
  /** Total focused minutes across completed sessions. */
  totalFocusMs: number;
  totalFocusLabel: string;
  /** Remaining time in a focus phase is never counted; breaks are not study. */
  finished: boolean;
};

export function snapshot(state: TimerState, now: number): TimerSnapshot {
  const remainingMs = remainingAt(state, now);
  return {
    phase: state.phase,
    running: state.running,
    remainingMs,
    totalMs: durationOf(state),
    progress: progressOf(state, now),
    completedFocus: state.completedFocus,
    countdown: formatCountdown(remainingMs),
    phaseLabel: state.phase === "focus" ? "Focus session" : "Break",
    totalFocusMs: state.completedFocus * state.focusMs,
    totalFocusLabel: formatMinutes(state.completedFocus * state.focusMs),
    finished: remainingMs <= 0 && !state.running,
  };
}

export const DEFAULT_FOCUS_MINUTES = 25;
export const DEFAULT_BREAK_MINUTES = 5;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 180;
