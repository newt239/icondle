# Guess Icon 設計ドキュメント

> UI アイコンライブラリの識別クイズ Web アプリ
> 最終更新: 2026-07-16 / 数値はすべて実測値

---

## 1. プロダクト

### コンセプト

> **Guess Icon** — このアイコン、どのセットのやつ？

Lucide / Heroicons / Tabler / Phosphor / Bootstrap Icons / Feather のアイコンを提示し、どのセット由来かを 4 択で当てる。フロントエンド開発者・デザイナー向け。

**差別化は「解説」に置く。** 誤答時に、なぜそのセットなのかの根拠（グリッド、stroke-width、fill/stroke、セットの由来）を必ず提示する。既存のタイポグラフィ識別ゲーム（Typewar、I Shot the Serif）の最大の弱点がフィードバックの貧しさであり、解説が実務の目を養う価値そのものになる。

バイラルの型は Wordle 派生から借りる: デイリー 1 セット、seed 共有、統計。

### モード（スコープ）

| モード | 内容 | 状態 |
|---|---|---|
| **A. Set Guess** | アイコン 1 つ → 4 択でセット名。10 問 | ✅ 実装する |
| **D. Daily** | 日替わり seed の 5 問 + 共有 | ✅ 実装する |
| B. Odd One Out / C. Name Guess | — | ❌ スコープ外 |

---

## 2. 現在の実装状態

TanStack Start + HeroUI v3 + Tailwind CSS v4 + Vite 8 + Cloudflare Workers（wrangler / @cloudflare/vite-plugin）の最小構成が構築済み。トップページのみ存在し、ビルド・codecheck・ユニットテスト・E2E テストが通る。

- `src/routes/` — `__root.tsx`（HTML シェル）と `index.tsx`（トップページ）のみ
- `src/lib/prng.ts` — mulberry32 / hash 実装・テスト済み
- DB なし。状態は URL の search params に持つ（→ §5.1）
- **本番への初回デプロイは未実施**（`pnpm run deploy`）

---

## 3. 設計上の不変条件

AGENTS.md にも記載済み。実装全体を貫く制約。

**TanStack Start に RSC はない。** full-document SSR + hydration + server functions のみ。**loader の戻り値はクライアントに JSON としてシリアライズされ、Network タブに露出する。**

1. loader は「正規化済み SVG マークアップ + 選択肢ラベル」だけを返す。**正解（answerIndex / セット名）は返さない**
2. 判定は `createServerFn({ method: 'POST' })` 経由でのみ行う。seed と n から出題をサーバー側で再導出して照合する
3. `deck.ts` / `deal.server.ts` はサーバー専用。クライアントから import しない（副次効果として deck の gzip 78.5 KB がクライアントバンドルに入らない）
4. 出題 SVG は必ず `normalize()` を通す。**元の viewBox はセットを一意に特定する**（`256` なら ph、`16` なら bi）
5. 選択肢に body 衝突ペア（feather × lucide 等）を同居させない（→ §4.4）
6. server function はエラーをスローせず結果オブジェクトで返す（TanStack Start Issue #6381 対策）

---

## 4. データ層設計（未実装）

### 4.1 パッケージ選定

セット別の `@iconify-json/*` を使う（全部入りの `@iconify/json` は 437 MB のため不採用）。合計 ~9 MB、すべて `devDependencies`。ビルド後は不要。

| パッケージ | アイコン数 | サイズ | ライセンス (SPDX) |
|---|---|---|---|
| `@iconify-json/lucide` | 1807 | 570 KB | ISC |
| `@iconify-json/heroicons` | 1288 | 630 KB | MIT |
| `@iconify-json/feather` | 286 | 75 KB | MIT |
| `@iconify-json/tabler` | 6194 | 2.1 MB | MIT |
| `@iconify-json/ph` | 9161 | 4.6 MB | MIT |
| `@iconify-json/bi` | 2084 | 1.1 MB | MIT |

ライセンス情報は各パッケージの `info.json` に SPDX 付きで入っているため、帰属表示は自動生成できる。

