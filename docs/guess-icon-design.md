# Iconoclast 設計ドキュメント

> UI アイコンライブラリの識別クイズ Web アプリ
> 調査日: 2026-07-15 / バージョン・サイズはすべて実測値

---

## 0. 調査サマリ

### 不確定要素の決着

| 項目 | 結論 | 根拠 |
|---|---|---|
| HeroUI v3 の正式リリース | ✅ **問題なし**。`@heroui/react@3.2.2` が latest | npm registry 実測 |
| HeroUI v3 × Tailwind v4 | ✅ **問題なし**。Tailwind v4 は peer dependency（`tailwindcss: ">=4.0.0"`）で、**v4 が前提**。v2 時代の `tailwind.config.js` + `heroui()` plugin + `@config` ディレクティブは**不要** | peerDependencies 実測 |
| HeroUI v3 × SSR | ✅ **問題なし**。`@react-aria/ssr` を同梱 | dependencies 実測 |
| TanStack Start のバージョン要件 | ✅ **問題なし**。latest は `1.168.28`。Cloudflare の要件（v1.138.0 以降）を満たす | npm registry 実測 |
| TanStack Start × Vite 8 | ✅ **問題なし**。peer は `vite: ">=7.0.0"`、Vite の latest は `8.1.4` | peerDependencies 実測 |
| Cloudflare Vite plugin | ✅ **問題なし**。`@cloudflare/vite-plugin@1.45.0` は `vite: ^6 \|\| ^7 \|\| ^8`、peer に `wrangler: ^4.111.0`（wrangler の latest と一致） | peerDependencies 実測 |
| `@iconify/json` の採用 | ❌ **不採用**。unpackedSize が **437 MB** | npm registry 実測 |
| 概念テーブルの手書き | ❌ **不要**。名前の交差だけで **237 概念**が自動抽出できる | 実データで検証 |
| deck のサイズ | 371 KB / **gzip 78.5 KB**（1111 アイコン） | 実測 |

### これまでの設計からの訂正

実測の結果、以下は誤りだったので撤回します。

| 撤回する記述 | 実際 |
|---|---|
| 「Hero UI は Framer Motion 依存が入る」 | **v3 に framer-motion 依存はありません**。依存は React Aria 系 + `tailwind-variants` + `tailwind-merge` + `@heroui/styles` のみ |
| 「`prefers-reduced-motion` を明示的に切る必要がある」 | **不要**。`@heroui/styles` の CSS に `motion-reduce:transition-none` が組み込み済み |
| 「`@config` ディレクティブで tailwind.config.js を読ませる（行頭空白に注意）」 | v2 の話。**v3 は `@heroui/react/styles` を CSS から import するだけ** |
| 「共有テキストは `Snippet` でコピーボタン内蔵」 | **v3 に `Snippet` は存在しません**（後述の代替へ） |
| 「進捗は `Progress`」 | v3 では `progress-bar` / `progress-circle` に分割 |
| 「`@iconify/json` から抽出」 | 437 MB。**セット別の `@iconify-json/*` を使う**（合計 ~9 MB） |
| 「6セット × 60概念、gzip 40KB」 | **237 概念 / 1111 アイコン / gzip 78.5 KB** |
| 「エイリアス辞書を手書き（100概念程度）」 | Iconify の `aliases` フィールドで自動解決可能。**解決失敗 0 件** |

### 新たに判明した重大な設計制約

**feather の 286 アイコンのうち 72 件（25%）は、lucide と SVG body が完全一致します。**

```
feather 286件中: lucide と body 完全一致=72  差異あり=213  lucide に無い=1
完全一致の例: alert-circle, aperture, arrow-down, arrow-down-left,
             arrow-down-right, arrow-left-circle, arrow-right, arrow-right-circle
```

lucide は feather のフォークなので当然ですが、**これは「正解が存在しない問題」を生みます**。`arrow-right` を見せて「feather か lucide か」と聞くのは不正な出題です。ビルド時に検出して排除する必要があります（→ §3.5）。

---

## 1. プロダクト

### コンセプト

> **Iconoclast** — このアイコン、どのセットのやつ？

