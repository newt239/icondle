# Guess Icon 設計ドキュメント

> UI アイコンライブラリの識別クイズ Web アプリ
> 最終更新: 2026-07-16 / 数値はすべて実測値

---

## 1. プロダクト

### コンセプト

> **Guess Icon** — このアイコン、どのセットのやつ？

主要 UI アイコンセット（フィルタ後アイコン数の上位 12 セット、→ §4.1）からアイコンを提示し、どのセット由来かを 4 択で当てる。フロントエンド開発者・デザイナー向け。

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
3. `deck.ts` / `deal.server.ts` はサーバー専用。クライアントから import しない（副次効果として deck がクライアントバンドルに入らない）
4. 出題 SVG は必ず `normalize()` を通す。**元の viewBox はセットを一意に特定する**（`256` なら ph、`16` なら bi）
5. 選択肢に body 衝突ペアを同居させない。フォーク・派生関係のセット間で発生する（→ §4.4）
6. server function はエラーをスローせず結果オブジェクトで返す（TanStack Start Issue #6381 対策）

---

## 4. データ層設計（未実装）

### 4.1 パッケージ選定

手動キュレーションはしない。Iconify のコレクション情報（`https://api.iconify.design/collections`）から機械的に選定する。セット別の `@iconify-json/*` を `devDependencies` に置く（全部入りの `@iconify/json` は 437 MB のため不採用）。

**候補条件**（すべて満たすもの）:

- カテゴリが UI 系（`UI 24px` / `UI 16px / 32px` / `UI Other / Mixed Grid` / `Material`）かつ `palette: false`。Logos / Emoji / Flags / Thematic / Archive は除外
- ライセンスが帰属表示不要（MIT / ISC / Apache-2.0 / CC0-1.0）。CC-BY 系（Font Awesome / Solar / IconaMoon 等）は初期スコープ外
- 同一ファミリーの重複は最大の 1 つに代表させる（`material-symbols-light` / `ic` は `material-symbols` に代表）

**採用ルール**: 各候補にスタイルフィルタ（→ §4.2）を適用し、**適用後の使用可能アイコン数の多い順に 12 セット（最低 10）を採用**する。確定は `scripts/build-deck.ts` の実測で行い、採用セットと生成時のパッケージバージョンを deck.ts に記録する。

候補上位（raw アイコン数は 2026-07-16 の Iconify API 実測。スタイル・サイズ違いを含むため、順位はフィルタ後に入れ替わる）:

| パッケージ | raw | ライセンス | 備考 |
|---|---|---|---|
| `@iconify-json/fluent` | 19603 | MIT | サイズ × スタイルの直積 → 24px regular に絞る |
| `@iconify-json/material-symbols` | 15462 | Apache-2.0 | outline のみ残す |
| `@iconify-json/ph` | 9072 | MIT | regular のみ |
| `@iconify-json/mdi` | 7447 | Apache-2.0 | Pictogrammers。fill 系代表 |
| `@iconify-json/tabler` | 6146 | MIT | `-filled` 除外 |
| `@iconify-json/hugeicons` | 5065 | MIT | 単一スタイル |
| `@iconify-json/boxicons` | 3768 | MIT | solid / logo 系除外 |
| `@iconify-json/glyphs` | 3452 | MIT | |
| `@iconify-json/mingcute` | 3324 | Apache-2.0 | `-fill` 除外 |
| `@iconify-json/ri` | 3188 | Apache-2.0 | `-fill` 除外 |
| `@iconify-json/icon-park-outline` | 2658 | Apache-2.0 | 全 outline |
| `@iconify-json/mynaui` | 2616 | MIT | |
| `@iconify-json/carbon` | 2571 | Apache-2.0 | |
| `@iconify-json/tdesign` | 2352 | MIT | `-filled` 除外 |
| `@iconify-json/bi` | 2078 | MIT | `-fill` 除外 |
| `@iconify-json/lucide` | 1747 | ISC | aliases 込みで約 2000 |
| `@iconify-json/iconoir` | 1671 | MIT | |
| `@iconify-json/heroicons` | 1288 | MIT | フィルタ後 327。圏外の可能性大 |

- feather（286）は圏外となり、lucide × feather の body 衝突問題は自然に消える。ただし衝突検出（→ §4.4）はフォーク関係一般への防御として維持する
- ライセンス情報は各パッケージの `info.json` に SPDX 付きで入っているため、帰属表示は採用セットぶんを自動生成する

### 4.2 スタイルフィルタ

同一セット内のスタイル・サイズ混在を排除し、**1 セット = 代表 1 スタイル**に正規化する。outline / regular があればそれを、なければ fill を代表とする（mdi / bi など）。この分類がそのまま難易度定義（→ §4.5）の stroke 系 / fill 系になる。

フィルタは候補セットごとの除外正規表現として `scripts/build-deck.ts` に保守する。例:

