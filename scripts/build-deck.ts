import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import type { IconifyInfo, IconifyJSON } from "@iconify/types";

type Candidate = {
  id: string;
  include?: RegExp;
  exclude?: RegExp;
  strip?: RegExp;
};

const CANDIDATES: Candidate[] = [
  { id: "fa6-solid" },
  { id: "fluent", include: /-24-regular$/, strip: /-24-regular$/ },
  { id: "material-symbols", include: /-outline$/, strip: /-outline$/ },
  { exclude: /-(?:bold|duotone|fill|light|thin)$/, id: "ph" },
  { exclude: /-outline$/, id: "mdi" },
  { exclude: /-filled$/, id: "tabler" },
  { id: "hugeicons", strip: /-0\d$/ },
  { exclude: /-filled$/, id: "boxicons" },
  { exclude: /-(?:bold|duo|outline)$/, id: "glyphs" },
  { id: "mingcute", include: /-line$/, strip: /-line$/ },
  { exclude: /-fill$/, id: "ri", strip: /-line$/ },
  { id: "icon-park-outline" },
  { exclude: /-solid$/, id: "mynaui" },
  { exclude: /-(?:filled|solid)$/, id: "carbon" },
  { exclude: /-filled$/, id: "tdesign" },
  { exclude: /-fill$/, id: "bi" },
  { id: "lucide" },
  { exclude: /-solid$/, id: "iconoir" },
  { exclude: /-solid$/, id: "heroicons" },
];

const ADOPT_COUNT = 14;
const MIN_ADOPT_COUNT = 12;
const MIN_SHARED_SETS = 4;
const CHOICE_COUNT = 4;
const MIN_EASY_POOL = 50;

const EASY_IDS = ["fluent", "material-symbols", "tabler", "lucide", "heroicons", "fa6-solid"];

const DENY = new Set([
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up-left",
  "arrow-up-right",
  "arrow-down-left",
  "arrow-down-right",
]);

type ResolvedIcon = {
  raw: string;
  concept: string;
  body: string;
  width: number;
  height: number;
  isAlias: boolean;
};

const readJson = (specifier: string): unknown => {
  const filePath = fileURLToPath(import.meta.resolve(specifier));
  return JSON.parse(readFileSync(filePath, "utf8"));
};

// 外部パッケージの JSON を @iconify/types の公開型として扱うための境界アサーション
const loadIcons = (id: string) => readJson(`@iconify-json/${id}/icons.json`) as IconifyJSON;

// 外部パッケージの JSON を @iconify/types の公開型として扱うための境界アサーション
const loadInfo = (id: string) => readJson(`@iconify-json/${id}/info.json`) as IconifyInfo;

const loadVersion = (id: string): string => {
  // パッケージメタデータの version フィールドのみを読むための境界アサーション
  const pkg = readJson(`@iconify-json/${id}/package.json`) as { version: string };
  return pkg.version;
};

const resolveAlias = (j: IconifyJSON, name: string): string | null => {
  let current = name;
  let guard = 0;
  while (guard < 5) {
    const alias = j.aliases?.[current];
    if (!alias) {
      break;
    }
    if (alias.hFlip !== undefined || alias.vFlip !== undefined || alias.rotate !== undefined) {
      return null;
    }
    current = alias.parent;
    guard += 1;
  }
  return j.icons[current] ? current : null;
};