Lucide / Heroicons / Tabler / Phosphor / Bootstrap Icons / Feather のアイコンを提示し、どのセット由来かを 4 択で当てる。フロントエンド開発者・デザイナー向け。

### 競合と差別化

直接競合はほぼ存在しません。既存の「アイコンクイズ」は例外なくブランドロゴ当て（Guess the Icon、Logo Quiz、Sporcle の Web Icons Quiz など）で、一般大衆向け・広告過多・難易度が上がらないという不満が並びます。

参照すべきは隣接ジャンルの**タイポグラフィ識別ゲーム**です。

- **Typewar** — グリフ 1 文字から書体を 2 択で当てる。正解で加点・誤答で減点し、他プレイヤーの正答率でスコアを重み付け。即時フィードバックとリアルタイム統計が継続動機を作っている
- **I Shot the Serif** — 制限時間内にセリフ体を撃つ。Junior〜Senior の難易度選択。ただし批評として「事前知識を前提にしている」「フィードバックが 👍/👎 だけで学習に繋がらない」「数ラウンドで同じ書体の繰り返しに飽きる」

**差別化は「解説」に置きます。** 誤答時に、なぜそのセットなのかの根拠（グリッド、stroke-width、fill/stroke、セットの由来）を必ず提示する。これが I Shot the Serif の最大の弱点であり、実務の目を養う価値そのものです。

バイラルの型は Wordle 派生（Gamedle 等）から借ります: デイリー 1 セット、seed 共有、統計。

### モード（スコープ）

| モード | 内容 | 状態 |
|---|---|---|
| **A. Set Guess** | アイコン 1 つ → 4 択でセット名。10 問 | ✅ 実装する |
| **D. Daily** | 日替わり seed の 5 問 + 共有 | ✅ 実装する |
| B. Odd One Out / C. Name Guess | — | ❌ スコープ外 |

---

## 2. スタック

| 層 | 採用 | バージョン |
|---|---|---|
| Framework | TanStack Start | `@tanstack/react-start@1.168.28` |
| Routing | TanStack Router（file-based） | `@tanstack/react-router@1.170.18` |
| UI | HeroUI v3（**ESM only**, `"type": "module"`） | `@heroui/react@3.2.2` |
| CSS | Tailwind CSS v4 | `tailwindcss@4.3.2` |
| Runtime | React 19 | `react@19` |
| Build | Vite | `vite@8.1.4` |
| Deploy | Cloudflare Workers | `wrangler@4.111.0` / `@cloudflare/vite-plugin@1.45.0` |
| Icons (build 時のみ) | `@iconify-json/{lucide,heroicons,feather,tabler,ph,bi}` | — |
| Lint / Format | oxlint 1.74 / oxfmt | next-template 由来 |
| DB | **なし** | |

### 設計の中心にある制約: RSC がない

TanStack Start は RSC を使わず、**full-document SSR + hydration + server functions** です。`"use client"` / `"use server"` の境界もありません。ルート loader と server function だけ。

> **つまり loader の戻り値はクライアントに JSON としてシリアライズされます。**
> **loader に `answerIndex` を入れた瞬間、Network タブに正解が全部並びます。**

これがアプリ全体の設計を決めます。

1. **loader は「正規化済み SVG マークアップ + 選択肢ラベル」だけを返す。正解は返さない**
2. **判定は `createServerFn({ method: 'POST' })`。seed と n から出題をサーバー側で再導出して照合する**

副作用として、**クライアントバンドルの肥大が構造的に解決します**。`deck.ts`（gzip 78.5 KB）も `deal()` も `prng` もサーバー専用モジュールに閉じるため、クライアントバンドルには 1 バイトも入りません。

---

## 3. データ層

### 3.1 パッケージ選定

`@iconify/json` は全セット入りで **437 MB**。CI で毎回落とすのは非現実的です。セット別パッケージを使います。

| パッケージ | アイコン数 | サイズ | ライセンス (SPDX) |
|---|---|---|---|
| `@iconify-json/lucide` | 1807 | 570 KB | ISC |
| `@iconify-json/heroicons` | 1288 | 630 KB | MIT |
| `@iconify-json/feather` | 286 | 75 KB | MIT |
| `@iconify-json/tabler` | 6194 | 2.1 MB | MIT |
| `@iconify-json/ph` | 9161 | 4.6 MB | MIT |
| `@iconify-json/bi` | 2084 | 1.1 MB | MIT |

