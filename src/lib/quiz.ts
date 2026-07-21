import { jstToday } from "./date";

export type QuizGame = "play" | "pick";

export type QuizMode = "easy" | "hard";

export const isDateSeed = (seed: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(seed);

export const quizConfig: Record<
  QuizMode,
  {
    games: Record<
      QuizGame,
      { basePath: "/hard/pick" | "/hard/play" | "/pick" | "/play"; label: string }
    >;
    questionCount: number;
  }
> = {
  easy: {
    games: {
      pick: { basePath: "/pick", label: "Icondle Pick" },
      play: { basePath: "/play", label: "Icondle" },
    },
    questionCount: 5,
  },
  hard: {
    games: {
      pick: { basePath: "/hard/pick", label: "Icondle Pick Hard" },
      play: { basePath: "/hard/play", label: "Icondle Hard" },
    },
    questionCount: 10,
  },
};

export const shareLabelFor = (game: QuizGame, mode: QuizMode, seed: string): string => {
  if (game === "pick" && mode === "easy" && isDateSeed(seed)) {
    return `Icondle Daily ${seed}`;
  }
  return quizConfig[mode].games[game].label;
};

export const isSeedPlayable = (game: QuizGame, mode: QuizMode, seed: string): boolean =>
  !isDateSeed(seed) || (game === "pick" && mode === "easy" && seed <= jstToday());

export const generateSeed = (): string => {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
