import "@tanstack/react-start/server-only";
import { deck } from "#/data/deck";

import { hash, mulberry32 } from "./prng";
import { normalize } from "./render-icon.server";

import type { AnswerMeta, ClientQuestion } from "./quiz-types";

import type { Concept, SetId } from "#/data/deck";

const CHOICE_COUNT = 4;

const isSetId = (value: string): value is SetId => value in deck.sets;

const shuffle = <T>(rng: () => number, items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a !== undefined && b !== undefined) {
      result[i] = b;
      result[j] = a;
    }
  }
  return result;
};

const pickSets = (rng: () => number, concept: Concept): SetId[] | null => {
  const owners = shuffle(rng, Object.keys(concept.variants).filter(isSetId));
  const chosen: SetId[] = [];
  for (const candidate of owners) {
    const collides = concept.collisions.some(
      (group) => group.includes(candidate) && chosen.some((setId) => group.includes(setId)),
    );
    if (!collides) {
      chosen.push(candidate);
      if (chosen.length === CHOICE_COUNT) {
        return chosen;
      }
    }
  }
  return null;
};

type Dealt = {
  concept: Concept;
  sets: SetId[];
  answerIndex: number;
  answerSet: SetId;
};

const deal = (seed: string, n: number): Dealt => {
  const rng = mulberry32(hash(`${seed}:${n}`));
  const order = shuffle(
    rng,
    deck.concepts.map((_, index) => index),
  );
  for (const index of order) {
    const concept = deck.concepts[index];
    if (!concept) {
      continue;
    }
    const sets = pickSets(rng, concept);
    if (!sets) {
      continue;
    }
    const answerIndex = Math.floor(rng() * CHOICE_COUNT);
    const answerSet = sets[answerIndex];
    if (answerSet === undefined) {
      continue;
    }
    return { answerIndex, answerSet, concept, sets };
  }
  throw new Error(`出題可能な概念が見つかりません: ${seed}:${n}`);
};

export const dealQuestion = (seed: string, n: number): ClientQuestion => {
  const dealt = deal(seed, n);
  const variant = dealt.concept.variants[dealt.answerSet];
  if (!variant) {
    throw new Error(`正解セットの variant がありません: ${dealt.concept.name}`);
  }
  const [first, second, third, fourth] = dealt.sets.map((setId) => deck.sets[setId].label);
  if (first === undefined || second === undefined || third === undefined || fourth === undefined) {
    throw new Error(`選択肢が ${CHOICE_COUNT} 件になりません: ${dealt.concept.name}`);
  }
  return {
    choices: [first, second, third, fourth],
    svg: normalize(variant),
  };
};

export const dealAnswer = (seed: string, n: number): { answerIndex: number; meta: AnswerMeta } => {
  const dealt = deal(seed, n);
  const variant = dealt.concept.variants[dealt.answerSet];
  if (!variant) {
    throw new Error(`正解セットの variant がありません: ${dealt.concept.name}`);
  }
  const set = deck.sets[dealt.answerSet];
  return {
    answerIndex: dealt.answerIndex,
    meta: {
      cap: set.cap,
      concept: dealt.concept.name,
      grid: set.grid,
      icon: variant.name,
      license: set.license,
      origin: set.origin,
      set: set.label,
      setId: set.id,
      strokeWidth: set.strokeWidth,
      style: set.style,
    },
  };
};
