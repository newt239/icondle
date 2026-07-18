import type { QuizGame, QuizMode } from "./config";

declare global {
  var gtag:
    | ((command: "event", eventName: string, params: Record<string, string | number>) => void)
    | undefined;
}

type QuizCompleteParams = {
  game: QuizGame;
  mode: QuizMode;
  score: number;
  seed: string;
  total: number;
};

export const trackQuizComplete = ({ game, mode, score, seed, total }: QuizCompleteParams): void => {
  globalThis.gtag?.("event", "quiz_complete", { game, mode, score, seed, total });
};
