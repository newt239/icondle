import { describe, expect, it } from "vitest";

import { deck } from "#/data/deck";

import { dealAnswer, dealQuestion } from "./deal.server";

import type { SetId } from "#/data/deck";

const SEED_COUNT = 30;
const QUESTION_COUNT = 10;

const cases: [string, number][] = [];
for (let s = 0; s < SEED_COUNT; s += 1) {
  for (let n = 1; n <= QUESTION_COUNT; n += 1) {
    cases.push([`seed-${s}`, n]);
  }
}

const labelToSetId = new Map<string, SetId>();
for (const set of Object.values(deck.sets)) {
  labelToSetId.set(set.label, set.id);
}

const chosenSetIds = (choices: string[]): SetId[] =>
  choices.flatMap((label) => {
    const setId = labelToSetId.get(label);
    return setId === undefined ? [] : [setId];
  });

describe("dealQuestion", () => {
  it("セットの表示名が一意である", () => {
    expect(labelToSetId.size).toBe(Object.keys(deck.sets).length);
  });

  it("同一の seed と n からは常に同一の出題を返す", () => {
    for (const [seed, n] of cases) {
      expect(dealQuestion(seed, n)).toEqual(dealQuestion(seed, n));
    }
  });

  it("選択肢に重複がない", () => {
    for (const [seed, n] of cases) {
      const { choices } = dealQuestion(seed, n);
      expect(new Set(choices).size).toBe(choices.length);
    }
  });

  it("正解が必ず選択肢に含まれる", () => {
    for (const [seed, n] of cases) {
      const { choices } = dealQuestion(seed, n);
      const { answerIndex, meta } = dealAnswer(seed, n);
      expect(choices[answerIndex]).toBe(meta.set);
    }
  });

  it("選択肢の全セットがその概念を持ち消去法が成立しない", () => {
    for (const [seed, n] of cases) {
      const { choices } = dealQuestion(seed, n);
      const { meta } = dealAnswer(seed, n);
      const concept = deck.concepts.find((entry) => entry.name === meta.concept);
      expect(concept).toBeDefined();
      const setIds = chosenSetIds(choices);
      expect(setIds).toHaveLength(choices.length);
      for (const setId of setIds) {
        expect(concept?.variants[setId]).toBeDefined();
      }
    }
  });

  it("選択肢に body 衝突ペアが同居しない", () => {
    for (const [seed, n] of cases) {
      const { choices } = dealQuestion(seed, n);
      const { meta } = dealAnswer(seed, n);
      const concept = deck.concepts.find((entry) => entry.name === meta.concept);
      const setIds = chosenSetIds(choices);
      for (const group of concept?.collisions ?? []) {
        const overlap = setIds.filter((setId) => group.includes(setId));
        expect(overlap.length).toBeLessThan(2);
      }
    }
  });

  it("出題 SVG の viewBox が正規化されセット固有の viewBox が残らない", () => {
    for (const [seed, n] of cases) {
      const { svg } = dealQuestion(seed, n);
      expect(svg.match(/viewBox/g)).toHaveLength(1);
      expect(svg).toContain('viewBox="0 0 100 100"');
    }
  });
});

describe("dealAnswer", () => {
  it("同一の seed と n からは常に同一の判定情報を返す", () => {
    for (const [seed, n] of cases) {
      expect(dealAnswer(seed, n)).toEqual(dealAnswer(seed, n));
    }
  });

  it("meta が解説パネルに必要な情報を持つ", () => {
    const { meta } = dealAnswer("seed-meta", 1);
    expect(meta.set.length).toBeGreaterThan(0);
    expect(meta.icon.length).toBeGreaterThan(0);
    expect(meta.license.title.length).toBeGreaterThan(0);
    expect(meta.grid).toBeGreaterThan(0);
  });
});