合計 ~9 MB、すべて `devDependencies`。ビルド後は不要です。

**ライセンス情報は `info.json` に SPDX 付きで入っている**ので、帰属表示は自動生成できます。

```json
{ "title": "ISC", "spdx": "ISC", "url": "https://github.com/lucide-icons/lucide/blob/main/LICENSE" }
```

> **Font Awesome Free (`@iconify-json/fa6-solid`) は CC-BY-4.0** です。採用する場合は帰属表示が必須。今回は初期スコープから外します。
> **Simple Icons は採用しません。** ブランドロゴ集合なので、混ぜた瞬間に競合の Logo Quiz に劣化し、商標の論点も別枠になります。

### 3.2 スタイルフィルタ

同一セット内に複数スタイルが同居しているため、regular / outline のみに絞ります。

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

適用後の使用可能アイコン数:

```
lucide      2023   (aliases 含む)
heroicons    327
feather      286
tabler      5289
ph          1533
bi          1419
```

### 3.3 概念の自動抽出

**手書きの概念テーブルは不要でした。** Iconify の `aliases` を展開したうえで名前の交差を取ると、機械的に出題プールが得られます。

```
6セットが共有:  42 概念
5セットが共有:  79 概念
4セットが共有: 116 概念
──────────────────────
出題可能(4セット以上): 237 概念 / 1111 アイコン
```

4 択なので**全 6 セットに存在する必要はなく、4 セット以上あれば足ります**。逆に 4 セット未満の概念を使うと「この概念は tabler にしかない」というメタ推理で消去法が成立してしまうため、**4 セット以上が絶対条件**です（選択肢の 4 セットすべてがその概念を持つこと）。

`aliases` の解決は 1111 件すべて成功（失敗 0）。lucide の `home` → `house` のようなリネームも自動追従します。

```ts
const resolve = (j: IconifyJSON, name: string) => {
  let n = name, guard = 0;
  while (j.aliases?.[n] && guard++ < 5) n = j.aliases[n].parent;
  return j.icons[n] ? { ...j.icons[n], resolved: n } : null;
};
```

> 名前一致は意味一致を保証しません（`share` はセットごとに造形の解釈が違う、など）。ただしモード A では**それこそがセットの個性**なので問題ありません。目視レビューで明らかに別物のものだけ `DENY` リストに落とします。矢印 8 種は退屈なので初期リリースでは除外推奨。

### 3.4 セット特性の実測

| セット | グリッド | stroke-width | cap | 塗り | 難度 |
|---|---|---|---|---|---|
| **lucide** | 24 | 2 | round | stroke | ★★★★★ |
| **feather** | 24 | 2 | round | stroke | ★★★★★ |
| **tabler** | 24 | 2 | round | stroke | ★★★★★ |
| **heroicons** | 24 | 1.5 | round | stroke | ★★★ |
| **ph** | **256** | — | — | **fill** | ★★ |
| **bi** | **16** | — | — | **fill** | ★ |

**重要な帰結が 2 つあります。**

**(1) lucide / feather / tabler はメタ属性が完全に同一です。** グリッドも stroke-width も cap も区別できません。判別できるのは造形だけ。ここが最高難度クラスタであり、**解説パネルで「stroke-width が違います」とは言えない**ことを意味します。この 3 つの解説には、由来と設計思想のテキストが要ります（feather は 286 アイコンの原典、lucide はそのフォークで 1807 まで拡張、tabler は独自系統で 5289）。

**(2) viewBox はセットを一意に特定します。** `256` なら ph 確定、`16` なら bi 確定。**サーバー側で viewBox を隠蔽しなければクイズが成立しません**（→ §4.3）。

難易度定義:

- **Easy** — fill 系（ph / bi）を 1 つ以上混ぜる。一目瞭然
- **Hard** — outline 系のみ（lucide / feather / tabler / heroicons）。造形のみで判別

### 3.5 body 衝突の排除（必須）

**feather の 25% が lucide と body 完全一致**するため、ビルド時に検出して排除します。

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

出題時の制約:

