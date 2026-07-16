import { describe, expect, it } from "vitest";

import { gradeInputSchema, runResultInputSchema } from "./grade";

describe("gradeInputSchema", () => {
  it("easy はランダムシードと日付シードの両方を受理する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "easy", n: 5, seed: "2020-01-01" }).success,
    ).toBe(true);
  });

  it("hard は日付シードを拒否する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
    expect(
      gradeInputSchema.safeParse({ answer: 0, mode: "hard", n: 1, seed: "2020-01-01" }).success,
    ).toBe(false);
  });

  it("mode がないと拒否する", () => {
    expect(gradeInputSchema.safeParse({ answer: 0, n: 1, seed: "a7f3c2" }).success).toBe(false);
  });
});

describe("runResultInputSchema", () => {
  it("easy はランダムシードと日付シードの両方を受理する", () => {
    expect(
      runResultInputSchema.safeParse({ answers: "0000000000", mode: "easy", seed: "a7f3c2" })
        .success,
    ).toBe(true);
    expect(
      runResultInputSchema.safeParse({ answers: "00000", mode: "easy", seed: "2020-01-01" })
        .success,
    ).toBe(true);
  });

  it("hard は日付シードを拒否する", () => {
    expect(
      runResultInputSchema.safeParse({ answers: "0000000000", mode: "hard", seed: "a7f3c2" })
        .success,
    ).toBe(true);
    expect(
      runResultInputSchema.safeParse({ answers: "00000", mode: "hard", seed: "2020-01-01" })
        .success,
    ).toBe(false);
  });

  it("mode がないと拒否する", () => {
    expect(runResultInputSchema.safeParse({ answers: "0000000000", seed: "a7f3c2" }).success).toBe(
      false,
    );
  });
});
