import type { Session, Settings } from "./model.ts";

export function localDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function activeStreak(sessions: Session[], now = new Date()) {
  const days = new Set(
    sessions.map((item) => localDate(new Date(item.completedAt))),
  );
  const cursor = new Date(now);
  let count = 0;
  if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(localDate(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
export function dailyPlan(
  settings: Settings,
  sessions: Session[],
  now = new Date(),
) {
  const complete = sessions.some(
    (item) => localDate(new Date(item.completedAt)) === localDate(now),
  );
  const minutes = settings.dailyMinutes;
  return {
    lessonId: settings.goal,
    complete,
    steps: [
      {
        label: "Ouvir e repetir",
        minutes: Math.ceil(minutes * 0.4),
        route: `/lesson/${settings.goal}`,
      },
      {
        label: "Conversar em contexto",
        minutes: Math.ceil(minutes * 0.4),
        route: "/rooms",
      },
      {
        label: "Revisar correções",
        minutes: minutes - 2 * Math.ceil(minutes * 0.4),
        route: "/review",
      },
    ],
  };
}
