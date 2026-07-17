import { describe, expect, it } from "vitest";

import { deck, type Concept, type SetId } from "#/data/deck";

import { dealAnswer, dealPickAnswer, dealPickQuestion, dealQuestion } from "./deal.server";

import type { QuizMode } from "./quiz-config";

const SEED_COUNT = 30;
const QUESTION_COUNT = 10;
const MODES: QuizMode[] = ["easy", "hard"];

const EASY_SET_IDS: SetId[] = ["fluent", "material-symbols", "tabler", "lucide", "carbon", "bi"];

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

const conceptByName = (name: string): Concept | undefined =>
  deck.concepts.find((entry) => entry.name === name);

const stripLabel = (svg: string): string => svg.replace(/aria-label="[^"]*"/, "");

describe("deck", () => {
  it("15 セットを収録し easy セットをすべて含む", () => {
    const setIds = Object.keys(deck.sets);
    expect(setIds).toHaveLength(15);
    for (const setId of EASY_SET_IDS) {
      expect(setIds).toContain(setId);
    }
  });

  it("矢印の概念が収録されている", () => {
    for (const name of ["arrow-up", "arrow-down", "arrow-left", "arrow-right"]) {
      expect(conceptByName(name)).toBeDefined();
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

  it("出題 SVG が 4 件ですべて相異なる", () => {
    for (const [mode, seed, n] of cases) {
      const { svgs } = dealQuestion(mode, seed, n);
      expect(svgs).toHaveLength(4);
      expect(new Set(svgs.map((svg) => stripLabel(svg))).size).toBe(svgs.length);
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

  it("選択肢の全セットが出題中の全概念を持ち消去法が成立しない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      const { meta } = dealAnswer(mode, seed, n);
      const setIds = chosenSetIds(choices);
      expect(setIds).toHaveLength(choices.length);
      for (const answerIcon of meta.icons) {
        const concept = conceptByName(answerIcon.concept);
        expect(concept).toBeDefined();
        for (const setId of setIds) {
          expect(concept?.variants[setId]).toBeDefined();
        }
      }
    }
  });

  it("選択肢に body 衝突ペアが同居しない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealQuestion(mode, seed, n);
      const { meta } = dealAnswer(mode, seed, n);
      const setIds = chosenSetIds(choices);
      for (const answerIcon of meta.icons) {
        const concept = conceptByName(answerIcon.concept);
        for (const group of concept?.collisions ?? []) {
          const overlap = setIds.filter((setId) => group.includes(setId));
          expect(overlap.length).toBeLessThan(2);
        }
      }
    }
  });

  it("出題 SVG の viewBox が正規化されセット固有の viewBox が残らない", () => {
    for (const [mode, seed, n] of cases) {
      const { svgs } = dealQuestion(mode, seed, n);
      for (const svg of svgs) {
        expect(svg.match(/viewBox/g)).toHaveLength(1);
        expect(svg).toContain('viewBox="0 0 100 100"');
      }
    }
  });

  it("出題 SVG の aria-label がセット名やアイコン名を漏らさない", () => {
    for (const [mode, seed, n] of cases) {
      const { svgs } = dealQuestion(mode, seed, n);
      for (const [index, svg] of svgs.entries()) {
        const label = /aria-label="(?<label>[^"]*)"/.exec(svg);
        expect(label?.groups?.label).toBe(`出題中のアイコン${index + 1}`);
      }
    }
  });
});

