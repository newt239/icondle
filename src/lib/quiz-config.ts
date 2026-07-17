export type QuizGame = "play" | "pick";

export type QuizMode = "easy" | "hard";

export const isDateSeed = (seed: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(seed);

export const quizBasePath = (
  game: QuizGame,
  mode: QuizMode,
): "/play" | "/play/hard" | "/pick" | "/pick/hard" => {
  if (game === "play") {
    return mode === "hard" ? "/play/hard" : "/play";
  }
  return mode === "hard" ? "/pick/hard" : "/pick";
};

export const modeLabelFor = (game: QuizGame, mode: QuizMode): string => {
  if (game === "play") {
    return mode === "hard" ? "Icondle Hard" : "Icondle";
  }
  return mode === "hard" ? "Icondle Pick Hard" : "Icondle Pick";
};

export const shareLabelFor = (game: QuizGame, mode: QuizMode, seed: string): string => {
  if (game === "pick" && mode === "easy" && isDateSeed(seed)) {
    return `Icondle Daily ${seed}`;
  }
  return modeLabelFor(game, mode);
};

export const questionCountFor = (mode: QuizMode): number => (mode === "hard" ? 10 : 5);

export const isModeSeedAllowed = (mode: QuizMode, seed: string): boolean =>
  mode === "easy" || !isDateSeed(seed);

export const generateSeed = (): string => {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const jstToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());
