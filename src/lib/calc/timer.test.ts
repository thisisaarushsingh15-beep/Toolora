import { describe, expect, test } from "bun:test";
import {
  createTimer,
  formatCountdown,
  formatMinutes,
  pause,
  progressOf,
  remainingAt,
  reset,
  snapshot,
  start,
  tick,
  withDurations,
} from "./timer";

const MINUTE = 60000;
const FOCUS = 25 * MINUTE;
const BREAK = 5 * MINUTE;

/** A clock the test moves by hand — no real waiting anywhere. */
function fakeClock(startAt = 1_700_000_000_000) {
  let now = startAt;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
    set: (value: number) => {
      now = value;
    },
  };
}

describe("countdown format", () => {
  test("minutes and seconds, padded", () => {
    expect(formatCountdown(FOCUS)).toBe("25:00");
    expect(formatCountdown(61000)).toBe("1:01");
    expect(formatCountdown(0)).toBe("0:00");
  });

  test("hours appear only when needed", () => {
    expect(formatCountdown(3661000)).toBe("1:01:01");
    expect(formatCountdown(3600000)).toBe("1:00:00");
  });

  test("rounds up so the start shows the full length", () => {
    expect(formatCountdown(1499999)).toBe("25:00");
  });

  test("minutes helper is readable", () => {
    expect(formatMinutes(FOCUS)).toBe("25 min");
    expect(formatMinutes(90 * MINUTE)).toBe("90 min");
  });
});

describe("the countdown is driven by wall-clock timestamps", () => {
  test("remaining time is recomputed from the end time, not decremented", () => {
    const clock = fakeClock();
    let state = createTimer(FOCUS, BREAK);
    state = start(state, clock.now());
    expect(state.endsAt).toBe(clock.now() + FOCUS);

    clock.advance(10 * MINUTE);
    expect(remainingAt(state, clock.now())).toBe(15 * MINUTE);
    expect(progressOf(state, clock.now())).toBeCloseTo(0.4, 10);

    // A single 20-minute jump behaves exactly like 20 one-minute ticks.
    clock.advance(10 * MINUTE);
    let ticked = state;
    for (let minute = 0; minute < 20; minute += 1) ticked = tick(ticked, clock.now());
    expect(remainingAt(ticked, clock.now())).toBe(remainingAt(state, clock.now()));
    expect(remainingAt(ticked, clock.now())).toBe(5 * MINUTE);
  });

  test("a throttled background tab cannot make it drift", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    // The tab was asleep for 25 minutes and 1 second, then ticks once.
    clock.advance(FOCUS + 1000);
    state = tick(state, clock.now());
    expect(state.phase).toBe("break");
    expect(state.completedFocus).toBe(1);
    expect(formatCountdown(remainingAt(state, clock.now()))).toBe("4:59");
  });

  test("a very long sleep replays every completed phase exactly once", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(FOCUS + BREAK + FOCUS); // 25 focus → 5 break → 25 focus all done
    state = tick(state, clock.now());
    expect(state.completedFocus).toBe(2);
    expect(state.phase).toBe("break");
    expect(formatCountdown(remainingAt(state, clock.now()))).toBe("5:00");
  });

  test("focus sessions are counted, breaks are not", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(FOCUS);
    state = tick(state, clock.now());
    expect(state.completedFocus).toBe(1);
    clock.advance(BREAK);
    state = tick(state, clock.now());
    expect(state.phase).toBe("focus");
    expect(state.completedFocus).toBe(1);
  });
});

describe("pause, resume and reset", () => {
  test("pausing freezes the remaining time through any amount of waiting", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(5 * MINUTE);
    state = pause(state, clock.now());
    expect(state.running).toBe(false);
    expect(state.remainingMs).toBe(20 * MINUTE);

    clock.advance(30 * MINUTE);
    expect(remainingAt(state, clock.now())).toBe(20 * MINUTE);
    expect(tick(state, clock.now())).toBe(state);
  });

  test("resuming continues from the paused time", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(5 * MINUTE);
    state = pause(state, clock.now());
    clock.advance(30 * MINUTE);
    state = start(state, clock.now());
    expect(state.endsAt).toBe(clock.now() + 20 * MINUTE);
    clock.advance(15 * MINUTE);
    expect(formatCountdown(remainingAt(state, clock.now()))).toBe("5:00");
  });

  test("a paused timer keeps its session count across reset only if asked", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(FOCUS);
    state = tick(state, clock.now());
    state = reset(state);
    expect(state).toMatchObject({
      phase: "focus",
      running: false,
      remainingMs: FOCUS,
      completedFocus: 0,
      endsAt: null,
    });
  });

  test("pausing a stopped timer changes nothing", () => {
    const state = createTimer(FOCUS, BREAK);
    expect(pause(state, 0)).toBe(state);
    expect(start(start(state, 0), 1).endsAt).toBe(start(state, 1).endsAt);
  });
});

describe("changing durations", () => {
  test("an untouched timer adopts the new focus length", () => {
    const state = withDurations(createTimer(FOCUS, BREAK), 50 * MINUTE, 10 * MINUTE);
    expect(state.remainingMs).toBe(50 * MINUTE);
    expect(state.focusMs).toBe(50 * MINUTE);
  });

  test("a session already under way keeps the time it has left", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(5 * MINUTE);
    state = pause(state, clock.now());
    state = withDurations(state, 50 * MINUTE, 10 * MINUTE);
    expect(state.remainingMs).toBe(20 * MINUTE);
    expect(state.breakMs).toBe(10 * MINUTE);
  });

  test("silly values are clamped instead of breaking the timer", () => {
    const state = createTimer(0, -5 * MINUTE);
    expect(state.focusMs).toBeGreaterThanOrEqual(1000);
    expect(state.breakMs).toBeGreaterThanOrEqual(1000);
  });
});

describe("snapshot for the UI", () => {
  test("reports phase, progress, countdown and total focus", () => {
    const clock = fakeClock();
    let state = start(createTimer(FOCUS, BREAK), clock.now());
    clock.advance(FOCUS);
    state = tick(state, clock.now());
    const view = snapshot(state, clock.now());
    expect(view.phase).toBe("break");
    expect(view.running).toBe(true);
    expect(view.completedFocus).toBe(1);
    expect(view.countdown).toBe("5:00");
    expect(view.phaseLabel).toBe("Break");
    expect(view.totalFocusLabel).toBe("25 min");
    expect(view.totalMs).toBe(BREAK);
  });

  test("an idle timer starts full and not finished", () => {
    const view = snapshot(createTimer(FOCUS, BREAK), 0);
    expect(view.countdown).toBe("25:00");
    expect(view.progress).toBe(0);
    expect(view.phaseLabel).toBe("Focus session");
    expect(view.finished).toBe(false);
  });
});