> Font Awesome Free は CC-BY-4.0（帰属表示必須）のため初期スコープ外。Simple Icons はブランドロゴ集合であり採用しない。

### 4.2 スタイルフィルタ

同一セット内のスタイル混在を排除し、regular / outline のみに絞る。

```ts
const EXCLUDE: Record<SetId, RegExp> = {
  lucide:    /$^/,                             // 全て outline
  feather:   /$^/,                             // 全て outline
  heroicons: /(-solid|-16-solid|-20-solid)$/,  // 24 outline のみ残す
  tabler:    /-filled$/,
  ph:        /-(bold|duotone|fill|light|thin)$/, // regular のみ
  bi:        /-fill$/,
};
```

適用後の使用可能アイコン数: lucide 2023（aliases 含む）/ heroicons 327 / feather 286 / tabler 5289 / ph 1533 / bi 1419

### 4.3 概念の自動抽出

手書きの概念テーブルは不要。Iconify の `aliases` を展開したうえで名前の交差を取ると、機械的に出題プールが得られる。

```
6セットが共有:  42 概念
5セットが共有:  79 概念
4セットが共有: 116 概念
──────────────────────
出題可能(4セット以上): 237 概念 / 1111 アイコン
```

- 4 択なので全 6 セットに存在する必要はないが、**4 セット以上が絶対条件**（選択肢の 4 セットすべてがその概念を持つこと）。4 セット未満を使うと「この概念は tabler にしかない」というメタ推理で消去法が成立してしまう
- `aliases` の解決は全 1111 件成功（lucide の `home` → `house` のようなリネームも自動追従）

```ts
const resolve = (j: IconifyJSON, name: string) => {
  let n = name, guard = 0;
  while (j.aliases?.[n] && guard++ < 5) n = j.aliases[n].parent;
  return j.icons[n] ? { ...j.icons[n], resolved: n } : null;
};
```

> 名前一致は意味一致を保証しないが、モード A では造形の解釈違いこそがセットの個性なので問題ない。明らかに別物のものだけ目視レビューで `DENY` リストに落とす。矢印 8 種は退屈なので初期リリースでは除外推奨。

### 4.4 body 衝突の排除（必須）

**feather の 286 件中 72 件（25%）は lucide と SVG body が完全一致する**（lucide は feather のフォーク）。`arrow-right` を見せて「feather か lucide か」と聞くのは正解不能な問題であり、ビルド時に検出して排除する。

```ts
// scripts/build-deck.ts
const hash = (body: string) => sha1(body.replace(/\s+/g, " ").trim());

for (const concept of concepts) {
  const byHash = new Map<string, SetId[]>();
  for (const [setId, icon] of Object.entries(concept.variants))
    byHash.set(hash(icon.body), [...(byHash.get(hash(icon.body)) ?? []), setId]);

  // 同一 body を持つセット群 = 同時に選択肢へ出してはいけない
  concept.collisions = [...byHash.values()].filter((g) => g.length > 1);
}
```

出題時の制約: 選択肢は互いに衝突しないセットからのみ選ぶ。衝突ペアを除いて 4 セット確保できない概念は、その難易度では出題しない。

### 4.5 セット特性（解説・難易度の根拠データ）

| セット | グリッド | stroke-width | cap | 塗り | 難度 |
|---|---|---|---|---|---|
| **lucide** | 24 | 2 | round | stroke | ★★★★★ |
| **feather** | 24 | 2 | round | stroke | ★★★★★ |
| **tabler** | 24 | 2 | round | stroke | ★★★★★ |
| **heroicons** | 24 | 1.5 | round | stroke | ★★★ |
| **ph** | **256** | — | — | **fill** | ★★ |
| **bi** | **16** | — | — | **fill** | ★ |

重要な帰結が 2 つある。

1. **lucide / feather / tabler はメタ属性が完全に同一。** 判別できるのは造形だけであり、解説パネルで「stroke-width が違います」とは言えない。この 3 つの解説には由来と設計思想のテキストが要る（feather は 286 アイコンの原典、lucide はそのフォークで 1807 まで拡張、tabler は独自系統で 5289）
2. **viewBox はセットを一意に特定する。** サーバー側で viewBox を隠蔽しなければクイズが成立しない（→ §5.3）

