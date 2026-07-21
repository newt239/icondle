import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

import { SITE_URL } from "./meta";

import type { QuizGame, QuizMode } from "./quiz";

declare global {
  var gtag:
    | ((command: "event", eventName: string, params: Record<string, string | number>) => void)
    | undefined;
}

export const GA_MEASUREMENT_ID = "G-210FRX6S6M";

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

export const isProductionHostname = (hostname: string): boolean =>
  hostname === new URL(SITE_URL).hostname;

export const isProductionRequest = createServerOnlyFn((): boolean =>
  isProductionHostname(getRequestUrl().hostname),
);
