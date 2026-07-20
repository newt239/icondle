import { afterEach, describe, expect, it } from "vitest";

import { decodeAnswer, encodeAnswer, requireAnswerCipherSecret } from "./cipher.server";

const ctx = { game: "play" as const, mode: "easy" as const, n: 1, seed: "a7f3c2" };

describe("answer-cipher", () => {
  it("encodeAnswer した値を decodeAnswer で元に戻せる", () => {
    for (let picked = 0; picked < 4; picked += 1) {
      const encoded = encodeAnswer("secret", ctx, picked);
      expect(decodeAnswer("secret", ctx, encoded)).toBe(picked);
    }
  });

  it("game が異なると shift も変わる", () => {
    const playEncoded = encodeAnswer("secret", { ...ctx, game: "play" }, 0);
    const pickEncoded = encodeAnswer("secret", { ...ctx, game: "pick" }, 0);
    expect(playEncoded).not.toBe(pickEncoded);
  });
});

describe("requireAnswerCipherSecret", () => {
  const original = process.env.ANSWER_CIPHER_SECRET;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ANSWER_CIPHER_SECRET;
    } else {
      process.env.ANSWER_CIPHER_SECRET = original;
    }
  });

  it("設定済みならその値を返す", () => {
    process.env.ANSWER_CIPHER_SECRET = "secret";
    expect(requireAnswerCipherSecret()).toBe("secret");
  });

  it("未設定ならエラーを投げる", () => {
    delete process.env.ANSWER_CIPHER_SECRET;
    expect(() => requireAnswerCipherSecret()).toThrow();
  });

  it("空文字ならエラーを投げる", () => {
    process.env.ANSWER_CIPHER_SECRET = "";
    expect(() => requireAnswerCipherSecret()).toThrow();
  });
});
