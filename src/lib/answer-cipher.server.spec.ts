import { describe, expect, it } from "vitest";

import { decodeAnswer, encodeAnswer } from "./answer-cipher.server";

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

  it("出力は常に 0-3 の範囲に収まる", () => {
    for (let picked = 0; picked < 4; picked += 1) {
      const encoded = encodeAnswer("secret", ctx, picked);
      expect(encoded).toBeGreaterThanOrEqual(0);
      expect(encoded).toBeLessThanOrEqual(3);
    }
  });
});