describe("dealAnswer", () => {
  it("同一の mode と seed と n からは常に同一の判定情報を返す", () => {
    for (const [mode, seed, n] of cases) {
      expect(dealAnswer(mode, seed, n)).toEqual(dealAnswer(mode, seed, n));
    }
  });

  it("1 問内で概念が重複しない", () => {
    for (const [mode, seed, n] of cases) {
      const { meta } = dealAnswer(mode, seed, n);
      const concepts = meta.icons.map((icon) => icon.concept);
      expect(new Set(concepts).size).toBe(concepts.length);
    }
  });

  it("同一プレイ内で概念が重複しない", () => {
    for (const mode of MODES) {
      for (let s = 0; s < SEED_COUNT; s += 1) {
        const concepts = Array.from({ length: QUESTION_COUNT }, (_, index) =>
          dealAnswer(mode, `seed-${s}`, index + 1).meta.icons.map((icon) => icon.concept),
        ).flat();
        expect(new Set(concepts).size).toBe(QUESTION_COUNT * 4);
      }
    }
  });

  it("n を逆順に取得しても昇順取得と同一の判定情報を返す", () => {
    for (const mode of MODES) {
      const seed = "reverse-access";
      const descending = Array.from({ length: QUESTION_COUNT }, (_, index) =>
        dealAnswer(mode, seed, QUESTION_COUNT - index),
      ).toReversed();
      const ascending = Array.from({ length: QUESTION_COUNT }, (_, index) =>
        dealAnswer(mode, seed, index + 1),
      );
      expect(descending).toEqual(ascending);
    }
  });

  it("多数の seed で最終問まで出題を形成できる", () => {
    for (const mode of MODES) {
      for (let s = 0; s < 100; s += 1) {
        expect(() => dealAnswer(mode, `form-${s}`, QUESTION_COUNT)).not.toThrow();
      }
    }
  });

  it("meta が解説とリンク生成に必要な情報を持つ", () => {
    const { meta } = dealAnswer("easy", "seed-meta", 1);
    expect(meta.set.length).toBeGreaterThan(0);
    expect(meta.icons).toHaveLength(4);
    for (const icon of meta.icons) {
      expect(icon.icon.length).toBeGreaterThan(0);
      expect(icon.concept.length).toBeGreaterThan(0);
    }
    expect(Object.keys(deck.sets)).toContain(meta.setId);
  });
});

const pickCandidatesFor = (mode: QuizMode, seed: string, n: number): SetId[][] => {
  const { choices } = dealPickQuestion(mode, seed, n);
  const { meta } = dealPickAnswer(mode, seed, n);
  const concepts = meta.icons.map((icon) => conceptByName(icon.concept));
  for (const concept of concepts) {
    expect(concept).toBeDefined();
  }
  const allSetIds = Object.keys(deck.sets).filter((value): value is SetId => value in deck.sets);
  return choices.map((svgs) =>
    allSetIds.filter((setId) =>
      concepts.every((concept, index) => {
        const variant = concept?.variants[setId];
        const svg = svgs[index];
        if (variant === undefined || svg === undefined) {
          return false;
        }
        return svg.slice(svg.indexOf("><g ")).includes(variant.body);
      }),
    ),
  );
};

