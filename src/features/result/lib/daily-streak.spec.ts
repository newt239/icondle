import { describe, expect, it } from "vitest";

import { calculateDailyStreak } from "./daily-streak";

import type { PlayHistoryEntry } from "#/lib/quiz-history";

const createEntry = (overrides: Partial<PlayHistoryEntry> = {}): PlayHistoryEntry => ({
  answers: "00000",
  game: "pick",
  mode: "easy",
  playedAt: 1,
  score: 3,
  seed: "2026-07-17",
  total: 5,
  ...overrides,
});

describe("calculateDailyStreak", () => {
  it("履歴が空なら0を返す", () => {
    expect(calculateDailyStreak([], "2026-07-17")).toBe(0);
  });

  it("今日のデイリー記録がなければ0を返す", () => {
    const history = [createEntry({ seed: "2026-07-16" })];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(0);
  });

  it("今日から遡って連続している日数を数える", () => {
    const history = [
      createEntry({ seed: "2026-07-17" }),
      createEntry({ seed: "2026-07-16" }),
      createEntry({ seed: "2026-07-15" }),
    ];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(3);
  });

  it("連続が途切れた場合はそこでカウントを止める", () => {
    const history = [
      createEntry({ seed: "2026-07-17" }),
      createEntry({ seed: "2026-07-16" }),
      createEntry({ seed: "2026-07-14" }),
    ];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(2);
  });

  it("game が pick 以外のエントリは対象外とする", () => {
    const history = [
      createEntry({ seed: "2026-07-17" }),
      createEntry({ game: "play", seed: "2026-07-16" }),
    ];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(1);
  });

  it("mode が hard のエントリは対象外とする", () => {
    const history = [
      createEntry({ seed: "2026-07-17" }),
      createEntry({ mode: "hard", seed: "2026-07-16" }),
    ];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(1);
  });

  it("日付シードでないエントリは対象外とする", () => {
    const history = [createEntry({ seed: "2026-07-17" }), createEntry({ seed: "a7f3c2" })];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(1);
  });

  it("スコアが0点でもプレイ記録としてカウントする", () => {
    const history = [createEntry({ score: 0, seed: "2026-07-17" })];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(1);
  });

  it("年をまたぐ連続記録を正しく数える", () => {
    const history = [
      createEntry({ seed: "2026-01-01" }),
      createEntry({ seed: "2025-12-31" }),
      createEntry({ seed: "2025-12-30" }),
    ];
    expect(calculateDailyStreak(history, "2026-01-01")).toBe(3);
  });

  it("重複エントリがあっても1日として数える", () => {
    const history = [
      createEntry({ playedAt: 1, seed: "2026-07-17" }),
      createEntry({ playedAt: 2, seed: "2026-07-17" }),
    ];
    expect(calculateDailyStreak(history, "2026-07-17")).toBe(1);
  });
});
