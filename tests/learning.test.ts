import assert from "node:assert/strict";
import test from "node:test";
import {
  addSession,
  emptyLearningState,
  restoreLearningState,
  settingsSchema,
  summarize,
  type Session,
} from "../src/features/learning/model.ts";

const session: Session = {
  id: "first-take",
  lessonId: "work",
  completedAt: "2026-09-11T10:00:00.000Z",
  repetitions: 3,
  recordingSeconds: 12.5,
};

test("a repeated completion cannot inflate progress", () => {
  const initial = addSession(emptyLearningState, session);
  assert.deepEqual(addSession(initial, session), initial);
  assert.deepEqual(summarize(initial.sessions), {
    sessions: 1,
    repetitions: 3,
    recordingSeconds: 12.5,
  });
});
test("invalid or future storage is rejected rather than overwritten with an empty history", () => {
  assert.throws(() => restoreLearningState("{bad json"));
  assert.throws(() =>
    restoreLearningState(JSON.stringify({ ...emptyLearningState, version: 2 })),
  );
});
test("a fresh install starts without fabricated scores or sessions", () => {
  assert.deepEqual(restoreLearningState(null), emptyLearningState);
  assert.deepEqual(summarize([]), {
    sessions: 0,
    repetitions: 0,
    recordingSeconds: 0,
  });
});
test("invalid durations and timestamps cannot enter history", () => {
  for (const recordingSeconds of [-1, Infinity, NaN])
    assert.throws(() =>
      addSession(emptyLearningState, { ...session, recordingSeconds }),
    );
  assert.throws(() =>
    addSession(emptyLearningState, { ...session, completedAt: "yesterday" }),
  );
});
test("goals and daily time stay inside the supported choices", () => {
  assert.equal(
    settingsSchema.parse({ name: " Josué ", goal: "work", dailyMinutes: 20 })
      .name,
    "Josué",
  );
  assert.equal(
    settingsSchema.safeParse({ name: "", goal: "invented", dailyMinutes: 20 })
      .success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ name: "", goal: "work", dailyMinutes: -5 })
      .success,
    false,
  );
});
test("bounded local history retains the most recent 500 sessions", () => {
  let state = emptyLearningState;
  for (let i = 0; i < 501; i++)
    state = addSession(state, { ...session, id: String(i) });
  assert.equal(state.sessions.length, 500);
  assert.equal(state.sessions[0]?.id, "500");
  assert.equal(state.sessions.at(-1)?.id, "1");
});
