import type { QuizGame, QuizMode } from "#/lib/config";
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
