import "@tanstack/react-start/server-only";
import { deck, type Concept, type SetId } from "#/data/deck";

import { normalize } from "./icon.server";
import { hash, mulberry32 } from "./prng";

import type { QuizMode } from "./config";

import type {
  AnswerIcon,
  AnswerMeta,
  ClientQuestion,
  PickChoiceSvgs,
  PickClientQuestion,
} from "#/types";

const CHOICE_COUNT = 4;
const GROUP_SIZE = 4;

export const EASY_SET_IDS: ReadonlySet<SetId> = new Set([
  "fluent",
  "material-symbols",
  "tabler",
  "lucide",
  "carbon",
  "bi",
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

const tuple4 = <T>(items: readonly T[], message: string): [T, T, T, T] => {
  const [first, second, third, fourth] = items;
  if (
    items.length !== 4 ||
    first === undefined ||
    second === undefined ||
    third === undefined ||
    fourth === undefined
  ) {
    throw new Error(message);
  }
  return [first, second, third, fourth];
};

const ownersFor = (mode: QuizMode, concept: Concept): SetId[] => {
  const owners = Object.keys(concept.variants).filter((value): value is SetId => isSetId(value));
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

const collides = (
  concepts: readonly Concept[],
  chosen: readonly SetId[],
  candidate: SetId,
): boolean =>
  concepts.some((concept) =>
    concept.collisions.some(
      (group) => group.includes(candidate) && chosen.some((setId) => group.includes(setId)),
    ),
  );

const normalizedBodies = new Map<string, string>();

const bodyOf = (concept: Concept, setId: SetId): string | null => {
  const variant = concept.variants[setId];
  if (!variant) {
    return null;
  }
  const cached = normalizedBodies.get(variant.body);
  if (cached !== undefined) {
    return cached;
  }
  const normalized = variant.body.replaceAll(/\s+/g, " ").trim();
  normalizedBodies.set(variant.body, normalized);
  return normalized;
};

const duplicatesAcross = (
  concepts: readonly Concept[],
  chosen: readonly SetId[],
  candidate: SetId,
): boolean =>
  concepts.some((concept, i) =>
    chosen.some((setId) =>
      concepts.some((other, j) => j !== i && bodyOf(concept, candidate) === bodyOf(other, setId)),
    ),
  );

const findSets = (owners: readonly SetId[], concepts: readonly Concept[]): SetId[] | null => {
  const usable = owners.filter((setId) => {
    const bodies = concepts.map((concept) => bodyOf(concept, setId));
    return bodies.every((body) => body !== null) && new Set(bodies).size === bodies.length;
  });
  const search = (start: number, chosen: SetId[]): SetId[] | null => {
    if (chosen.length === CHOICE_COUNT) {
      return chosen;
    }
    for (let i = start; i < usable.length; i += 1) {
      const candidate = usable[i];
      if (
        candidate === undefined ||
        collides(concepts, chosen, candidate) ||
        duplicatesAcross(concepts, chosen, candidate)
      ) {
        continue;
      }
      const found = search(i + 1, [...chosen, candidate]);
      if (found) {
        return found;
      }
    }
    return null;
  };
  return search(0, []);
};

type Group = {
  indices: number[];
  concepts: Concept[];
  owners: SetId[];
};

type GroupInput = {
  mode: QuizMode;
  pool: Concept[];
  order: number[];
  used: ReadonlySet<number>;
};

const formGroup = ({ mode, pool, order, used }: GroupInput): Group | null => {
  const skippedAnchors = new Set<number>();
  for (;;) {
    let anchorPos = -1;
    for (let pos = 0; pos < order.length; pos += 1) {
      const index = order[pos];
      if (index !== undefined && !used.has(index) && !skippedAnchors.has(index)) {
        anchorPos = pos;
        break;
      }
    }
    const anchorIndex = anchorPos === -1 ? undefined : order[anchorPos];
    const anchor = anchorIndex === undefined ? undefined : pool[anchorIndex];
    if (anchorIndex === undefined || anchor === undefined) {
      return null;
    }
    let owners = ownersFor(mode, anchor);
    const indices = [anchorIndex];
    const concepts = [anchor];
    for (let pos = anchorPos + 1; pos < order.length && concepts.length < GROUP_SIZE; pos += 1) {
      const index = order[pos];
      const concept = index === undefined ? undefined : pool[index];
      if (index === undefined || concept === undefined || used.has(index)) {
        continue;
      }
      const candidateOwners = ownersFor(mode, concept);
      const intersection = owners.filter((setId) => candidateOwners.includes(setId));
      if (intersection.length < CHOICE_COUNT || !findSets(intersection, [...concepts, concept])) {
        continue;
      }
      owners = intersection;
      indices.push(index);
      concepts.push(concept);
    }
    if (concepts.length === GROUP_SIZE) {
      return { concepts, indices, owners };
    }
    skippedAnchors.add(anchorIndex);
  }
};

type GroupCacheEntry = {
  groups: Group[];
  order: number[];
  used: Set<number>;
};

const GROUP_CACHE_LIMIT = 100;
const groupCache = new Map<string, GroupCacheEntry>();

const groupCacheEntryFor = (mode: QuizMode, seed: string): GroupCacheEntry => {
  const key = `${mode}:${seed}`;
  const cached = groupCache.get(key);
  if (cached) {
    groupCache.delete(key);
    groupCache.set(key, cached);
    return cached;
  }
  const pool = poolFor(mode);
  const entry: GroupCacheEntry = {
    groups: [],
    order: shuffle(
      mulberry32(hash(seed)),
      pool.map((_, index) => index),
    ),
    used: new Set<number>(),
  };
  groupCache.set(key, entry);
  if (groupCache.size > GROUP_CACHE_LIMIT) {
    const oldestKey = groupCache.keys().next().value;
    if (oldestKey !== undefined) {
      groupCache.delete(oldestKey);
    }
  }
  return entry;
};

const getOrGrowGroups = (mode: QuizMode, seed: string, count: number): Group[] => {
  const pool = poolFor(mode);
  const entry = groupCacheEntryFor(mode, seed);
  while (entry.groups.length < count) {
    const group = formGroup({ mode, order: entry.order, pool, used: entry.used });
    if (!group) {
      throw new Error(`出題グループを形成できません: ${mode}:${seed}:${entry.groups.length + 1}`);
    }
    for (const index of group.indices) {
      entry.used.add(index);
    }
    entry.groups.push(group);
  }
  return entry.groups;
};

type Dealt = {
  concepts: [Concept, Concept, Concept, Concept];
  sets: [SetId, SetId, SetId, SetId];
  answerIndex: number;
  answerSet: SetId;
};

const deal = (mode: QuizMode, seed: string, n: number): Dealt => {
  const group = getOrGrowGroups(mode, seed, n)[n - 1];
  if (!group) {
    throw new Error(`出題可能な概念が見つかりません: ${mode}:${seed}:${n}`);
  }
  const rng = mulberry32(hash(`${seed}:${n}`));
  const sets = findSets(shuffle(rng, group.owners), group.concepts);
  if (!sets) {
    throw new Error(`選択肢を構成できません: ${mode}:${seed}:${n}`);
  }
  const answerIndex = Math.floor(rng() * CHOICE_COUNT);
  const setsTuple = tuple4(sets, `選択肢が ${CHOICE_COUNT} 件になりません: ${mode}:${seed}:${n}`);
  const answerSet = setsTuple[answerIndex];
  if (answerSet === undefined) {
    throw new Error(`正解セットを決定できません: ${mode}:${seed}:${n}`);
  }
  return {
    answerIndex,
    answerSet,
    concepts: tuple4(
      group.concepts,
      `出題概念が ${GROUP_SIZE} 件になりません: ${mode}:${seed}:${n}`,
    ),
    sets: setsTuple,
  };
};

const variantFor = (concept: Concept, setId: SetId) => {
  const variant = concept.variants[setId];
  if (!variant) {
    throw new Error(`variant がありません: ${concept.name}:${setId}`);
  }
  return variant;
};

export const dealQuestion = (mode: QuizMode, seed: string, n: number): ClientQuestion => {
  const dealt = deal(mode, seed, n);
  const svgs = dealt.concepts.map((concept, index) =>
    normalize(variantFor(concept, dealt.answerSet), `出題中のアイコン${index + 1}`),
  );
  const choices = dealt.sets.map((setId) => deck.sets[setId].label);
  return {
    choices: tuple4(choices, `選択肢が ${CHOICE_COUNT} 件になりません: ${mode}:${seed}:${n}`),
    svgs: tuple4(svgs, `出題 SVG が ${GROUP_SIZE} 件になりません: ${mode}:${seed}:${n}`),
  };
};

const answerFor = (dealt: Dealt): { answerIndex: number; meta: AnswerMeta } => {
  const icons: AnswerIcon[] = dealt.concepts.map((concept, index) => {
    const variant = variantFor(concept, dealt.answerSet);
    return {
      concept: concept.name,
      icon: variant.name,
      svg: normalize(variant, `正解アイコン${index + 1}`),
    };
  });
  const set = deck.sets[dealt.answerSet];
  return {
    answerIndex: dealt.answerIndex,
    meta: {
      icons: tuple4(icons, `正解アイコンが ${GROUP_SIZE} 件になりません: ${set.id}`),
      set: set.label,
      setId: set.id,
    },
  };
};

export const dealAnswer = (
  mode: QuizMode,
  seed: string,
  n: number,
): { answerIndex: number; meta: AnswerMeta } => answerFor(deal(mode, seed, n));

export const dealPickQuestion = (mode: QuizMode, seed: string, n: number): PickClientQuestion => {
  const dealt = deal(mode, `pick:${seed}`, n);
  const choices = dealt.sets.map((setId, choiceIndex): PickChoiceSvgs => {
    const svgs = dealt.concepts.map((concept, iconIndex) =>
      normalize(variantFor(concept, setId), `選択肢${choiceIndex + 1}のアイコン${iconIndex + 1}`),
    );
    return tuple4(svgs, `選択肢の SVG が ${GROUP_SIZE} 件になりません: ${mode}:${seed}:${n}`);
  });
  return {
    choices: tuple4(choices, `選択肢が ${CHOICE_COUNT} 件になりません: ${mode}:${seed}:${n}`),
    setLabel: deck.sets[dealt.answerSet].label,
  };
};

export const dealPickAnswer = (
  mode: QuizMode,
  seed: string,
  n: number,
): { answerIndex: number; meta: AnswerMeta; choiceLabels: [string, string, string, string] } => {
  const dealt = deal(mode, `pick:${seed}`, n);
  const { answerIndex, meta } = answerFor(dealt);
  const choiceLabels = tuple4(
    dealt.sets.map((setId) => deck.sets[setId].label),
    `選択肢ラベルが ${CHOICE_COUNT} 件になりません: ${mode}:${seed}:${n}`,
  );
  return { answerIndex, choiceLabels, meta };
};
