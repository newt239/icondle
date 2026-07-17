import { isDateSeed } from "#/lib/quiz-config";

import type { PlayHistoryEntry } from "#/lib/quiz-history";

const previousDateSeed = (dateSeed: string): string => {
  const date = new Date(dateSeed);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const calculateDailyStreak = (history: PlayHistoryEntry[], today: string): number => {
  const playedDates = new Set(
    history
      .filter((entry) => entry.game === "pick" && entry.mode === "easy" && isDateSeed(entry.seed))
      .map((entry) => entry.seed),
  );
  let streak = 0;
  let cursor = today;
  while (playedDates.has(cursor)) {
    streak += 1;
    cursor = previousDateSeed(cursor);
  }
  return streak;
};
