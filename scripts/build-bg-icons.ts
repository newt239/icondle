import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { IconifyJSON } from "@iconify/types";

const SEED = "icondle-bg-v1";
const CELL = 40;
const COLS = 12;
const ROWS = 12;
const ICON_SIZE = 21;

const readJson = (specifier: string): unknown => {
  const filePath = fileURLToPath(import.meta.resolve(specifier));
  return JSON.parse(readFileSync(filePath, "utf8"));
};

// 外部パッケージの JSON を @iconify/types の公開型として扱うための境界アサーション
const lucide = readJson("@iconify-json/lucide/icons.json") as IconifyJSON;

const rank = (name: string) => createHash("sha256").update(`${SEED}:${name}`).digest("hex");

const picked = Object.entries(lucide.icons)
  .filter(
    ([, icon]) =>
      icon.hidden === undefined &&
      icon.width === undefined &&
      icon.height === undefined &&
      icon.left === undefined &&
      icon.top === undefined &&
      icon.rotate === undefined &&
      icon.hFlip === undefined &&
      icon.vFlip === undefined,
  )
  .map(([name, icon]) => ({ body: icon.body, rank: rank(name) }))
  .toSorted((a, b) => (a.rank < b.rank ? -1 : 1))
  .slice(0, COLS * ROWS);

if (picked.length < COLS * ROWS) {
  throw new Error(`アイコンが不足しています: ${picked.length}/${COLS * ROWS}`);
}

const scale = ICON_SIZE / 24;
const pad = (CELL - ICON_SIZE) / 2;

const cells = picked.map(({ body }, i) => {
  const x = (i % COLS) * CELL + pad;
  const y = Math.floor(i / COLS) * CELL + pad;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
});

const size = { height: ROWS * CELL, width: COLS * CELL };
const svg = `<!-- 自動生成ファイル。編集禁止。再生成は pnpm run build-bg-icons を実行する。 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}">${cells.join("")}</svg>
`;

writeFileSync(fileURLToPath(new URL("../public/bg-icons.svg", import.meta.url)), svg);
console.warn(
  `public/bg-icons.svg を生成しました（${picked.length} アイコン、${size.width}x${size.height}）`,
);
