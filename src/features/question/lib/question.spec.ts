import { describe, expect, it } from "vitest";

import { questionInputSchema } from "#/features/question/schemas";

describe("questionInputSchema", () => {
  it("ランダムシードを受理する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 1, seed: "a7f3c2" }).success).toBe(
      true,
    );
  });

  it("日付シードをモードによらず拒否する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 1, seed: "2020-01-01" }).success).toBe(
      false,
    );
  });

  it("n がモードの問題数を超えると拒否する", () => {
    expect(questionInputSchema.safeParse({ mode: "easy", n: 6, seed: "a7f3c2" }).success).toBe(
      false,
    );
    expect(questionInputSchema.safeParse({ mode: "hard", n: 10, seed: "a7f3c2" }).success).toBe(
      true,
    );
  });
});
