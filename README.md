# ポートフォリオ

このリポジトリは Nuxt 3 で構築した個人ポートフォリオサイトです。

## 技術スタック

- **Nuxt 3 / Vue 3**: モダンなフロントエンドフレームワーク。高速な表示と柔軟なルーティングを実現します。
- **TypeScript**: 型定義によりバグを事前に防ぎ、保守性を高めています。
- **better-sqlite3**: 軽量な SQLite データベースを使い、カード情報や問い合わせ内容を手軽に管理します。
- **サーバー API**: Nuxt のサーバー機能を利用し、ログイン・問い合わせなどの処理を行います。
- **Resend / Google reCAPTCHA**: お問い合わせフォームのメール送信とスパム対策に利用しています。

## こだわり・気を付けている点

- フォーム入力のチェックを徹底し、不正なデータやスパムを防ぎます。
- SQLite を採用することで、セットアップが簡単で導入ハードルが低くなるようにしています。
- 認証情報は HTTP Only クッキーに保存し、ブラウザから直接参照できないようにしています。
- コードは TypeScript で書かれており、将来的な機能追加も見通し良く進められます。

## セットアップ

依存関係をインストールします。

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## 開発サーバー

`http://localhost:3000` で開発サーバーを起動します。

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## 本番ビルド

アプリケーションを本番用にビルドします。

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

ローカルでビルド結果を確認するには:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Nuxt のより詳しいデプロイ方法は [公式ドキュメント](https://nuxt.com/docs/getting-started/deployment) を参照してください。

