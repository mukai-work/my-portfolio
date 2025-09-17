# Brief2Plan / ポートフォリオ統合プロジェクト

Nuxt 3 + TypeScript で構築したポートフォリオに、要件定義から見積・PDF・GitHub 連携までを自動化する **Brief2Plan** を追加しました。Prisma + SQLite、Tailwind CSS、Vitest / Playwright、GitHub Actions、Docker に対応しています。

## アーキテクチャ

```
┌────────────────────────────────────────────┐
│ Nuxt 3 (Vue 3 + TypeScript)                │
│  ├─ UI: Tailwind CSS / Headless UI         │
│  ├─ Pages: /brief2plan, /brief2plan/share  │
│  ├─ Components: RequirementsEditor,        │
│  │   ResultDashboard, GanttLite,           │
│  │   HistogramChart, CostCards, Modals     │
│  └─ i18n (ja/en), アクセシビリティ対応     │
├────────────────────────────────────────────┤
│ Nitro Server API                           │
│  ├─ /api/brief/parse (LLM/ルールベース解析) │
│  ├─ /api/brief/:id/estimate (PERT/MonteCarlo)│
│  ├─ /api/brief/:id/pdf (pdf-lib)           │
│  ├─ /api/brief/:id/share (JWT 共有リンク)   │
│  ├─ /api/brief/:id/github (Octokit)        │
│  └─ /api/share/:id (公開ビュー)            │
├────────────────────────────────────────────┤
│ Prisma + SQLite                            │
│  ├─ RequirementBrief / StructuredSpec      │
│  ├─ Task (階層・依存関係)                  │
│  ├─ EstimateSummary (PERT/MonteCarlo結果) │
│  └─ ShareToken (JWT署名 + TTL)             │
└────────────────────────────────────────────┘
```

## セットアップ

1. **依存インストール**
   ```bash
   pnpm install
   pnpm prisma migrate deploy --schema prisma/schema.prisma
   pnpm prisma db seed
   ```
2. **環境変数** (`.env` または `.env.local` を作成)
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   OPENAI_API_KEY=""        # 任意。空ならルールベースで解析
   GITHUB_TOKEN=""          # 任意。設定時のみ Issue 連携が有効
   JWT_SECRET="change-me"
   SHARE_BASE_URL="http://localhost:3000"
   RESEND_API_KEY=""        # 既存問い合わせフォーム用
   CONTACT_EMAIL="k.mukai.work@gmail.com"
   CONTACT_SENDER="Portfolio <noreply@example.com>"
   RECAPTCHA_SECRET=""
   RECAPTCHA_SITE_KEY=""
   ```
3. **開発サーバー**
   ```bash
   pnpm dev
   ```

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー (http://localhost:3000) |
| `pnpm lint` | ESLint (Flat config, strict) |
| `pnpm test:unit` | Vitest によるサービス層テスト |
| `pnpm prepare:e2e` | Playwright ブラウザ依存関係の取得 |
| `pnpm test:e2e` | Playwright エンドツーエンドテスト (GitHub/LLM はモック) |
| `pnpm build` | 本番ビルド (`.output` 生成) |
| `pnpm seed` | Prisma シードデータ投入 |
| `pnpm migrate` | Prisma migrate deploy |

> **注意:** Playwright/E2E 実行前に `pnpm prisma migrate deploy --schema prisma/schema.prisma` を実行し、`DATABASE_URL` をテスト用に切り替えてください。

## Brief2Plan 機能

- 文章要件からの構造化 (機能/非機能/前提/リスク)
  - `OPENAI_API_KEY` 設定時は GPT-4o mini を使用、未設定時はルールベースでフォールバック
- WBS 自動生成 (階層 + 依存関係)
- PERT / クリティカルパス解析
- Monte Carlo 1000回シミュレーション (P50/P80, 目標達成確率)
- コスト試算 (レート・利益率・バッファ率から原価/見積/粗利を算出)
- pdf-lib による見積PDF出力
- JWT 署名つき共有リンク (TTL 指定)
- GitHub Issue 自動作成 (Octokit、`GITHUB_TOKEN=mock` 時はモック成功レスポンス)
- Tailwind + Headless UI によるモダンな UX、i18n 準備、キーボード操作対応

## テスト

```bash
# 単体テスト
pnpm test:unit

# E2Eテスト (Playwright)
pnpm prepare:e2e
pnpm test:e2e
```

> CI (GitHub Actions) では lint → unit → e2e → build の順で実行されます。

## Docker / Compose

```bash
# ビルド
docker build -t brief2plan .
# 起動
docker compose up --build
```

`docker-compose.yml` では `DATABASE_URL=file:./prisma/prod.db` を使用します。必要に応じてボリュームや環境変数を調整してください。

## デプロイ (Vercel / Nitro)

1. `pnpm build` で `.output` を生成
2. Vercel のプロジェクトで Build Command を `pnpm build`、Output Directory を `.output` に設定
3. `DATABASE_URL` や `JWT_SECRET` などの環境変数を Vercel 上に設定

## スクリーンショット / デモ

実行後の画面キャプチャや GIF は `docs/` 配下などに追加してください（本リポジトリにはバイナリ画像を含めていません）。

## ライセンス

[MIT](./LICENSE)
