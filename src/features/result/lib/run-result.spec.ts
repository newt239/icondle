import { describe, expect, it } from "vitest";

import { runResultInputSchema } from "#/features/result/schemas";

describe("runResultInputSchema", () => {
  it("play はランダムシードのみ受理し日付シードを拒否する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "play",
        mode: "easy",
        seed: "a7f3c2",
      }).success,
    ).toBe(true);
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "play",
        mode: "easy",
        seed: "2020-01-01",
      }).success,
    ).toBe(false);
  });

  it("pick の easy はランダムシードと日付シードの両方を受理する", () => {
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "pick",
        mode: "easy",
        seed: "a7f3c2",
      }).success,
    ).toBe(true);
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
        answers: "0000000000",
        game: "pick",
        mode: "hard",
        seed: "a7f3c2",
      }).success,
    ).toBe(true);
    expect(
      runResultInputSchema.safeParse({
        answers: "00000",
        game: "pick",
        mode: "hard",
        seed: "2020-01-01",
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
        answers: "00000000000",
        game: "play",
        mode: "hard",
        seed: "a7f3c2",
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

  it("game や mode がないと拒否する", () => {
    expect(
      runResultInputSchema.safeParse({ answers: "0000000000", mode: "easy", seed: "a7f3c2" })
        .success,
    ).toBe(false);
    expect(
      runResultInputSchema.safeParse({ answers: "0000000000", game: "play", seed: "a7f3c2" })
        .success,
    ).toBe(false);
  });
});
