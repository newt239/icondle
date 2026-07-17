import { afterEach, describe, expect, it, vi } from "vitest";

import { trackQuizComplete } from "./analytics";

const params = {
  game: "play",
  mode: "easy",
  score: 4,
  seed: "a7f3c2",
  total: 5,
} as const;

describe("trackQuizComplete", () => {
  afterEach(() => {
    globalThis.gtag = undefined;
  });

  it("gtag が定義されていれば quiz_complete イベントを送信する", () => {
    const gtagMock = vi.fn();
    globalThis.gtag = gtagMock;
    trackQuizComplete(params);
    expect(gtagMock).toHaveBeenCalledExactlyOnceWith("event", "quiz_complete", {
      game: "play",
      mode: "easy",
      score: 4,
      seed: "a7f3c2",
      total: 5,
    });
  });

  it("gtag が未定義でもエラーにならない", () => {
    globalThis.gtag = undefined;
    expect(() => trackQuizComplete(params)).not.toThrow();
  });
});