難易度定義:

- **Easy** — fill 系（ph / bi）を 1 つ以上混ぜる。一目瞭然
- **Hard** — outline 系のみ（lucide / feather / tabler / heroicons）。造形のみで判別

### 4.6 成果物

```
scripts/build-deck.ts     # 事前実行、成果物をコミット
  ↓
src/data/deck.ts          # export const deck = [...] as const
                          # 237 概念 / 1111 アイコン / 371 KB (gzip 78.5 KB)
```

サーバー専用モジュールからのみ import する。TS リテラルで持って型で守る。

---

## 5. アーキテクチャ設計（未実装）

### 5.1 URL 設計 — 状態は search params に持つ

サーバーには何も保存しない。TanStack Router の `validateSearch` が search params を型付きデータとして扱う。

```
/play/a7f3c2/1
/play/a7f3c2/2?a=2
/play/a7f3c2/3?a=21
/play/a7f3c2/result?a=2143012310
```

```ts
// src/routes/play.$seed.$n.tsx
const searchSchema = z.object({
  a: z.string().regex(/^[0-3]*$/).default(""),   // 回答履歴
  d: z.enum(["easy", "hard"]).default("easy"),
});

export const Route = createFileRoute("/play/$seed/$n")({
  validateSearch: zodValidator(searchSchema),
  params: {
    parse: (p) => ({ seed: p.seed, n: z.coerce.number().min(1).max(10).parse(p.n) }),
    stringify: (p) => ({ seed: p.seed, n: String(p.n) }),
  },
  loaderDeps: ({ search }) => ({ d: search.d }),
  loader: ({ params, deps }) => dealQuestion(params.seed, params.n, deps.d),
  component: QuestionPage,
});
```

利点: サーバー完全ステートレス・Cookie ゼロ、ブラウザバックが正しく動く、URL 共有で途中経過ごと渡せる。改竄可能だがランキングがないので実害ゼロ。

ルート構成:

```
src/routes/
├── index.tsx                 /                    ← prerender
├── play.tsx                  /play                → seed 生成して 302
├── play.$seed.$n.tsx         /play/:seed/:n
├── play.$seed.result.tsx     /play/:seed/result
├── daily.tsx                 /daily               → /daily/:date へ 302 (JST)
├── daily.$date.$n.tsx
└── daily.$date.result.tsx
```

### 5.2 出題（サーバー専用）

```ts
// src/lib/deal.server.ts
import { deck } from "#/data/deck";
import { hash, mulberry32 } from "#/lib/prng";

export function dealQuestion(seed: string, n: number, d: Difficulty): ClientQuestion {
  const rng = mulberry32(hash(`${seed}:${n}:${d}`));
  const { concept, sets } = pickConcept(rng, d);      // 衝突ペアを除外済み
  const answer = sets[Math.floor(rng() * sets.length)];
  return {
    svg: normalize(concept.variants[answer]),         // viewBox を隠蔽
    choices: shuffle(rng, sets).map(SET_LABEL),
  };                                                   // ← answerIndex は返さない
}

export function dealAnswer(seed: string, n: number, d: Difficulty) {
  // 同じ入力から同じ出題を再導出する。だから何も保存しなくていい
}
```

### 5.3 SVG 正規化

viewBox がセットを一意に特定するため、必ず包み直す。

```ts
// src/lib/render-icon.server.ts
export function normalize(icon: { body: string; w: number; h: number }) {
  return `<svg viewBox="0 0 100 100" role="img" aria-label="出題中のアイコン">
    <g transform="scale(${100 / icon.h})">${icon.body}</g>
  </svg>`;
}
```

- **正規化する**: 色（`currentColor`）、表示サイズ、viewBox、背景
- **正規化しない**: `stroke-width`、`stroke-linecap`、fill/stroke の別 ← セットの個性そのもの
- `<img src="data:image/svg+xml,...">` は使わない（元の viewBox が漏れる）

### 5.4 判定

