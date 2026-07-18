import { describe, expect, it } from "vitest";

import { gradeInputSchema } from "#/features/question/schemas";

describe("gradeInputSchema", () => {
  it("ランダムシードを受理する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
  });

  it("日付シードをモードによらず拒否する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 1, seed: "2020-01-01" }).success,
    ).toBe(false);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "2020-01-01" }).success,
    ).toBe(false);
  });

  it("mode がないと拒否する", () => {
    expect(gradeInputSchema.safeParse({ answer: 0, n: 1, seed: "a7f3c2" }).success).toBe(false);
  });

  it("easy は 5 問、hard は 10 問まで受理する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 5, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 6, seed: "a7f3c2" }).success,
    ).toBe(false);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 10, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 11, seed: "a7f3c2" }).success,
    ).toBe(false);
  });
});
