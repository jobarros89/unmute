import { z } from "zod";

export const goals = ["everyday", "work", "travel"] as const;
export const goalLabels = {
  everyday: "Conversar no dia a dia",
  work: "Falar no trabalho",
  travel: "Viajar com confiança",
};
export const settingsSchema = z.object({
  name: z.string().trim().max(40),
  goal: z.enum(goals),
  dailyMinutes: z.union([z.literal(5), z.literal(10), z.literal(20)]),
});
export type Settings = z.infer<typeof settingsSchema>;
export const sessionSchema = z.object({
  id: z.string().min(1),
  lessonId: z.string().min(1),
  completedAt: z.string().datetime(),
  repetitions: z.number().int().positive(),
  recordingSeconds: z.number().finite().nonnegative(),
});
export type Session = z.infer<typeof sessionSchema>;
export const learningSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema.nullable(),
  sessions: z.array(sessionSchema).max(500),
});
export type LearningState = z.infer<typeof learningSchema>;
export const emptyLearningState: LearningState = {
  version: 1,
  settings: null,
  sessions: [],
};

export function restoreLearningState(raw: string | null): LearningState {
  if (!raw) return { ...emptyLearningState, sessions: [] };
  return learningSchema.parse(JSON.parse(raw));
}

export function addSession(
  state: LearningState,
  value: Session,
): LearningState {
  const session = sessionSchema.parse(value);
  if (state.sessions.some((item) => item.id === session.id)) return state;
  return { ...state, sessions: [session, ...state.sessions].slice(0, 500) };
}

export function summarize(sessions: Session[]) {
  return sessions.reduce(
    (total, session) => ({
      sessions: total.sessions + 1,
      repetitions: total.repetitions + session.repetitions,
      recordingSeconds: total.recordingSeconds + session.recordingSeconds,
    }),
    { sessions: 0, repetitions: 0, recordingSeconds: 0 },
  );
}