```ts
const EXCLUDE: Record<SetId, RegExp> = {
  lucide:    /$^/,                               // 全て outline
  heroicons: /(-solid|-16-solid|-20-solid)$/,    // 24 outline のみ残す
  tabler:    /-filled$/,
  ph:        /-(bold|duotone|fill|light|thin)$/, // regular のみ
  bi:        /-fill$/,
  mingcute:  /-fill$/,
  ri:        /-fill$/,
};
```

fluent（サイズ × スタイルの直積）や material-symbols（rounded / sharp / fill 派生）のような大規模セットは包含側の正規表現（`/-24-regular$/` にマッチするものだけ残す等）で定義する。適用後の使用可能アイコン数は build-deck 実行時に実測し、採用順位の根拠としてログに出力する。

### 4.3 概念の自動抽出

手書きの概念テーブルは不要。Iconify の `aliases` を展開したうえで名前の交差を取ると、機械的に出題プールが得られる。

旧 6 セット構成での実測は「4 セット以上が共有する概念 = 237 概念 / 1111 アイコン」。12 セット化により母集団が数倍になるため、概念数・アイコン数は build-deck で再計測する（大幅に増える見込み）。

- 4 択なので全セットに存在する必要はないが、**4 セット以上が絶対条件**（選択肢の 4 セットすべてがその概念を持つこと）。4 セット未満を使うと「この概念はこのセットにしかない」というメタ推理で消去法が成立してしまう
- `aliases` の解決は旧構成で全 1111 件成功（lucide の `home` → `house` のようなリネームも自動追従）

```ts
const resolve = (j: IconifyJSON, name: string) => {
  let n = name, guard = 0;
  while (j.aliases?.[n] && guard++ < 5) n = j.aliases[n].parent;
  return j.icons[n] ? { ...j.icons[n], resolved: n } : null;
};
```

> 名前一致は意味一致を保証しないが、モード A では造形の解釈違いこそがセットの個性なので問題ない。明らかに別物のものだけ目視レビューで `DENY` リストに落とす。矢印 8 種は退屈なので初期リリースでは除外推奨。

### 4.4 body 衝突の排除（必須）

フォーク・派生関係のセット間では SVG body が完全一致することがある（旧構成の実測では feather の 25% が lucide と一致）。同一 body のアイコンを見せて「どちらのセットか」と聞くのは正解不能な問題であり、ビルド時に検出して排除する。採用セットが機械選定で入れ替わっても成立する一般則として維持する。

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

機械的に導出できる特性（グリッド = `info.json` の `height`、stroke 系 / fill 系 = body の判定、stroke-width）は build-deck で採用セットぶんを自動抽出する。解説パネル用の由来・設計思想テキストのみ、採用が確定したセットに対して手で書く。検証済みの例:

| セット | グリッド | stroke-width | cap | 塗り | 難度 |
|---|---|---|---|---|---|
| **lucide** | 24 | 2 | round | stroke | ★★★★★ |
| **tabler** | 24 | 2 | round | stroke | ★★★★★ |
| **heroicons** | 24 | 1.5 | round | stroke | ★★★ |
| **ph** | **256** | — | — | **fill** | ★★ |
| **bi** | **16** | — | — | **fill** | ★ |

重要な帰結が 2 つある。

1. **24px グリッド・stroke-width 2 のセット群（lucide / tabler / hugeicons 等）はメタ属性がほぼ同一。** 判別できるのは造形だけであり、解説パネルで「stroke-width が違います」とは言えない。この群の解説には由来と設計思想のテキストが要る
2. **viewBox はセットを一意に特定する。** サーバー側で viewBox を隠蔽しなければクイズが成立しない（→ §5.3）

難易度定義（分類は §4.2 の代表スタイルから自動導出）:

- **Easy** — fill 系（ph / bi / mdi 等）を 1 つ以上混ぜる。一目瞭然
- **Hard** — stroke 系のみ。造形のみで判別

### 4.6 成果物

```
scripts/build-deck.ts     # 事前実行、成果物をコミット
  ↓
src/data/deck.ts          # export const deck = [...] as const
                          # 採用セット一覧 + 生成時のパッケージバージョンも記録
```

サーバー専用モジュールからのみ import する。TS リテラルで持って型で守る。旧 6 セット構成の実測は 371 KB（gzip 78.5 KB）。12 セット化でサイズは増えるが、サーバー専用（§3-3）のためクライアントには影響しない。Workers のバンドル上限（無料 3 MB gzip）に対しては十分な余裕を確認する。

### 4.7 デッキ再生成の運用

デッキ生成は重い処理なので、**デプロイやビルドのたびには実行しない**。deck.ts はコミット済みの成果物であり、`pnpm run dev` / `build` / `deploy` はそれを読むだけ。

再生成のトリガは 2 つのみ:

