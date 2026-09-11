import { test } from "node:test";
import assert from "node:assert/strict";
import { activeStreak, dailyPlan } from "../src/features/learning/plan.ts";
import type { Session } from "../src/features/learning/model.ts";
const session = (date: Date): Session => ({
  id: date.toISOString(),
  lessonId: "work",
  completedAt: date.toISOString(),
  repetitions: 3,
  recordingSeconds: 30,
});
test("Streak counts distinct local days and accepts yesterday before today’s practice", () => {
  const now = new Date(2026, 8, 11, 12);
  const yesterday = new Date(2026, 8, 10, 12);
  const before = new Date(2026, 8, 9, 12);
  assert.equal(
    activeStreak(
      [session(yesterday), session(yesterday), session(before)],
      now,
    ),
    2,
  );
  assert.equal(activeStreak([session(before)], now), 0);
});
test("Daily plan respects the selected budget and only today’s completion", () => {
  const now = new Date(2026, 8, 11, 12);
  for (const dailyMinutes of [5, 10, 20] as const) {
    const plan = dailyPlan({ name: "", goal: "work", dailyMinutes }, [], now);
    assert.equal(
      plan.steps.reduce((n, s) => n + s.minutes, 0),
      dailyMinutes,
    );
    assert.equal(plan.complete, false);
  }
  assert.equal(
    dailyPlan({ name: "", goal: "work", dailyMinutes: 10 }, [session(now)], now)
      .complete,
    true,
  );
});