```ts
// 選択肢は、互いに衝突しないセットからのみ選ぶ
// 衝突ペアを除いて 4 セット確保できない概念は、その難易度では出題しない
```

これを怠ると `arrow-right` で「feather か lucide か」という**正解不能な問題**が出ます。Vitest で「全概念・全難易度において、選択肢に衝突ペアが同居しない」を不変条件としてテストしてください。

### 3.6 成果物

```
scripts/build-deck.ts     # 事前実行、成果物をコミット
  ↓
src/data/deck.ts          # export const deck = [...] as const
                          # 237 概念 / 1111 アイコン / 371 KB (gzip 78.5 KB)
```

サーバー専用モジュールからのみ import するため、クライアントバンドルには入りません。TS リテラルで持って型で守ります。

---

## 4. アーキテクチャ

### 4.1 ディレクトリ

```
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx                 /                    ← prerender
│   ├── play.tsx                  /play                → seed 生成して 302
│   ├── play.$seed.$n.tsx         /play/:seed/:n
│   ├── play.$seed.result.tsx     /play/:seed/result
│   ├── daily.tsx                 /daily               → /daily/:date へ 302 (JST)
│   ├── daily.$date.$n.tsx
│   └── daily.$date.result.tsx
├── data/
│   └── deck.ts                   # 生成物
├── lib/
│   ├── prng.ts                   # mulberry32
│   ├── deal.server.ts            # 出題ロジック（サーバー専用）
│   ├── grade.ts                  # createServerFn
│   └── render-icon.server.ts     # SVG 正規化
└── components/
```

### 4.2 URL 設計 — 状態は search params に持つ

サーバーには何も保存しません。TanStack Router の `validateSearch` は search params を第一級の型付きデータとして扱うため、この設計と噛み合います。

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

`<Link to="/play/$seed/$n" params={{ seed, n: n + 1 }} search={{ a: prev + answer, d }} />` で **params も search も型チェックが効きます**。回答履歴の伝搬を型で守れる。

**利点:**
- サーバー完全ステートレス、Cookie ゼロ
- ブラウザバックが正しく動く（Cookie 案だと壊れる）
- URL 共有で途中経過ごと渡せる
- 改竄可能だが、ランキングがないので実害ゼロ

### 4.3 出題（サーバー専用）

```ts
// src/lib/deal.server.ts
import { deck } from "../data/deck";
import { mulberry32, hash } from "./prng";

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
  // 同じ入力から同じ出題を再導出。だから何も保存しなくていい
}
```

**SVG 正規化** — viewBox がセットを一意に特定するため、必ず包み直します。

```ts
// src/lib/render-icon.server.ts
export function normalize(icon: { body: string; w: number; h: number }) {
  return `<svg viewBox="0 0 100 100" role="img" aria-label="出題中のアイコン">
    <g transform="scale(${100 / icon.h})">${icon.body}</g>
  </svg>`;
}
```

- **正規化する**: 色（`currentColor`）、表示サイズ、viewBox、背景
- **正規化しない**: `stroke-width`、`stroke-linecap`、fill/stroke の別 ← これがセットの個性そのもの

`<img src="data:image/svg+xml,...">` は使わないでください（元の viewBox が漏れます）。

### 4.4 判定

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

seed から再導出するので何も保存しません。`meta` がそのまま解説パネルの中身になります。

> ⚠️ **既知の落とし穴**: server function がスローしたエラーは middleware の try-catch をバイパスします（Issue #6381、v1.155+ で修正見込み）。**エラーはスローせず結果オブジェクトで返す**設計にしてください。

### 4.5 キャッシュと prerender

`/play/:seed/:n` は seed が同じなら永久に同じ問題です。**クイズ大会で全員に同じ seed を配る運用**（Score Watcher 的な使い方）がそのまま成立します。

ただし `?a=` が付くとキャッシュキーが割れるため、**プレイ中の SSR HTML はキャッシュしません**（`private, no-store`）。

- **prerender は `/` のみ**
- ビルド時データとリクエスト時データの境界を曖昧にすると古い HTML が出るので、線を明示的に引く
- **デイリーの日付は JST 固定**。Workers の TZ は UTC なので `Intl.DateTimeFormat` で `Asia/Tokyo` を明示すること

