# Icondle

> UI アイコンライブラリの識別クイズ Web アプリ

https://icondle.newt239.dev/

## 技術スタック

- TypeScript / React 19
- [TanStack Start](https://tanstack.com/start)（file-based routing / full-document SSR + server functions）
- Tailwind CSS v4
- [HeroUI v3](https://www.heroui.com/)
- Vite 8
- Cloudflare Workers（wrangler / @cloudflare/vite-plugin）
- Oxlint / Oxfmt
- Vitest / Playwright

## 収録アイコンセットとライセンス

出題データ（`src/data/deck.ts`）は [Iconify](https://iconify.design/) から生成しており、各アイコンは表示用に正規化を加えて収録しています。収録セットとライセンスは以下のとおりです。

| セット                 | ライセンス                                                                        |
| ---------------------- | --------------------------------------------------------------------------------- |
| Tabler Icons           | [MIT](https://github.com/tabler/tabler-icons/blob/master/LICENSE)                 |
| Huge Icons             | MIT                                                                               |
| IconPark Outline       | [Apache 2.0](https://github.com/bytedance/IconPark/blob/master/LICENSE)           |
| Material Symbols       | [Apache 2.0](https://github.com/google/material-design-icons/blob/master/LICENSE) |
| Fluent UI System Icons | [MIT](https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE)       |
| Carbon                 | Apache 2.0                                                                        |
| Lucide                 | [ISC](https://github.com/lucide-icons/lucide/blob/main/LICENSE)                   |
| Boxicons               | [MIT](https://github.com/box-icons/boxicons-core/blob/main/LICENSE)               |
| Iconoir                | [MIT](https://github.com/iconoir-icons/iconoir/blob/main/LICENSE)                 |
| Remix Icon             | [Apache 2.0](https://github.com/cyberalien/RemixIcon/blob/master/License)         |
| MingCute Icon          | [Apache 2.0](https://github.com/Richard9394/MingCute/blob/main/LICENSE)           |
| Phosphor               | [MIT](https://github.com/phosphor-icons/core/blob/main/LICENSE)                   |
| Bootstrap Icons        | [MIT](https://github.com/twbs/icons/blob/main/LICENSE.md)                         |
| Unicons                | [Apache 2.0](https://github.com/Iconscout/unicons/blob/master/LICENSE)            |
| HeroIcons              | [MIT](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE)              |

## Development

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm run dev
```

http://localhost:3000/ で起動します。

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
