import { describe, expect, it } from "vitest";

import { deck } from "#/data/deck";

import { createSetsOverview } from "./sets.server";

describe("createSetsOverview", () => {
  it("採用セット全件を返しアイコン数を持つ", () => {
    const overviews = createSetsOverview();
    expect(overviews).toHaveLength(Object.keys(deck.sets).length);
    for (const overview of overviews) {
      expect(Object.keys(deck.sets)).toContain(overview.id);
      expect(overview.iconCount).toBeGreaterThan(0);
    }
  });

  it("各セットのサンプル SVG がアイコン名のラベルを持ち重複しない", () => {
    for (const overview of createSetsOverview()) {
      expect(overview.samples.length).toBeGreaterThan(0);
      const names = overview.samples.map((sample) => sample.name);
      expect(new Set(names).size).toBe(names.length);
      for (const sample of overview.samples) {
        expect(sample.svg).toContain('viewBox="0 0 ');
        expect(sample.svg).toContain(`aria-label="${sample.name}"`);
      }
    }
  });
});
