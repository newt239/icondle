import { describe, expect, it } from "vitest";

import { pickGradeInputSchema } from "#/features/pick-question/schemas";

describe("pickGradeInputSchema", () => {
  it("easy はランダムシードと日付シードの両方を受理する", () => {
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 5, seed: "2020-01-01" }).success,
    ).toBe(true);
  });

  it("hard は日付シードを拒否する", () => {
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "2020-01-01" }).success,
    ).toBe(false);
  });

  it("mode がないと拒否する", () => {
    expect(pickGradeInputSchema.safeParse({ answer: 0, n: 1, seed: "a7f3c2" }).success).toBe(false);
  });

  it("easy は 5 問、hard は 10 問まで受理する", () => {
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 6, seed: "a7f3c2" }).success,
    ).toBe(false);
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 6, seed: "2020-01-01" }).success,
    ).toBe(false);
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 10, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 11, seed: "a7f3c2" }).success,
    ).toBe(false);
  });

  it("未来日付は拒否する", () => {
    expect(
      pickGradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 1, seed: "2999-01-01" }).success,
    ).toBe(false);
  });
});
