import { describe, expect, it } from "vitest";

import { deck } from "#/data/deck";

import { dealAnswer, dealQuestion } from "./deal.server";

import type { QuizMode } from "./quiz-config";

import type { SetId } from "#/data/deck";

const SEED_COUNT = 30;
const QUESTION_COUNT = 10;
const MODES: QuizMode[] = ["easy", "hard"];

const EASY_SET_IDS: SetId[] = [
  "fluent",
  "material-symbols",
  "tabler",
  "lucide",
  "heroicons",
  "fa6-solid",
];

const cases: [QuizMode, string, number][] = [];
for (const mode of MODES) {
  for (let s = 0; s < SEED_COUNT; s += 1) {
    for (let n = 1; n <= QUESTION_COUNT; n += 1) {
      cases.push([mode, `seed-${s}`, n]);
    }
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

describe("deck", () => {
  it("14 セットを収録し easy セットをすべて含む", () => {
    const setIds = Object.keys(deck.sets);
    expect(setIds).toHaveLength(14);
    for (const setId of EASY_SET_IDS) {
      expect(setIds).toContain(setId);
    }
  });
});

describe("dealQuestion", () => {
  it("セットの表示名が一意である", () => {
    expect(labelToSetId.size).toBe(Object.keys(deck.sets).length);
  });

  it("同一の mode と seed と n からは常に同一の出題を返す", () => {
    for (const [mode, seed, n] of cases) {
      expect(dealQuestion(mode, seed, n)).toEqual(dealQuestion(mode, seed, n));
    }
  });

  it("選択肢に重複がない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      expect(new Set(choices).size).toBe(choices.length);
    }
  });

  it("正解が必ず選択肢に含まれる", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      const { answerIndex, meta } = dealAnswer(mode, seed, n);
      expect(choices[answerIndex]).toBe(meta.set);
    }
  });

  it("easy の選択肢が easy セットのみで構成される", () => {
    for (const [mode, seed, n] of cases) {
      if (mode !== "easy") {
        continue;
      }
      const { choices } = dealQuestion(mode, seed, n);
      for (const setId of chosenSetIds(choices)) {
        expect(EASY_SET_IDS).toContain(setId);
      }
    }
  });

  it("選択肢の全セットがその概念を持ち消去法が成立しない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      const { meta } = dealAnswer(mode, seed, n);
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
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      const { meta } = dealAnswer(mode, seed, n);
      const concept = deck.concepts.find((entry) => entry.name === meta.concept);
      const setIds = chosenSetIds(choices);
      for (const group of concept?.collisions ?? []) {
        const overlap = setIds.filter((setId) => group.includes(setId));
        expect(overlap.length).toBeLessThan(2);
      }
    }
  });

  it("出題 SVG の viewBox が正規化されセット固有の viewBox が残らない", () => {
    for (const [mode, seed, n] of cases) {
      const { svg } = dealQuestion(mode, seed, n);
      expect(svg.match(/viewBox/g)).toHaveLength(1);
      expect(svg).toContain('viewBox="0 0 100 100"');
    }
  });
});

describe("dealAnswer", () => {
  it("同一の mode と seed と n からは常に同一の判定情報を返す", () => {
    for (const [mode, seed, n] of cases) {
      expect(dealAnswer(mode, seed, n)).toEqual(dealAnswer(mode, seed, n));
    }
  });

  it("同一プレイ内で概念が重複しない", () => {
    for (const mode of MODES) {
      for (let s = 0; s < SEED_COUNT; s += 1) {
        const concepts = Array.from(
          { length: QUESTION_COUNT },
          (_, index) => dealAnswer(mode, `seed-${s}`, index + 1).meta.concept,
        );
        expect(new Set(concepts).size).toBe(QUESTION_COUNT);
      }
    }
  });

  it("meta が解説とリンク生成に必要な情報を持つ", () => {
    const { meta } = dealAnswer("easy", "seed-meta", 1);
    expect(meta.set.length).toBeGreaterThan(0);
    expect(meta.icon.length).toBeGreaterThan(0);
    expect(Object.keys(deck.sets)).toContain(meta.setId);
  });
});