describe("dealPickQuestion", () => {
  it("同一の mode と seed と n からは常に同一の出題を返す", () => {
    for (const [mode, seed, n] of cases) {
      expect(dealPickQuestion(mode, seed, n)).toEqual(dealPickQuestion(mode, seed, n));
    }
  });

  it("選択肢が 4 件で各選択肢が 4 つの SVG を持ち全 16 描画が相異なる", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealPickQuestion(mode, seed, n);
      expect(choices).toHaveLength(4);
      for (const svgs of choices) {
        expect(svgs).toHaveLength(4);
      }
      const all = choices.flat().map((svg) => stripLabel(svg));
      expect(new Set(all).size).toBe(all.length);
    }
  });

  it("同一概念の SVG が選択肢間ですべて相異なる", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealPickQuestion(mode, seed, n);
      for (let iconIndex = 0; iconIndex < 4; iconIndex += 1) {
        const row = choices.map((svgs) => stripLabel(svgs[iconIndex] ?? ""));
        expect(new Set(row).size).toBe(choices.length);
      }
    }
  });

  it("すべての SVG の viewBox が正規化されセット固有の viewBox が残らない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealPickQuestion(mode, seed, n);
      for (const svgs of choices) {
        for (const svg of svgs) {
          expect(svg.match(/viewBox/g)).toHaveLength(1);
          expect(svg).toContain('viewBox="0 0 100 100"');
        }
      }
    }
  });

  it("aria-label が選択肢番号のみでセット名やアイコン名を漏らさない", () => {
    for (const [mode, seed, n] of cases) {
      const { choices } = dealPickQuestion(mode, seed, n);
      for (const [choiceIndex, svgs] of choices.entries()) {
        for (const [iconIndex, svg] of svgs.entries()) {
          const label = /aria-label="(?<label>[^"]*)"/.exec(svg);
          expect(label?.groups?.label).toBe(`選択肢${choiceIndex + 1}のアイコン${iconIndex + 1}`);
        }
      }
    }
  });

  it("setLabel が正解セットのラベルで answerIndex の選択肢が正解セットの variant を含む", () => {
    for (const [mode, seed, n] of cases) {
      const { setLabel, choices } = dealPickQuestion(mode, seed, n);
      const { answerIndex, meta } = dealPickAnswer(mode, seed, n);
      expect(setLabel).toBe(meta.set);
      const candidates = pickCandidatesFor(mode, seed, n);
      expect(candidates).toHaveLength(choices.length);
      expect(candidates[answerIndex]).toContain(meta.setId);
    }
  });

  it("easy の選択肢が easy セットのみで構成される", () => {
    for (const [mode, seed, n] of cases) {
      if (mode !== "easy") {
        continue;
      }
      for (const candidates of pickCandidatesFor(mode, seed, n)) {
        expect(candidates.some((setId) => EASY_SET_IDS.includes(setId))).toBe(true);
      }
    }
  });

  it("選択肢に body 衝突ペアが同居しない", () => {
    for (const [mode, seed, n] of cases) {
      const { meta } = dealPickAnswer(mode, seed, n);
      const candidates = pickCandidatesFor(mode, seed, n);
      for (const answerIcon of meta.icons) {
        const concept = conceptByName(answerIcon.concept);
        for (const group of concept?.collisions ?? []) {
          const overlap = candidates.filter((setIds) =>
            setIds.some((setId) => group.includes(setId)),
          );
          expect(overlap.length).toBeLessThan(2);
        }
      }
    }
  });
});

describe("dealPickAnswer", () => {
  it("同一の mode と seed と n からは常に同一の判定情報を返す", () => {
    for (const [mode, seed, n] of cases) {
      expect(dealPickAnswer(mode, seed, n)).toEqual(dealPickAnswer(mode, seed, n));
    }
  });

  it("同一プレイ内で概念が重複しない", () => {
    for (const mode of MODES) {
      for (let s = 0; s < SEED_COUNT; s += 1) {
        const concepts = Array.from({ length: QUESTION_COUNT }, (_, index) =>
          dealPickAnswer(mode, `seed-${s}`, index + 1).meta.icons.map((icon) => icon.concept),
        ).flat();
        expect(new Set(concepts).size).toBe(QUESTION_COUNT * 4);
      }
    }
  });

  it("同一シードでも play とは異なる概念列を出題する", () => {
    for (const mode of MODES) {
      for (let s = 0; s < SEED_COUNT; s += 1) {
        const playConcepts = Array.from({ length: QUESTION_COUNT }, (_, index) =>
          dealAnswer(mode, `seed-${s}`, index + 1).meta.icons.map((icon) => icon.concept),
        ).flat();
        const pickConcepts = Array.from({ length: QUESTION_COUNT }, (_, index) =>
          dealPickAnswer(mode, `seed-${s}`, index + 1).meta.icons.map((icon) => icon.concept),
        ).flat();
        expect(pickConcepts).not.toEqual(playConcepts);
      }
    }
  });
});
