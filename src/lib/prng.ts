// oxlint-disable no-bitwise, unicorn/prefer-math-trunc, unicorn/number-literal-case -- 32bit 整数演算を意図的に使う PRNG 実装のため。hex の大文字化は oxfmt と競合する
export const hash = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + (input.codePointAt(i) ?? 0);
  }
  return h >>> 0;
};

export const mulberry32 = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
