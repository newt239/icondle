import { describe, expect, it } from "vitest";

import { gradeInputSchema } from "./grade";

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
});