1. **`@iconify-json/*` の更新時（自動）** — Dependabot の週次 PR（`.github/dependabot.yml`）が `pnpm-lock.yaml` を更新したら、CI の deck-regen workflow が `@iconify-json` の差分を検知して `pnpm run build-deck` を実行し、再生成した deck.ts を同じ PR にコミットする。deck とパッケージのバージョンが常に同期した状態でマージされる
2. **手動** — DENY リストや採用条件を変えたときにローカルで `pnpm run build-deck`。CI 側にも `workflow_dispatch` を用意する

deck.ts に記録した生成時バージョン（→ §4.6）が、再生成の要否判定と帰属表示の情報源になる。

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
2. **`scripts/build-deck.ts` → `src/data/deck.ts`** — 候補の `@iconify-json/*` を devDependencies に追加し、スタイルフィルタ適用後のアイコン数を実測して上位 12 セットを確定。概念抽出・body 衝突検出・`DENY` リスト適用・ライセンス情報とバージョンの記録（→ §4、付録）
3. **deck-regen workflow** — Dependabot PR の `@iconify-json` 差分にフックして deck.ts を再生成・コミットする GitHub Actions（→ §4.7）。`workflow_dispatch` 付き
4. **`deal.server.ts` + Vitest** — 全部純関数なので `vi.fn()` 不要。守る不変条件:
   - 同一 seed は同一出題を返す
   - 選択肢に重複がない
   - 正解が必ず選択肢に含まれる
   - 選択肢の全セットがその概念を持つ（消去法が成立しない）
   - **選択肢に body 衝突ペアが同居しない（最重要）**
   - `normalize()` の出力に元の viewBox が残っていない
   - Easy は fill 系を 1 つ以上含む / Hard は outline 系のみ
5. **`/play/$seed/$n` の SSR + `gradeAnswer`** — ルート群・searchSchema・解説パネル（→ §5）。zod を dependencies へ追加
6. **HeroUI v3 適用** — 選択肢・進捗・kbd・解説パネルのスタイリング（→ §6）
7. **`/daily/$date`** — JST 固定の日替わり seed
8. **結果画面 + 共有** — クリップボードコピーは自前実装
9. **概念の目視レビュー** — 出題概念を `DENY` リストで削る。矢印 8 種は初期除外

---

## 9. 残リスク

| リスク | 度合い | 対応 |
|---|---|---|
| 出題概念のうち、名前は同じでも意味が違うものが混ざる | 中 | 目視レビュー + `DENY` リスト |
| 24px stroke 2px 系（lucide / tabler / hugeicons 等）が難しすぎて理不尽に感じる | 中 | Hard 限定にする。Easy は fill 系を必ず混ぜる。解説で由来を説明する |
| 機械選定により知名度の低いセット（glyphs / mynaui 等）が採用される | 中 | 解説パネルで紹介する価値に転化する。ゲーム性を損なう場合は除外条件（ALLOW / DENY）をセット単位で追加 |
| body 完全一致以外の「ほぼ同一」（1 パス違いなど）の存在 | 低 | ハッシュでは拾えない。プレイして気づいたら `DENY` へ |
| TanStack Start の server function エラー処理（#6381） | 低 | 結果オブジェクト返しで回避（§3-6） |
| HeroUI v3 のコンポーネント不足（Snippet 等） | 低 | `rac` サブパスから React Aria Components を直接使う |

---

## 付録: ビルドスクリプト（骨格）

概念抽出・alias 解決のロジックは旧 6 セット構成で検証済み（概念 237 / アイコン 1111 / 解決失敗 0 / raw 371.3 KB / gzip 78.5 KB）。12 セット化ではセット選定ステップが先頭に加わる。

```ts
// scripts/build-deck.ts
const CANDIDATES = [
  { id: "fluent", filter: /* 24px regular のみ残す包含条件 */ },
  { id: "material-symbols", filter: /* outline のみ */ },
  { id: "ph", exclude: /-(bold|duotone|fill|light|thin)$/ },
  // ... §4.1 の候補表のセットを列挙
];

const load = (id) =>
  import(`@iconify-json/${id}/icons.json`, { with: { type: "json" } });

const resolve = (j, name) => {
  let n = name, guard = 0;
  while (j.aliases?.[n] && guard++ < 5) n = j.aliases[n].parent;
  return j.icons[n] ? { ...j.icons[n], resolved: n } : null;
};

// 0. 候補ごとにスタイルフィルタ適用後のアイコン数を実測し、上位 12 セットを採用
// 1. 採用セットのフィルタ適用後の名前空間を構築（icons + aliases）
// 2. 4 セット以上が共有する概念のみ採用
const count = new Map();
for (const id of adopted)
  for (const n of names[id]) count.set(n, (count.get(n) ?? []).concat(id));
const concepts = [...count].filter(([, owners]) => owners.length >= 4);

// 3. body 解決 + 衝突検出 + DENY 適用 + セット特性・ライセンス・バージョン記録
//    → deck.ts へ出力
```
