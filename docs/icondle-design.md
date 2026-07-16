# Icondle 設計ドキュメント

> UI アイコンライブラリの識別クイズ Web アプリ
> 最終更新: 2026-07-16

## プロダクト

主要 UI アイコンセットを題材に、アイコンとセット名の対応を 4 択で当てるクイズ。フロントエンド開発者・デザイナー向け。回答直後のフィードバックは正解のセット名とアイコン名のみに絞り、セットの由来・特性の紹介は `/sets` に集約する。デイリー 1 セット・seed 共有という Wordle 型の遊ばれ方を想定する。

## ゲームモード

| ゲーム | 内容 | ルート |
|---|---|---|
| **Play（セット名を当てる）** | アイコン 1 つを表示し、セット名を 4 択から選ぶ | `/play`（easy）/ `/play/hard` |
| **Pick（アイコンを当てる）** | セット名を提示し、合致するアイコンを 4 つから選ぶ | `/pick`（easy）/ `/pick/hard` |

- **難易度**: easy は 5 問・有名 6 セット（fluent / material-symbols / tabler / lucide / heroicons / fa6-solid）から出題。hard は 10 問・全 14 セット
- **デイリー**: 専用ルートを持たず、`/pick/{YYYY-MM-DD}` の日付シードで実現（easy 固定）。日付は JST（`jstToday`）、未来日付は 404。play と hard は日付シードを拒否する
- 1 プレイ内で同じ概念は出題されない。各問の選択肢 4 つも概念が重複しない

## データ層

- `scripts/build-deck.ts` を事前実行し、成果物 `src/data/deck.ts` をコミットする。dev / build / deploy はそれを読むだけで、**再生成は @iconify-json 更新時（CI の deck-regen workflow が Dependabot PR に追従）と手動実行のみ**
- セットは手動キュレーションせず機械選定する。UI 系カテゴリ・帰属表示不要ライセンスのセットを候補とし、easy 6 セットを強制採用のうえ、スタイルフィルタ（1 セット = 代表 1 スタイル）適用後のアイコン数上位で計 14 セットを採用する。fa6-solid（CC BY 4.0）のみ知名度要件からの例外で、帰属表示は `/sets` が担う
- 出題概念は「4 セット以上が同名アイコンを持つ」もの。Iconify の `aliases` を解決して名前の交差を取り、不適切なものは `DENY` リストで除外する
- フォーク・派生関係のセット間では SVG body が完全一致することがあるため、ビルド時に衝突を検出し、**衝突ペアを同一問題の選択肢に同居させない**

## アーキテクチャ

TanStack Start（full-document SSR + server functions。RSC はない）+ HeroUI v3 + Tailwind CSS v4 + Cloudflare Workers。DB はなく、状態はすべて URL に持つ。

```
/pick/a7f3c2/1                ← 出題（回答履歴は ?a= に持つ）
/pick/a7f3c2/result?a=2143
/pick/2026-07-16/1            ← デイリー（日付シード）
/pick/hard/a7f3c2/1           ← hard
/play/...                     ← Play 側も同構造
```

- seed と問番号から出題を決定論的に導出する（`mulberry32` + `hash`）ため、サーバーに何も保存しなくてよい。同じ seed の URL を配れば全員が同じ問題を解ける
- loader は「正規化済み SVG + 選択肢ラベル」だけを返し、**正解はクライアントに渡さない**。判定は `createServerFn` がサーバー側で出題を再導出して行う
- 出題 SVG は `normalize()` で viewBox を包み直す（元の viewBox はセットを一意に特定するため）。stroke-width や fill/stroke の別はセットの個性なので正規化しない
- `deck.ts` / `deal.server.ts` はサーバー専用。クライアントから import しない
- server function はエラーをスローせず結果オブジェクトで返す
- プレイ中の SSR HTML はキャッシュしない（`private, no-store`）

## アクセシビリティ

視覚的識別がゲームの本質であることを前提に設計する。

- 出題中の SVG は `aria-label="出題中のアイコン"`（情報等価にすると答えが漏れる）。解答後に「Lucide の house アイコン」のように差し替えて情報等価を担保する
- 正誤は色のみに依存せず、アイコン + テキスト + `role="status"` で伝える
- 選択肢は `1`〜`4` キーで回答でき、hydration 前でも `<form>` として成立する
- 解答後は解説見出しへフォーカスを移動する

## 既知の注意点

- dev サーバーでルートの初回 SSR が notFound になると以降その SSR がハングする（本番ビルドでは発生しない）。E2E は `tests/e2e/warmup.setup.ts` で正常系を先に SSR させてから実行する
- body 完全一致以外の「ほぼ同一」アイコンはハッシュでは拾えない。気づいたら `DENY` リストへ
- 本番への初回デプロイは未実施（`pnpm run deploy`）
