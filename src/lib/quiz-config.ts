export const PLAY_QUESTION_COUNT = 10;

const DAILY_QUESTION_COUNT = 5;

export const isDateSeed = (seed: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(seed);

export const questionCountFor = (seed: string): number =>
  isDateSeed(seed) ? DAILY_QUESTION_COUNT : PLAY_QUESTION_COUNT;

export const jstToday = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(new Date());
