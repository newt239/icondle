import type { QuizGame, QuizMode } from "#/lib/quiz";
import type { RunResult } from "#/types";

export type ShareLoaderData = {
  game: QuizGame;
  imageUrl: string;
  label: string;
  mode: QuizMode;
  pageUrl: string;
  result: RunResult;
  seed: string;
};
