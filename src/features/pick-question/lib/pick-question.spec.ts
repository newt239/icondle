import { describe, expect, it } from "vitest";

import { pickQuestionInputSchema } from "#/features/pick-question/schemas";

describe("pickQuestionInputSchema", () => {
  it("easy は日付シードを受理する", () => {
    expect(
      pickQuestionInputSchema.safeParse({ mode: "easy", n: 5, seed: "2020-01-01" }).success,
    ).toBe(true);
  });

  it("hard は日付シードを拒否する", () => {
    expect(pickQuestionInputSchema.safeParse({ mode: "hard", n: 1, seed: "a7f3c2" }).success).toBe(
      true,
    );
    expect(
      pickQuestionInputSchema.safeParse({ mode: "hard", n: 1, seed: "2020-01-01" }).success,
    ).toBe(false);
  });

  it("未来日付は拒否する", () => {
    expect(
      pickQuestionInputSchema.safeParse({ mode: "easy", n: 1, seed: "2999-01-01" }).success,
    ).toBe(false);
  });

  it("n がモードの問題数を超えると拒否する", () => {
    expect(pickQuestionInputSchema.safeParse({ mode: "easy", n: 6, seed: "a7f3c2" }).success).toBe(
      false,
    );
    expect(pickQuestionInputSchema.safeParse({ mode: "hard", n: 10, seed: "a7f3c2" }).success).toBe(
      true,
    );
  });
});
