# Coding Agent Guidelines

## 目次

- [基本原則](#基本原則)
- [UX ライティング](#ux-ライティング)
- [開発コマンド](#開発コマンド)
- [アーキテクチャ](#アーキテクチャ)
- [不変条件（絶対に破らないこと）](#不変条件絶対に破らないこと)
- [コーディングガイドライン](#コーディングガイドライン)

## 基本原則

- 常に日本語でコミュニケーションを行ってください。すべてのコミットメッセージ、コメント、エラーメッセージ、ユーザーとのやり取りは日本語で行ってください。
- ファイルの削除を行う場合は、必ず実行前に以下を報告し、明示的なユーザー承認を得てください。
  - 対象ファイルのリスト
  - 実行する変更の詳細説明
  - 影響範囲の説明
- 不明な点がある場合は常に質問し、推測で進めてはなりません。
- 実装後の必須作業として、`pnpm run codecheck`を実行してください。
  - 型エラーやリンターのエラーが出た場合は、コミット前に必ず修正してください。
  - エラーを解消するために`oxlintrc.json`や`tsconfig.json`を変更してはなりません。

### コミットメッセージ

- コミットメッセージは原則として `feat:` `fix:` `docs:` `chore:` `refactor:` `test:` `ci:` などの prefix を付けた日本語の 1 行で記述してください。
- 本文（複数行の詳細説明）は原則として書かないでください。

## UX ライティング

- ボタンやリンクのラベルは体言止め（名詞で終える言い方）ではなく、動詞 +「する」で終える言い切りの形にしてください（例:「Xでポストする」「もっとプレイする」）。
- 画面内で同じ情報を重複して表示しないでください（例: ヘッダーにアプリ名が表示済みの場合、本文で同じ文言を繰り返さない）。
- 新しい文言を追加・変更する前に、同じ画面や近い機能で既に使われている表記・語尾を確認し、トーンを揃えてください。

## 開発コマンド

### 基本コマンド

- `pnpm run dev` - 開発サーバーを起動（http://localhost:3000）
- `pnpm run build` - 本番アプリケーションをビルド
- `pnpm run preview` - 本番ビルドをローカルでプレビュー
- `pnpm run deploy` - ビルドして Cloudflare Workers にデプロイ
- `pnpm run cf-typegen` - Cloudflare バインディングの型を生成
- `pnpm run typecheck` - TypeScript で型チェック
- `pnpm run test` - Vitest によるユニットテスト
- `pnpm run test:e2e` - Playwright による E2E テスト

### Playwright MCP による動作確認

- Playwright MCP で撮影したスクリーンショットは、必ず `.playwright-mcp/` ディレクトリに保存してください(`filename` に `.playwright-mcp/xxx.png` のようにディレクトリ付きで指定します)。
- `.playwright-mcp/` は gitignore 済みです。プロジェクトルート直下にスクリーンショット等の検証用ファイルを作成しないでください。

## アーキテクチャ

### 技術スタック

- **言語**: TypeScript / React 19
- **フレームワーク**: TanStack Start（TanStack Router による file-based routing）
- **スタイリング**: Tailwind CSS v4
- **UI**: HeroUI v3（ESM only。`src/styles.css` で `@import "@heroui/styles"` 済み）
- **ビルド**: Vite
- **コード品質**: Oxlint / Oxfmt
- **Git hooks**: Lefthook
- **デプロイ**: Cloudflare Workers（wrangler / @cloudflare/vite-plugin）
- **データベース**: なし（状態は URL の search params に持つ）

### RSC は存在しない

TanStack Start は RSC を使いません。full-document SSR + hydration + server functions です。`"use client"` / `"use server"` / `import "server-only"` は使用できません。Next.js App Router の書き方を持ち込まないでください。

- **loader の戻り値はクライアントに JSON としてシリアライズされます**。秘匿すべき情報を含めてはなりません
- サーバー専用処理は server function（`createServerFn`）またはサーバー専用モジュール（`*.server.ts`）に置きます

### プロジェクト構造

```bash
src/
├── routes/                 # TanStack Router の file-based routes
│   ├── __root.tsx          # ルートドキュメント（HTML シェル）
│   └── index.tsx           # ホームページ
├── router.tsx              # ルーターの生成（getRouter）
├── routeTree.gen.ts        # 自動生成（編集禁止）
├── styles.css              # Tailwind + HeroUI のエントリ CSS
├── data/                   # 事前生成・コミット済みデータ（deck.ts。サーバー専用）
├── features/               # 機能ベースのディレクトリ構成
│   └── {feature-name}/
│       ├── components/     # 機能固有のコンポーネント
│       │   ├── {component-name}.tsx
│       │   └── {component-name}.spec.tsx
│       ├── lib/            # 機能固有のロジック・server functions
│       ├── hooks/          # 機能固有のカスタムフック
│       ├── schemas/        # Zod スキーマ（バリデーション用）
│       └── types/          # 機能固有の型定義
├── components/             # 汎用的に使用するコンポーネント
├── lib/                    # グローバルユーティリティ・設定
│   ├── prng.ts             # シード付き乱数（mulberry32 / hash）
│   ├── *.server.ts         # サーバー専用モジュール
│   └── *.ts
└── hooks/                  # グローバルカスタムフック（必要に応じて追加）
```

- コンポーネントの名前はPascalCaseで命名し、ファイル名・ディレクトリ名はkebab-caseで命名してください。
- コンポーネントは `{component-name}.tsx` として `components/` 直下にフラットに配置してください。コンポーネントごとのディレクトリやバレル `index.ts` は作成しないでください。
- `src/routes/` は TanStack Router のディレクトリベース規約（`play/$seed/$n.tsx` など）に従います。

### Feature 内モジュールの参照制限

- 各 feature 内の **lib**・**hooks** は、**他の feature から呼び出してはなりません**。`src/routes/` はアプリ層のため、feature 内モジュール（components / lib）を参照して構いません。
- 複数の feature で共通化したい処理は、`src/lib/` や `src/hooks/` などグローバルな層に配置し、必要な feature や app から参照してください。

### インポートとパスエイリアス

- 同階層でないモジュールをインポートする場合は、**相対パスではなくパスエイリアスを使用してください**。
- プロジェクトでは `#/` が `src/` にマップされています。例: `#/lib/prng` → `src/lib/prng`。
- **同一 feature 内**や**同一ディレクトリ内**のインポートでは相対パス（`./prng` など）を使用して構いません。

## 不変条件（絶対に破らないこと）

- loader の戻り値に正解（answerIndex / セット名）を含めない。SSR でクライアントに JSON としてシリアライズされ、Network タブに露出する
- 判定は createServerFn 経由でのみ行う
- deck.ts / deal.server.ts をクライアントから import しない
- 出題 SVG は必ず normalize() を通す。元の viewBox はセットを一意に特定する
- 選択肢に body 衝突ペア（フォーク・派生関係のセットで発生）を同居させない
- deck.ts はデプロイやビルドでは再生成しない。再生成は @iconify-json 更新時と手動実行のみ

## API 規約

- ルート定義は `createFileRoute`、search params は `validateSearch` + zod でバリデーションする
- server function は `createServerFn().validator().handler()` で定義する
- server function はエラーをスローせず、結果オブジェクト（`{ success: false, error: "..." } as const` など）で返す
- 状態はサーバーに保存せず、URL（params / search params）に持つ

## コーディングガイドライン

### `any`の禁止

- いかなる理由があっても`any`を使用してはなりません。
- `unknown`や`never`の使用も避けてください。
- 実データと一致する型を定義してください。

### 型アサーションの禁止

- 型アサーションは禁止です。
- 型アサーションを使用する場合は、明確な理由をコメントアウトとして記述してください。

### `interface`の禁止

- 型定義に`interface`を使用してはなりません。`type`を使用してください。
- 唯一の例外は宣言マージが必須の場面（`src/router.tsx` の `Register`）です。理由をコメントで記述してください。

### コメントの禁止

- 原則としてコメントは記述してはなりません。
- 型アサーションやuseEffectの使用理由など、他のガイドラインが記述を求める場合のみ例外とします。
- コメントを書く場合は括弧を使用しないでください。

### 過度な抽象化の禁止

- 無駄に関数化・定数化しすぎてはなりません。
- 再利用される明確な根拠がない限り、処理の切り出しや定数への抽出を行わないでください。

### コンポーネントファイルの構成

- コンポーネントファイルにはコンポーネント関数とその Props 型以外を原則置かないでください。
- className 等はモジュールレベルの変数やヘルパー関数に切り出さず、使用箇所にインラインで記述してください。

### テストは最小限に

- 仕様の分岐ごとに 1 ケースのみ書いてください。
- 定数の同値チェック・同一分岐の重複アサーション・意味のない反復ループを書かないでください。無駄なチェックは読みづらくなるだけです。

### useEffectの禁止

- 初期データを取得するためにuseEffectを使用してはなりません。
- データ取得はルートの loader で行い、`Route.useLoaderData()` で参照してください。
- ブラウザAPIアクセスやイベントリスナー登録など、真に必要な場合のみuseEffectの使用を許可します。この場合は明確な理由をコメントアウトとして記述すべきです。

### ローディング表示

- server function の呼び出し中は`useTransition`等でローディング表示を行ってください。
- ボタンを連打できないように`disabled`を設定してください。
