import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { IconifyJSON } from "@iconify/types";

const SEED = "icondle-bg-v1";
const CELL = 40;
const COLS = 12;
const ROWS = 12;
const ICON_SIZE = 21;
const TOTAL = COLS * ROWS;

const SET_IDS = [
  "bi",
  "boxicons",
  "carbon",
  "fa6-regular",
  "fluent",
  "heroicons",
  "hugeicons",
  "icon-park-outline",
  "iconoir",
  "lucide",
  "material-symbols",
  "mingcute",
  "ri",
  "tabler",
] as const;

const readJson = (specifier: string): unknown => {
  const filePath = fileURLToPath(import.meta.resolve(specifier));
  return JSON.parse(readFileSync(filePath, "utf8"));
};

const rank = (input: string) => createHash("sha256").update(input).digest("hex");

type Candidate = {
  setId: string;
  name: string;
  body: string;
  width: number;
  height: number;
};

const queues = new Map<string, Candidate[]>();

for (const setId of SET_IDS) {
  // 外部パッケージの JSON を @iconify/types の公開型として扱うための境界アサーション
  const data = readJson(`@iconify-json/${setId}/icons.json`) as IconifyJSON;
  const rootWidth = data.width ?? 16;
  const rootHeight = data.height ?? 16;
  const queue = Object.entries(data.icons)
    .filter(
      ([, icon]) =>
        icon.hidden === undefined &&
        icon.left === undefined &&
        icon.top === undefined &&
        icon.rotate === undefined &&
        icon.hFlip === undefined &&
        icon.vFlip === undefined,
    )
    .map(([name, icon]) => ({
      body: icon.body,
      height: icon.height ?? rootHeight,
      name,
      setId,
      width: icon.width ?? rootWidth,
    }))
    .toSorted((a, b) => {
      const rankA = rank(`${SEED}:${a.setId}:${a.name}`);
      const rankB = rank(`${SEED}:${b.setId}:${b.name}`);
      return rankA < rankB ? -1 : 1;
    });
  queues.set(setId, queue);
}

const cursors = new Map(SET_IDS.map((setId) => [setId, 0]));
const picked: Candidate[] = [];

while (picked.length < TOTAL) {
  for (const setId of SET_IDS) {
    if (picked.length >= TOTAL) {
      break;
    }
    const cursor = cursors.get(setId) ?? 0;
    const candidate = queues.get(setId)?.[cursor];
    if (candidate === undefined) {
      throw new Error(`アイコンが不足しています: ${setId}`);
    }
    picked.push(candidate);
    cursors.set(setId, cursor + 1);
  }
}

const shuffled = picked
  .map((candidate) => ({
    candidate,
    shuffleRank: rank(`${SEED}:cell:${candidate.setId}:${candidate.name}`),
  }))
  .toSorted((a, b) => (a.shuffleRank < b.shuffleRank ? -1 : 1))
  .map(({ candidate }) => candidate);

const cellPad = (CELL - ICON_SIZE) / 2;

const cells = shuffled.map((candidate, i) => {
  const scale = ICON_SIZE / Math.max(candidate.width, candidate.height);
  const x = (i % COLS) * CELL + cellPad + (ICON_SIZE - candidate.width * scale) / 2;
  const y = Math.floor(i / COLS) * CELL + cellPad + (ICON_SIZE - candidate.height * scale) / 2;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${candidate.body}</g>`;
});

const size = { height: ROWS * CELL, width: COLS * CELL };
const svg = `<!-- 自動生成ファイル。編集禁止。再生成は pnpm run build-bg-icons を実行する。 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">${cells.join("")}</svg>
`;

writeFileSync(fileURLToPath(new URL("../public/bg-icons.svg", import.meta.url)), svg);
console.warn(
  `public/bg-icons.svg を生成しました（${shuffled.length} アイコン、${SET_IDS.length} セット、${size.width}x${size.height}）`,
);
