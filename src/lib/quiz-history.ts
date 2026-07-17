import { z } from "zod";

const playHistoryEntrySchema = z.object({
  answers: z.string(),
  game: z.enum(["play", "pick"]),
  mode: z.enum(["easy", "hard"]),
  playedAt: z.number(),
  score: z.number(),
  seed: z.string(),
  total: z.number(),
});

export type PlayHistoryEntry = z.infer<typeof playHistoryEntrySchema>;

const playHistorySchema = z.array(playHistoryEntrySchema);

export const PLAY_HISTORY_STORAGE_KEY = "icondle:play-history";
export const PLAY_HISTORY_CHANGE_EVENT = "icondle:play-history-change";
const PLAY_HISTORY_LIMIT = 50;

const historyKey = (entry: Pick<PlayHistoryEntry, "game" | "mode" | "seed">): string =>
  `${entry.game}:${entry.mode}:${entry.seed}`;

export const readPlayHistory = (): PlayHistoryEntry[] => {
  if (typeof localStorage === "undefined") {
    return [];
  }
  const raw = localStorage.getItem(PLAY_HISTORY_STORAGE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed = playHistorySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
};

const notifyPlayHistoryChange = (): void => {
  window.dispatchEvent(new Event(PLAY_HISTORY_CHANGE_EVENT));
};

export const savePlayHistoryEntry = (entry: PlayHistoryEntry): PlayHistoryEntry[] => {
  if (typeof localStorage === "undefined") {
    return [];
  }
  const key = historyKey(entry);
  const next = [entry, ...readPlayHistory().filter((existing) => historyKey(existing) !== key)]
    .toSorted((a, b) => b.playedAt - a.playedAt)
    .slice(0, PLAY_HISTORY_LIMIT);
  localStorage.setItem(PLAY_HISTORY_STORAGE_KEY, JSON.stringify(next));
  notifyPlayHistoryChange();
  return next;
};

export const clearPlayHistory = (): void => {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(PLAY_HISTORY_STORAGE_KEY);
  notifyPlayHistoryChange();
};
