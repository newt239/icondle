import "@tanstack/react-start/server-only";
import { deck, type SetId } from "#/data/deck";

import type { SetOverview } from "#/lib/quiz-types";

const SAMPLE_COUNT = 6;

const sampleVariants = (setId: SetId): { name: string; svg: string }[] => {
  const owned = deck.concepts.flatMap((concept) => {
    const variant = concept.variants[setId];
    return variant === undefined ? [] : [variant];
  });
  const picked = new Map<string, { name: string; svg: string }>();
  while (picked.size < SAMPLE_COUNT && picked.size < owned.length) {
    const variant = owned[Math.floor(Math.random() * owned.length)];
    if (variant !== undefined && !picked.has(variant.name)) {
      picked.set(variant.name, {
        name: variant.name,
        svg: `<svg viewBox="0 0 ${variant.width} ${variant.height}" role="img" aria-label="${variant.name}">${variant.body}</svg>`,
      });
    }
  }
  return [...picked.values()];
};

export const buildSetsOverview = (): SetOverview[] =>
  Object.values(deck.sets)
    .toSorted((a, b) => b.iconCount - a.iconCount)
    .map((set) => ({
      grid: set.grid,
      iconCount: set.iconCount,
      id: set.id,
      label: set.label,
      license: set.license,
      samples: sampleVariants(set.id),
    }));