```ts
// src/lib/grade.ts
export const gradeAnswer = createServerFn({ method: "POST" })
  .validator(z.object({
    seed: z.string(), n: z.number(), d: difficultySchema, answer: z.number(),
  }))
  .handler(async ({ data }) => {
    const { answerIndex, meta } = dealAnswer(data.seed, data.n, data.d);
    return {
      correct: answerIndex === data.answer,
      answerIndex,
      meta,  // { set, icon, grid, strokeWidth, cap, filled, license, origin }
    };
  });
```

`meta` がそのまま解説パネルの中身になる。エラーはスローせず結果オブジェクトで返す（§3-6）。

### 5.5 キャッシュと prerender

- `/play/:seed/:n` は seed が同じなら永久に同じ問題（クイズ大会で全員に同じ seed を配る運用が成立する）
- ただし `?a=` が付くとキャッシュキーが割れるため、**プレイ中の SSR HTML はキャッシュしない**（`private, no-store`）
- **prerender は `/` のみ**。ビルド時データとリクエスト時データの境界を明示的に引く
- **デイリーの日付は JST 固定**。Workers の TZ は UTC なので `Intl.DateTimeFormat` で `Asia/Tokyo` を明示する

---

## 6. UI（HeroUI v3）

セットアップは完了済み（`src/styles.css` で `@import "@heroui/styles"`）。コンポーネント割り当て:

| 用途 | v3 コンポーネント | 備考 |
|---|---|---|
| 選択肢 | `button` または `toggle-button-group` | |
| ショートカット表示 | `kbd` | `1`〜`4` |
| 出題カード | `card` / `surface` | |
| 進捗 | `progress-bar` | `aria-label` 必須 |
| セット名・ライセンス | `chip` / `tag` | |
| 難易度切替 | `tabs` | |
| ヘルプ | `modal` | |
| 結果なし状態 | `empty-state` | |
| 見出し・本文 | `typography` / `header` | |
| 解説の補足文 | `description` | |

注意:

- **`Snippet` は v3 に存在しない。** 共有テキストのコピーは `button` + `navigator.clipboard.writeText()` を自前で実装する（`aria-live="polite"` でコピー完了を告知）
- **`toast` で正誤フィードバックを出さない。** 解説パネルを出題カード直下に出し、`role="status"` で告知する
- HeroUI に無いものは `@heroui/react` の `rac` サブパスから React Aria Components を直接使える
- v3 は ESM only。`prefers-reduced-motion` は `@heroui/styles` が CSS で対応済みのため追加対応不要

---

## 7. アクセシビリティ

視覚的識別がゲームの本質なので、全盲ユーザーには成立しないという前提を逃げずに設計に織り込む。

| 項目 | 方針 |
|---|---|
| **出題中の SVG** | `role="img" aria-label="出題中のアイコン"`（情報等価にすると答えが漏れる）。**解答後に server function が返した `meta` で差し替え**、`"Lucide の house アイコン"` にする。WCAG 1.1.1 のテスト例外に該当するが、解答後の情報等価は担保する |
| **タイマー** | **既定オフ**（WCAG 2.2.1）。タイムアタックは opt-in、延長・解除可能に |
| **正誤の伝達** | 色のみに依存しない（1.4.1）。アイコン + テキスト + `role="status"` |
| **`forced-colors`** | 出題 SVG は `currentColor` 統一なので保たれる。HeroUI の選択状態は背景色依存なので `forced-colors: active` で `outline` 併用 |
| **フォーカス管理** | 解答 → 解説見出しへ `tabindex="-1"` + `.focus()` |
| **JS なし** | hydration 前のクリックを取りこぼさないよう `<form>` として成立させる |
| **キーボード** | `1`〜`4` キー。`aria-keyshortcuts` で告知 |
| **ライセンス表示** | 各セットのライセンスを解説パネルと footer に。`info.json` から自動生成 |

---

## 8. 今後のタスク（実装順）

