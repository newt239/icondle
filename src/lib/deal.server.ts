import "@tanstack/react-start/server-only";
import { deck } from "#/data/deck";

import { hash, mulberry32 } from "./prng";
import { normalize } from "./render-icon.server";

import type { QuizMode } from "./quiz-config";
import type { AnswerMeta, ClientQuestion } from "./quiz-types";

import type { Concept, SetId } from "#/data/deck";

const CHOICE_COUNT = 4;

const EASY_SET_IDS: ReadonlySet<SetId> = new Set([
  "fluent",
  "material-symbols",
  "tabler",
  "lucide",
  "heroicons",
  "fa6-solid",
]);

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

const ownersFor = (mode: QuizMode, concept: Concept): SetId[] => {
  const owners = Object.keys(concept.variants).filter(isSetId);
  return mode === "easy" ? owners.filter((setId) => EASY_SET_IDS.has(setId)) : owners;
};

const distinctOwnerCount = (owners: SetId[], collisions: SetId[][]): number => {
  const grouped = new Set<SetId>();
  let distinct = 0;
  for (const group of collisions) {
    const members = group.filter((setId) => owners.includes(setId));
    for (const member of members) {
      grouped.add(member);
    }
    if (members.length > 0) {
      distinct += 1;
    }
  }
  return distinct + owners.filter((setId) => !grouped.has(setId)).length;
};

const pools = new Map<QuizMode, Concept[]>();

const poolFor = (mode: QuizMode): Concept[] => {
  const cached = pools.get(mode);
  if (cached) {
    return cached;
  }
  const pool = deck.concepts.filter(
    (concept) => distinctOwnerCount(ownersFor(mode, concept), concept.collisions) >= CHOICE_COUNT,
  );
  pools.set(mode, pool);
  return pool;
};

const pickSets = (rng: () => number, owners: SetId[], concept: Concept): SetId[] | null => {
  const shuffled = shuffle(rng, owners);
  const chosen: SetId[] = [];
  for (const candidate of shuffled) {
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

const deal = (mode: QuizMode, seed: string, n: number): Dealt => {
  const pool = poolFor(mode);
  const order = shuffle(
    mulberry32(hash(seed)),
    pool.map((_, index) => index),
  );
  const poolIndex = order[n - 1];
  const concept = poolIndex === undefined ? undefined : pool[poolIndex];
  if (!concept) {
    throw new Error(`出題可能な概念が見つかりません: ${mode}:${seed}:${n}`);
  }
  const rng = mulberry32(hash(`${seed}:${n}`));
  const sets = pickSets(rng, ownersFor(mode, concept), concept);
  if (!sets) {
    throw new Error(`選択肢を構成できません: ${mode}:${concept.name}`);
  }
  const answerIndex = Math.floor(rng() * CHOICE_COUNT);
  const answerSet = sets[answerIndex];
  if (answerSet === undefined) {
    throw new Error(`正解セットを決定できません: ${mode}:${concept.name}`);
  }
  return { answerIndex, answerSet, concept, sets };
};

export const dealQuestion = (mode: QuizMode, seed: string, n: number): ClientQuestion => {
  const dealt = deal(mode, seed, n);
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

export const dealAnswer = (
  mode: QuizMode,
  seed: string,
  n: number,
): { answerIndex: number; meta: AnswerMeta } => {
  const dealt = deal(mode, seed, n);
  const variant = dealt.concept.variants[dealt.answerSet];
  if (!variant) {
    throw new Error(`正解セットの variant がありません: ${dealt.concept.name}`);
  }
  const set = deck.sets[dealt.answerSet];
  return {
    answerIndex: dealt.answerIndex,
    meta: {
      concept: dealt.concept.name,
      icon: variant.name,
      set: set.label,
      setId: set.id,
    },
  };
};