const buildNamespace = (candidate: Candidate, j: IconifyJSON): Map<string, ResolvedIcon> => {
  const passes = (name: string) =>
    (!candidate.include || candidate.include.test(name)) &&
    (!candidate.exclude || !candidate.exclude.test(name));
  const conceptOf = (name: string) => (candidate.strip ? name.replace(candidate.strip, "") : name);

  const entries: ResolvedIcon[] = [];
  const push = (raw: string, resolved: string, isAlias: boolean) => {
    const icon = j.icons[resolved];
    if (!icon || icon.hidden) {
      return;
    }
    entries.push({
      body: icon.body,
      concept: conceptOf(raw),
      height: icon.height ?? j.height ?? 16,
      isAlias,
      raw,
      width: icon.width ?? j.width ?? 16,
    });
  };

  for (const name of Object.keys(j.icons)) {
    if (passes(name)) {
      push(name, name, false);
    }
  }
  for (const name of Object.keys(j.aliases ?? {})) {
    if (!passes(name) || j.icons[name]) {
      continue;
    }
    const resolved = resolveAlias(j, name);
    if (resolved) {
      push(name, resolved, true);
    }
  }

  entries.sort((a, b) => {
    const exactA = a.raw === a.concept ? 0 : 1;
    const exactB = b.raw === b.concept ? 0 : 1;
    if (exactA !== exactB) {
      return exactA - exactB;
    }
    if (a.isAlias !== b.isAlias) {
      return a.isAlias ? 1 : -1;
    }
    return a.raw < b.raw ? -1 : 1;
  });

  const byConcept = new Map<string, ResolvedIcon>();
  for (const entry of entries) {
    if (!byConcept.has(entry.concept)) {
      byConcept.set(entry.concept, entry);
    }
  }
  return byConcept;
};

const hashBody = (body: string): string =>
  createHash("sha1").update(body.replaceAll(/\s+/g, " ").trim()).digest("hex");

const mode = (values: (string | number)[]): string | number | null => {
  const counts = new Map<string | number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best: string | number | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
};

const loaded = CANDIDATES.map((candidate) => {
  const icons = loadIcons(candidate.id);
  return {
    candidate,
    info: loadInfo(candidate.id),
    namespace: buildNamespace(candidate, icons),
    version: loadVersion(candidate.id),
  };
});

loaded.sort((a, b) => b.namespace.size - a.namespace.size);

console.warn("候補セットのフィルタ適用後の概念数:");
for (const { candidate, namespace } of loaded) {
  console.warn(`  ${candidate.id.padEnd(20)} ${String(namespace.size).padStart(6)}`);
}

const forced = loaded.filter(({ candidate }) => EASY_IDS.includes(candidate.id));
if (forced.length !== EASY_IDS.length) {
  const missing = EASY_IDS.filter((id) => !forced.some(({ candidate }) => candidate.id === id));
  throw new Error(`easy セットが候補に揃っていません: ${missing.join(", ")}`);
}
const rest = loaded
  .filter(({ candidate }) => !EASY_IDS.includes(candidate.id))
  .slice(0, ADOPT_COUNT - forced.length);
const adopted = [...forced, ...rest].toSorted((a, b) => b.namespace.size - a.namespace.size);
if (adopted.length < MIN_ADOPT_COUNT) {
  throw new Error(`採用セットが ${MIN_ADOPT_COUNT} 未満です: ${adopted.length}`);
}
console.warn(`採用: ${adopted.map(({ candidate }) => candidate.id).join(", ")}`);

const conceptOwners = new Map<string, string[]>();
for (const { candidate, namespace } of adopted) {
  for (const concept of namespace.keys()) {
    const owners = conceptOwners.get(concept) ?? [];
    owners.push(candidate.id);
    conceptOwners.set(concept, owners);
  }
}

const sharedConcepts = [...conceptOwners.entries()]
  .filter(([concept, owners]) => owners.length >= MIN_SHARED_SETS && !DENY.has(concept))
  .map(([concept]) => concept)
  .toSorted();

console.warn(`概念数: ${sharedConcepts.length}`);

type ConceptOut = {
  name: string;
  variants: Record<string, { name: string; body: string; width: number; height: number }>;
  collisions: string[][];
};

const concepts: ConceptOut[] = sharedConcepts.map((concept) => {
  const variants: ConceptOut["variants"] = {};
  const byHash = new Map<string, string[]>();
  for (const { candidate, namespace } of adopted) {
    const icon = namespace.get(concept);
    if (!icon) {
      continue;
    }
    variants[candidate.id] = {
      body: icon.body,
      height: icon.height,
      name: icon.raw,
      width: icon.width,
    };
    const key = hashBody(icon.body);
    byHash.set(key, [...(byHash.get(key) ?? []), candidate.id]);
  }
  const collisions = [...byHash.values()].filter((group) => group.length > 1);
  return { collisions, name: concept, variants };
});

const collisionCount = concepts.filter((concept) => concept.collisions.length > 0).length;
console.warn(`body 衝突を含む概念数: ${collisionCount}`);

