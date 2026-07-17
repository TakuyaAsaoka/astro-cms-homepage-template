# Astro CMS Homepage Template

Astro + Sveltia CMS で構築する個人ホームページのテンプレートです。
GitHub Pages へのデプロイに対応しています。

## 特徴

- Astro による高速な静的サイト生成
- Sveltia CMS によるブラウザ上でのコンテンツ管理
- GitHub Pages への自動デプロイ（GitHub Actions）
- レスポンシブ対応のベースレイアウト
- SEO対応（OGP / Twitterカード）
- Content Collections によるコンテンツの型安全な管理

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | [Astro](https://astro.build) v6 |
| CMS | [Sveltia CMS](https://github.com/sveltia/sveltia-cms) |
| 言語 | TypeScript（strict モード） |
| デプロイ | GitHub Pages + GitHub Actions |
| Node.js | >= 22.12.0 |

## 使い方

1. GitHub上で「**Use this template**」をクリックして新しいリポジトリを作成
2. リポジトリをクローン

```bash
git clone git@github.com:your-username/your-repo.git
cd your-repo
npm install
```

3. `src/consts.ts` を編集してサイト情報を設定

```typescript
export const SITE_TITLE = "あなたのサイト名";
export const SITE_DESCRIPTION = "サイトの説明";

export const SOCIAL_LINKS = {
  github: "https://github.com/your-username",
  twitter: "",
  youtube: "",
};
export const EMAIL = "you@example.com";
export const SITE_AUTHOR = "Your Name";
```

4. `astro.config.mjs` の `site` と `base` をデプロイ形態に合わせて設定

```javascript
export default defineConfig({
  site: "https://your-username.github.io", // 独自ドメインなら "https://example.com"
  base: "/your-repo", // 形態別の設定は下表を参照
});
```

デプロイ形態によって `base` の値が変わります。

| デプロイ形態 | URL例 | `site` | `base` |
|------------|-------|--------|--------|
| プロジェクトサイト | `your-username.github.io/your-repo/` | `https://your-username.github.io` | `/your-repo` |
| ユーザー/組織サイト | `your-username.github.io/` | `https://your-username.github.io` | `/` |
| 独自ドメイン | `example.com/` | `https://example.com` | `/` |

> `base` を変更したら `public/admin/config.yml` の `public_folder` も同じ値に揃えてください（CMSが挿入する画像パスは自動追従しません）。

5. `public/admin/config.yml` の `repo` を設定（CMS を使う場合）

6. `.github/workflows/deploy.yml` の自動デプロイを有効化

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

> テンプレートではpushトリガーがコメントアウトされています。上記のようにコメントを解除してください。

7. 開発サーバーを起動

```bash
npm run dev
```

## プロジェクト構成

```text
/
├── .github/workflows/      # GitHub Actions（自動デプロイ）
├── docs/                   # ドキュメント
├── public/
│   ├── admin/              # Sveltia CMS 管理画面
│   │   └── config.yml      # CMS設定
│   ├── images/             # 画像ファイル
│   └── favicon.svg
├── src/
│   ├── components/         # 再利用可能なコンポーネント
│   ├── content/            # コンテンツコレクション（Markdown）
│   ├── layouts/            # ページレイアウト
│   ├── pages/              # ページ（ファイルベースルーティング）
│   ├── styles/             # グローバルスタイル
│   ├── consts.ts           # サイト定数
│   └── content.config.ts   # コンテンツスキーマ定義
├── .gitignore
├── astro.config.mjs        # Astro設定
├── CLAUDE.md               # AI開発ルール
├── package.json
└── tsconfig.json           # TypeScript設定
```

## ページ構成

| ページ | パス | 説明 |
|-------|------|------|
| ホーム | `/` | トップページ |
| About | `/about` | 自己紹介 |
| Blog | `/blog` | ブログ記事一覧 |
| Projects | `/projects` | プロジェクト一覧・詳細 |

## コマンド

すべてのコマンドはプロジェクトルートで実行します：

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバーを起動（`localhost:4321`） |
| `npm run build` | プロダクションビルド（`./dist/` に出力） |
| `npm run preview` | ビルド結果をローカルでプレビュー |

## デプロイ

`main` ブランチにpushすると、GitHub Actions により自動的に GitHub Pages へデプロイされます。

> **注意**: テンプレートでは自動デプロイが無効化されています。「使い方」の手順6に従い、ワークフローのpushトリガーを有効化してください。

初回は GitHub リポジトリの Settings → Pages → Source を「GitHub Actions」に設定してください。

> **CSS・画像が読み込まれない場合**: `astro.config.mjs` の `base` がデプロイ形態と合っているか確認してください（プロジェクトサイトは `/your-repo`、ユーザーサイト・独自ドメインは `/`）。

### 独自ドメイン・SSL化

独自ドメインの設定とHTTPS化の手順は [`docs/custom-domain-ssl.md`](docs/custom-domain-ssl.md) を参照してください。

## 参考リンク

- [Astro ドキュメント](https://docs.astro.build)
- [Sveltia CMS ドキュメント](https://github.com/sveltia/sveltia-cms)
