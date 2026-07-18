import { describe, expect, it } from "vitest";

import { generateSeed, isModeSeedAllowed } from "./quiz";

describe("isModeSeedAllowed", () => {
  it("easy は任意のシードを許可する", () => {
    expect(isModeSeedAllowed("easy", "a7f3c2")).toBe(true);
    expect(isModeSeedAllowed("easy", "2020-01-01")).toBe(true);
  });

  it("hard は日付シードのみ拒否する", () => {
    expect(isModeSeedAllowed("hard", "a7f3c2")).toBe(true);
    expect(isModeSeedAllowed("hard", "2020-01-01")).toBe(false);
  });
});

describe("generateSeed", () => {
  it("16 進 6 桁のシードを生成する", () => {
    expect(generateSeed()).toMatch(/^[0-9a-f]{6}$/);
  });
});