const distinctOwnerCount = (owners: string[], collisions: string[][]): number => {
  const grouped = new Set<string>();
  let distinct = 0;
  for (const group of collisions) {
    const members = group.filter((id) => owners.includes(id));
    for (const member of members) {
      grouped.add(member);
    }
    if (members.length > 0) {
      distinct += 1;
    }
  }
  return distinct + owners.filter((id) => !grouped.has(id)).length;
};

const easyPoolCount = concepts.filter((concept) => {
  const owners = EASY_IDS.filter((id) => concept.variants[id]);
  return distinctOwnerCount(owners, concept.collisions) >= CHOICE_COUNT;
}).length;
console.warn(`easy モードで出題可能な概念数: ${easyPoolCount}`);
if (easyPoolCount < MIN_EASY_POOL) {
  throw new Error(`easy モードの出題可能概念数が ${MIN_EASY_POOL} 未満です: ${easyPoolCount}`);
}

type SetMetaOut = {
  id: string;
  label: string;
  grid: number;
  strokeWidth: number | null;
  cap: string | null;
  license: { spdx: string; title: string; url: string };
  version: string;
  iconCount: number;
};

const sets: Record<string, SetMetaOut> = {};
for (const { candidate, info, namespace, version } of adopted) {
  const bodies: string[] = [];
  const heights: number[] = [];
  for (const concept of concepts) {
    const variant = concept.variants[candidate.id];
    if (variant) {
      bodies.push(variant.body);
      heights.push(variant.height);
    }
  }
  const strokeCount = bodies.filter((body) => body.includes("stroke=")).length;
  const style = strokeCount / bodies.length > 0.5 ? "stroke" : "fill";
  const strokeWidths = bodies.flatMap((body) => {
    const width = /stroke-width="(?<width>[\d.]+)"/.exec(body)?.groups?.width;
    return width === undefined ? [] : [Number(width)];
  });
  const caps = bodies.flatMap((body) => {
    const cap = /stroke-linecap="(?<cap>[a-z]+)"/.exec(body)?.groups?.cap;
    return cap === undefined ? [] : [cap];
  });
  const gridMode = mode(heights);
  const strokeWidthMode = style === "stroke" ? mode(strokeWidths) : null;
  const capMode = style === "stroke" ? mode(caps) : null;
  sets[candidate.id] = {
    cap: typeof capMode === "string" ? capMode : null,
    grid: typeof info.height === "number" ? info.height : Number(gridMode ?? 16),
    iconCount: namespace.size,
    id: candidate.id,
    label: info.name,
    license: {
      spdx: info.license.spdx ?? "",
      title: info.license.title,
      url: info.license.url ?? "",
    },
    strokeWidth: typeof strokeWidthMode === "number" ? strokeWidthMode : null,
    version,
  };
}

const packages: Record<string, string> = {};
for (const { candidate, version } of adopted) {
  packages[candidate.id] = version;
}

const deck = {
  concepts,
  generatedAt: new Date().toISOString(),
  packages,
  sets,
};

const setIdUnion = adopted.map(({ candidate }) => JSON.stringify(candidate.id)).join(" | ");

const source = `// 自動生成ファイル。編集禁止。再生成は pnpm run build-deck を実行する。
export type SetId = ${setIdUnion};

export type SetMeta = {
  id: SetId;
  label: string;
  grid: number;
  strokeWidth: number | null;
  cap: string | null;
  license: { spdx: string; title: string; url: string };
  version: string;
  iconCount: number;
};

export type IconVariant = {
  name: string;
  body: string;
  width: number;
  height: number;
};

export type Concept = {
  name: string;
  variants: Partial<Record<SetId, IconVariant>>;
  collisions: SetId[][];
};

export type Deck = {
  generatedAt: string;
  packages: Record<SetId, string>;
  sets: Record<SetId, SetMeta>;
  concepts: Concept[];
};

export const deck: Deck = ${JSON.stringify(deck, null, 1)};
`;

const outUrl = new URL("../src/data/deck.ts", import.meta.url);
mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(outUrl, source);

const gzipped = gzipSync(Buffer.from(source));
console.warn(
  `deck.ts: raw ${(source.length / 1024).toFixed(1)} KB / gzip ${(gzipped.length / 1024).toFixed(1)} KB`,
);
