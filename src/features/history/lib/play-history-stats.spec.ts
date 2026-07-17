import { describe, expect, it } from "vitest";

import { computePlayHistoryStats } from "./play-history-stats";

import type { PlayHistoryEntry } from "#/lib/quiz-history";

const createEntry = (overrides: Partial<PlayHistoryEntry> = {}): PlayHistoryEntry => ({
  answers: "0000",
  game: "play",
  mode: "easy",
  playedAt: 1,
  score: 4,
  seed: "a7f3c2",
  total: 5,
  ...overrides,
});

describe("computePlayHistoryStats", () => {
  it("履歴が空の場合はすべて 0 になる", () => {
    const stats = computePlayHistoryStats([]);
    expect(stats.totalPlays).toBe(0);
    expect(stats.averageScoreRate).toBe(0);
    expect(stats.breakdown).toHaveLength(4);
    expect(stats.breakdown.every((item) => item.plays === 0 && item.averageScoreRate === 0)).toBe(
      true,
    );
  });

  it("総プレイ回数と平均正答率を算出する", () => {
    const stats = computePlayHistoryStats([
      createEntry({ score: 5, total: 5 }),
      createEntry({ score: 0, total: 5 }),
    ]);
    expect(stats.totalPlays).toBe(2);
    expect(stats.averageScoreRate).toBeCloseTo(0.5);
  });

  it("game/mode の組み合わせごとに内訳を算出する", () => {
    const stats = computePlayHistoryStats([
      createEntry({ game: "play", mode: "easy", score: 5, total: 5 }),
      createEntry({ game: "play", mode: "easy", score: 3, total: 5 }),
      createEntry({ game: "pick", mode: "hard", score: 8, total: 10 }),
    ]);
    const playEasy = stats.breakdown.find((item) => item.game === "play" && item.mode === "easy");
    const pickHard = stats.breakdown.find((item) => item.game === "pick" && item.mode === "hard");
    const playHard = stats.breakdown.find((item) => item.game === "play" && item.mode === "hard");
    expect(playEasy).toMatchObject({ plays: 2 });
    expect(playEasy?.averageScoreRate).toBeCloseTo(0.8);
    expect(pickHard).toMatchObject({ plays: 1 });
    expect(pickHard?.averageScoreRate).toBeCloseTo(0.8);
    expect(playHard).toMatchObject({ averageScoreRate: 0, plays: 0 });
  });
});
