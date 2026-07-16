export type QuizMode = "easy" | "hard";

export const isDateSeed = (seed: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(seed);

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
