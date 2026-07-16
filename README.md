# Icondle

> UI アイコンライブラリの識別クイズ Web アプリ

設計の詳細は [docs/icondle-design.md](./docs/icondle-design.md) を参照してください。

## 技術スタック

- TypeScript / React 19
- [TanStack Start](https://tanstack.com/start)（file-based routing / full-document SSR + server functions）
- Tailwind CSS v4
- [HeroUI v3](https://www.heroui.com/)
- Vite 8
- Cloudflare Workers（wrangler / @cloudflare/vite-plugin）
- Oxlint / Oxfmt
- Vitest / Playwright

## Development

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm run dev
```

http://localhost:3000 で起動します。

## デプロイ

Cloudflare Workers にデプロイします。

```bash
pnpm run deploy
```

- `pnpm run build` - 本番ビルド（`dist/` に出力）
- `pnpm run preview` - 本番ビルドのローカルプレビュー
- `pnpm run cf-typegen` - Cloudflare バインディングの型を生成

## テスト

- `pnpm run test` - Vitest によるユニットテスト
- `pnpm run test:e2e` - Playwright による E2E テスト

## コード品質

```bash
pnpm run codecheck
```

typecheck / oxlint / oxfmt / ls-lint / knip を一括実行します。
