import { describe, expect, it } from "vitest";

import { runResultInputSchema } from "#/features/result/schemas";

describe("runResultInputSchema", () => {
  it("play は日付シードを拒否する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "play",
        mode: "easy",
        seed: "2020-01-01",
      }).success,
    ).toBe(false);
  });

  it("pick の easy は日付シードを受理する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "pick",
        mode: "easy",
        seed: "2020-01-01",
      }).success,
    ).toBe(true);
  });

  it("pick の hard は日付シードを拒否する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "pick",
        mode: "hard",
        seed: "2020-01-01",
      }).success,
    ).toBe(false);
  });

  it("pick の日付シードは未来日付を拒否する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "pick",
        mode: "easy",
        seed: "2999-01-01",
      }).success,
    ).toBe(false);
  });

  it("answers はモードの問題数を超えると拒否する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "0000000000",
        game: "play",
        mode: "easy",
        seed: "a7f3c2",
      }).success,
    ).toBe(false);
    expect(
      runResultInputSchema.safeParse({
        answers: "0000000000",
        game: "play",
        mode: "hard",
        seed: "a7f3c2",
      }).success,
    ).toBe(true);
  });
});
