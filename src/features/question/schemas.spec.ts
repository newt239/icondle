import { describe, expect, it } from "vitest";

import { gradeInputSchema, questionInputSchema } from "#/features/question/schemas";

describe("questionInputSchema", () => {
  it("ランダムシードを受理する", () => {
    expect(
      questionInputSchema.safeParse({ game: "play", mode: "easy", n: 1, seed: "a7f3c2" }).success,
    ).toBe(true);
  });

  it("play は日付シードを拒否する", () => {
    expect(
      questionInputSchema.safeParse({ game: "play", mode: "easy", n: 1, seed: "2020-01-01" })
        .success,
    ).toBe(false);
  });

  it("pick の easy は過去の日付シードを受理する", () => {
    expect(
      questionInputSchema.safeParse({ game: "pick", mode: "easy", n: 5, seed: "2020-01-01" })
        .success,
    ).toBe(true);
  });

  it("pick の easy は未来の日付シードを拒否する", () => {
    expect(
      questionInputSchema.safeParse({ game: "pick", mode: "easy", n: 1, seed: "2999-01-01" })
        .success,
    ).toBe(false);
  });

  it("pick の hard は日付シードを拒否する", () => {
    expect(
      questionInputSchema.safeParse({ game: "pick", mode: "hard", n: 1, seed: "2020-01-01" })
        .success,
    ).toBe(false);
  });

  it("n がモードの問題数を超えると拒否する", () => {
    expect(
      questionInputSchema.safeParse({ game: "play", mode: "easy", n: 6, seed: "a7f3c2" }).success,
    ).toBe(false);
    expect(
      questionInputSchema.safeParse({ game: "play", mode: "hard", n: 10, seed: "a7f3c2" }).success,
    ).toBe(true);
  });
});

describe("gradeInputSchema", () => {
  it("answer が選択肢の範囲外だと拒否する", () => {
    expect(
      gradeInputSchema.safeParse({ answer: 4, game: "play", mode: "easy", n: 1, seed: "a7f3c2" })
        .success,
    ).toBe(false);
  });
});