1. **本番への初回デプロイ** — `wrangler login` 後に `pnpm run deploy`。空アプリの時点で本番パイプラインを確立する
2. **`scripts/build-deck.ts` → `src/data/deck.ts`** — `@iconify-json/*` 6 パッケージを devDependencies に追加。スタイルフィルタ・概念抽出・body 衝突検出・`DENY` リスト適用・ライセンス情報の抽出（→ §4、付録）
3. **`deal.server.ts` + Vitest** — 全部純関数なので `vi.fn()` 不要。守る不変条件:
   - 同一 seed は同一出題を返す
   - 選択肢に重複がない
   - 正解が必ず選択肢に含まれる
   - 選択肢の全セットがその概念を持つ（消去法が成立しない）
   - **選択肢に body 衝突ペアが同居しない（最重要）**
   - `normalize()` の出力に元の viewBox が残っていない
   - Easy は fill 系を 1 つ以上含む / Hard は outline 系のみ
4. **`/play/$seed/$n` の SSR + `gradeAnswer`** — ルート群・searchSchema・解説パネル（→ §5）。zod を dependencies へ追加
5. **HeroUI v3 適用** — 選択肢・進捗・kbd・解説パネルのスタイリング（→ §6）
6. **`/daily/$date`** — JST 固定の日替わり seed
7. **結果画面 + 共有** — クリップボードコピーは自前実装
8. **概念の目視レビュー** — 237 概念から `DENY` リストで削る。矢印 8 種は初期除外

---

## 9. 残リスク

| リスク | 度合い | 対応 |
|---|---|---|
| 概念 237 のうち、名前は同じでも意味が違うものが混ざる | 中 | 目視レビュー + `DENY` リスト |
| lucide / feather / tabler が難しすぎて理不尽に感じる | 中 | Hard 限定にする。Easy は fill 系を必ず混ぜる。解説で由来を説明する |
| body 完全一致以外の「ほぼ同一」（1 パス違いなど）の存在 | 低 | ハッシュでは拾えない。プレイして気づいたら `DENY` へ |
| TanStack Start の server function エラー処理（#6381） | 低 | 結果オブジェクト返しで回避（§3-6） |
| HeroUI v3 のコンポーネント不足（Snippet 等） | 低 | `rac` サブパスから React Aria Components を直接使う |

---

## 付録: 検証済みビルドスクリプト（骨格）

```ts
// scripts/build-deck.ts
import lucide from "@iconify-json/lucide/icons.json" with { type: "json" };
import heroicons from "@iconify-json/heroicons/icons.json" with { type: "json" };
import feather from "@iconify-json/feather/icons.json" with { type: "json" };
import tabler from "@iconify-json/tabler/icons.json" with { type: "json" };
import ph from "@iconify-json/ph/icons.json" with { type: "json" };
import bi from "@iconify-json/bi/icons.json" with { type: "json" };

const sets = { lucide, heroicons, feather, tabler, ph, bi };
const EXCLUDE = {
  lucide: /$^/, feather: /$^/,
  heroicons: /(-solid|-16-solid|-20-solid)$/,
  tabler: /-filled$/,
  ph: /-(bold|duotone|fill|light|thin)$/,
  bi: /-fill$/,
};

const resolve = (j, name) => {
  let n = name, guard = 0;
  while (j.aliases?.[n] && guard++ < 5) n = j.aliases[n].parent;
  return j.icons[n] ? { ...j.icons[n], resolved: n } : null;
};

// 1. スタイルフィルタ適用後の名前空間
const names = {};
for (const [id, j] of Object.entries(sets))
  names[id] = new Set(
    [...Object.keys(j.icons), ...Object.keys(j.aliases ?? {})]
      .filter((n) => !EXCLUDE[id].test(n)),
  );

// 2. 4セット以上が共有する概念のみ採用 → 237 概念
const count = new Map();
for (const id of Object.keys(sets))
  for (const n of names[id]) count.set(n, (count.get(n) ?? []).concat(id));
const concepts = [...count].filter(([, owners]) => owners.length >= 4);

// 3. body 解決 + 衝突検出 + DENY 適用 → deck.ts へ出力
```

実行結果（実測）:

```
概念=237  アイコン総数=1111  解決失敗=0
raw=371.3KB  gzip=78.5KB
1アイコン平均 body=342B
```
