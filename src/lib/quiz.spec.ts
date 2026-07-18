import { describe, expect, it } from "vitest";

import { generateSeed, isSeedPlayable } from "./quiz";

describe("isSeedPlayable", () => {
  it("ランダムシードはどのゲーム・モードでも許可する", () => {
    expect(isSeedPlayable("play", "hard", "a7f3c2")).toBe(true);
  });

  it("play は日付シードを拒否する", () => {
    expect(isSeedPlayable("play", "easy", "2020-01-01")).toBe(false);
  });

  it("pick の easy は過去の日付シードを許可する", () => {
    expect(isSeedPlayable("pick", "easy", "2020-01-01")).toBe(true);
  });

  it("pick の easy は未来の日付シードを拒否する", () => {
    expect(isSeedPlayable("pick", "easy", "2999-01-01")).toBe(false);
  });

  it("pick の hard は日付シードを拒否する", () => {
    expect(isSeedPlayable("pick", "hard", "2020-01-01")).toBe(false);
  });
});

describe("generateSeed", () => {
  it("16 進 6 桁のシードを生成する", () => {
    expect(generateSeed()).toMatch(/^[0-9a-f]{6}$/);
  });
});