### 4.6 デプロイ設定

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "iconoclast",
  "compatibility_date": "2026-07-15",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "observability": { "enabled": true }
}
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tanstackStart(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),  // ← この指定が必須
  ],
});
```

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "pnpm build && wrangler deploy",
    "cf-typegen": "wrangler types",
    "build:deck": "tsx scripts/build-deck.ts"
  }
}
```

`main` に `@tanstack/react-start/server-entry` を指すのが要点です。設定ファイルなしで `wrangler deploy` を叩くと自動検出もしてくれますが、明示しておきます。

---

## 5. UI（HeroUI v3）

### セットアップ

v3 は **Tailwind plugin ではなく CSS import** です。

```css
/* src/styles.css */
@import "tailwindcss";
@import "@heroui/react/styles";
```

`tailwind.config.js` は不要。`@config` ディレクティブも不要です。

### コンポーネント割り当て（v3 の実際の exports に基づく）

| 用途 | v3 コンポーネント | 備考 |
|---|---|---|
| 選択肢 | `button` または `toggle-button-group` | |
| ショートカット表示 | `kbd` | `1`〜`4` |
| 出題カード | `card` / `surface` | |
| 進捗 | `progress-bar` | ← v2 の `Progress` から改名。`aria-label` 必須 |
| セット名・ライセンス | `chip` / `tag` | |
| 難易度切替 | `tabs` | |
| ヘルプ | `modal` | |
| 結果なし状態 | `empty-state` | v3 新規 |
| 見出し・本文 | `typography` / `header` | v3 新規 |
| 解説の補足文 | `description` | v3 新規 |

**`Snippet` は v3 に存在しません。** 共有テキストのコピーは `button` + `navigator.clipboard.writeText()` を自前で実装してください（`aria-live="polite"` でコピー完了を告知）。

**`rac` サブパスから React Aria Components が re-export されています。** HeroUI に無いものはここから直接使えます。

### 注意

- **`toast` で正誤フィードバックを出さないこと。** 視線が画面隅に飛び、`aria-live` の告知タイミングも制御しづらい。解説パネルを出題カード直下に出し、`role="status"` で告知するほうが確実です
- HeroUI v3 は **ESM only**（`"type": "module"`）。CJS の `require` は通りません
- `sideEffects: false` なので tree-shaking は効きます

---

## 6. アクセシビリティ

視覚的識別がゲームの本質なので、**全盲ユーザーには成立しない**という前提を逃げずに設計に織り込みます。

| 項目 | 方針 |
|---|---|
| **出題中の SVG** | `role="img" aria-label="出題中のアイコン"`（情報等価にすると答えが漏れる）。**解答後に server function が返した `meta` で差し替え**、`"Lucide の house アイコン"` にする。WCAG 1.1.1 のテスト例外に該当するが、**解答後の情報等価は担保する** |
| **タイマー** | **既定オフ**（WCAG 2.2.1 調整可能な時間制限）。タイムアタックは opt-in、延長・解除可能に。I Shot the Serif が引っかかっている点 |
| **正誤の伝達** | 色のみに依存しない（1.4.1）。アイコン + テキスト + `role="status"` |
| **`forced-colors`** | 出題 SVG は `currentColor` 統一なので High Contrast でも保たれる。HeroUI の選択状態は背景色依存なので `forced-colors: active` で `outline` 併用 |
| **`prefers-reduced-motion`** | **HeroUI v3 が CSS で対応済み**（`motion-reduce:transition-none`）。追加対応不要 |
| **フォーカス管理** | 解答 → 解説見出しへ `tabindex="-1"` + `.focus()` |
| **JS なし** | SSR + hydration なので、hydration 前のクリックを取りこぼさないよう `<form>` として成立させる |
| **キーボード** | `1`〜`4` キー。`aria-keyshortcuts` で告知 |
| **ライセンス表示** | 各セットのライセンスを解説パネルと footer に。`info.json` から自動生成。**教育的価値がそのままコンプライアンスを兼ねる** |

---

## 7. リポジトリ設定（newt239/next-template からの移植）

