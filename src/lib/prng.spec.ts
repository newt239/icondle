import { describe, expect, test } from "vitest";

import { hash, mulberry32 } from "./prng";

describe("hash", () => {
  test("同一入力から同一値を返す", () => {
    expect(hash("seed:1:easy")).toBe(hash("seed:1:easy"));
  });

  test("異なる入力から異なる値を返す", () => {
    expect(hash("seed:1:easy")).not.toBe(hash("seed:2:easy"));
  });
});

describe("mulberry32", () => {
  test("同一 seed から同一の乱数列を返す", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test("0 以上 1 未満の値を返す", () => {
    const rng = mulberry32(hash("icondle"));
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
