import type { QuizGame, QuizMode } from "#/lib/quiz-config";
import type { PlayHistoryEntry } from "#/lib/quiz-history";

type PlayHistoryStatsBreakdown = {
  game: QuizGame;
  mode: QuizMode;
  plays: number;
  averageScoreRate: number;
};

export type PlayHistoryStats = {
  totalPlays: number;
  averageScoreRate: number;
  breakdown: PlayHistoryStatsBreakdown[];
};

const GAME_MODE_COMBINATIONS: { game: QuizGame; mode: QuizMode }[] = [
  { game: "play", mode: "easy" },
  { game: "play", mode: "hard" },
  { game: "pick", mode: "easy" },
  { game: "pick", mode: "hard" },
];

const averageScoreRateOf = (entries: PlayHistoryEntry[]): number => {
  if (entries.length === 0) {
    return 0;
  }
  const rateSum = entries.reduce((sum, entry) => sum + entry.score / entry.total, 0);
  return rateSum / entries.length;
};

export const computePlayHistoryStats = (entries: PlayHistoryEntry[]): PlayHistoryStats => ({
  averageScoreRate: averageScoreRateOf(entries),
  breakdown: GAME_MODE_COMBINATIONS.map(({ game, mode }) => {
    const matched = entries.filter((entry) => entry.game === game && entry.mode === mode);
    return { averageScoreRate: averageScoreRateOf(matched), game, mode, plays: matched.length };
  }),
  totalPlays: entries.length,
});