| 設定 | 対応 |
|---|---|
| `.editorconfig` / `.ls-lint.yml` / `.vscode` | ✅ そのまま |
| `.oxlintrc.json` | ✅ ほぼそのまま。React 19 のままなので `react` / `react-hooks` が生きる。`next` 系ルールのみ除去 |
| `.oxfmtrc.json` | ✅ |
| `knip.json` | ⚠️ `routeTree.gen.ts` と `src/routes/**` を `ignore` に追加（自動生成 & 動的解決のため未使用判定される） |
| `lefthook.yml` | ✅ + `routeTree.gen.ts` の扱いを決める |
| `vitest.config.ts` | ✅ `deal.server.ts` / `prng.ts` / deck 整合性テストに使用。**全部純関数なので `vi.fn()` 不要** |
| `playwright.config.ts` | ✅ `webServer` を `vite dev` に |
| Tailwind v4 + `postcss.config.mjs` | ✅ HeroUI v3 は CSS import なので plugin 設定不要 |
| `components.json` | ❌ 削除（Intent UI 用） |
| `next.config.ts` | ❌ → `vite.config.ts` |
| `drizzle/` `drizzle.config.ts` `.env.example` Turso | ❌ 削除 |
| `.github/workflows` | ⚠️ Vercel → `wrangler deploy`。step-level parallelism はそのまま |
| `AGENTS.md` / `CLAUDE.md` / `.claude` / `.mcp.json` | ✅ **要加筆**（下記） |

### AGENTS.md に必ず書くこと

エージェントは放置すると Next.js App Router を書きます。加えて、このプロジェクト固有の不変条件は自明ではありません。

```md
## 不変条件（絶対に破らないこと）
- loader の戻り値に正解（answerIndex / セット名）を含めない。SSR で
  クライアントに JSON としてシリアライズされ、Network タブに露出する
- 判定は createServerFn 経由でのみ行う
- deck.ts / deal.server.ts をクライアントコンポーネントから import しない
- SVG は必ず normalize() を通す。元の viewBox はセットを一意に特定する
- 選択肢に body 衝突ペア（feather × lucide 等）を同居させない

## API 規約
- ルート定義は createFileRoute、search params は validateSearch + zod
- server function は createServerFn().validator().handler()
- server function はエラーをスローせず結果オブジェクトで返す（Issue #6381）
```

### Vitest で守る不変条件

```ts
test("同一 seed は同一出題を返す");
test("選択肢に重複がない");
test("正解が必ず選択肢に含まれる");
test("選択肢の全セットがその概念を持つ（消去法が成立しない）");
test("選択肢に body 衝突ペアが同居しない");   // ← 最重要
test("normalize() の出力に元の viewBox が残っていない");
test("Easy は fill 系を 1 つ以上含む / Hard は outline 系のみ");
```

---

## 8. 実装順

1. **`wrangler deploy` が通る空の TanStack Start を先に本番へ上げる**（30 分）
2. `scripts/build-deck.ts` → `src/data/deck.ts`（衝突検出込み）
3. `deal.server.ts` + Vitest（上記の不変条件）
4. `/play/$seed/$n` の SSR + `gradeAnswer`
5. HeroUI v3 適用
6. `/daily/$date`（JST 固定）
7. 結果 + 共有
8. 概念の目視レビュー（237 → DENY リストで削る）

週末 2 日規模。

---

## 9. 残リスク

| リスク | 度合い | 対応 |
|---|---|---|
| 概念 237 のうち、名前は同じでも意味が違うものが混ざる | 中 | 目視レビュー + `DENY` リスト。初期リリースは矢印 8 種を除外 |
| lucide / feather / tabler が難しすぎて理不尽に感じる | 中 | Hard 限定にする。Easy は fill 系を必ず混ぜる。解説で由来を説明する |
| body 完全一致以外の「ほぼ同一」（1 パス違いなど）の存在 | 低 | ハッシュでは拾えない。プレイして気づいたら `DENY` へ |
| TanStack Start の server function エラー処理（#6381） | 低 | v1.155+ で修正済みのはず。結果オブジェクト返しで回避 |
| HeroUI v3 のコンポーネント不足（Snippet 等） | 低 | `rac` サブパスから React Aria Components を直接使う |
| Vite 8 × TanStack Start の組み合わせ実績 | 低 | peer は満たすが、渋ったら Vite 7 系に落とす |

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
