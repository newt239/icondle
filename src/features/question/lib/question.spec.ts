import { describe, expect, it } from "vitest";

import { jstToday } from "#/lib/quiz-config";

import { questionInputSchema } from "./question";

describe("questionInputSchema", () => {
  it("ランダムシードを受理する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 1, seed: "a7f3c2" }).success).toBe(
      true,
    );
    expect(questionInputSchema.safeParse({ mode: "hard", n: 1, seed: "a7f3c2" }).success).toBe(
      true,
    );
  });

  it("日付シードをモードによらず拒否する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 1, seed: "2020-01-01" }).success).toBe(
      false,
    );
    expect(questionInputSchema.safeParse({ mode: "hard", n: 1, seed: jstToday() }).success).toBe(
      false,
    );
  });

  it("mode がないと拒否する", () => {
    expect(questionInputSchema.safeParse({ n: 1, seed: "a7f3c2" }).success).toBe(false);
  });

  it("n は 10 問まで受理する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 10, seed: "a7f3c2" }).success).toBe(
      true,
    );
    expect(questionInputSchema.safeParse({ mode: "easy", n: 11, seed: "a7f3c2" }).success).toBe(
      false,
    );
  });
});
