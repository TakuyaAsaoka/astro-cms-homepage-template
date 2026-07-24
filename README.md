# Astro CMS Homepage Template

Astro + Sveltia CMS で構築する個人ホームページのテンプレートです。
GitHub Pages へのデプロイに対応しています。

## 提供機能

| カテゴリ | 機能 | 提供価値 |
|---------|------|---------|
| ページ | ホーム | ヒーロー・スキル・連絡先を備えたトップページがすぐ使える |
| ページ | About | 自己紹介・経歴・強み・価値観のセクション構成が用意済み |
| ページ | Blog（note RSS連携） | noteの記事を自動取得して一覧表示。URL未設定時は案内を表示し、取得失敗してもビルドは落ちない |
| ページ | Projects 一覧・詳細 | Markdownを1枚書くだけで実績ページが増える（タグ・公開日順・下書き対応） |
| ページ | 404ページ | noindex付きのエラーページを標準装備 |
| CMS・コンテンツ | Sveltia CMS 管理画面 | ブラウザ（`/admin`）だけで記事の作成・更新ができる。GitHubにコミットとして保存 |
| CMS・コンテンツ | Content Collections + Zodスキーマ | 不正なフロントマターをビルド時に検出。型安全にコンテンツを扱える |
| CMS・コンテンツ | 下書き（draft）機能 | 公開前の記事を本番から自動除外 |
| カスタマイズ | `consts.ts` 一元管理 | サイト名・SNSリンク・著作権者を1ファイルの編集だけで差し替えられる |
| カスタマイズ | デザイントークン | 色・フォント・余白をCSS変数で一元管理。トークンを差し替えるだけでブランド変更できる |
| デザイン | ダークモード | OS設定に自動追従。全カラートークンをダーク用に再設計済み（ネイティブUIも追従） |
| デザイン | レスポンシブ対応 | clamp による流動レイアウト + モバイルはハンバーガーメニュー |
| デザイン | 和文フォント2書体 | 明朝（見出し）× ゴシック（本文）の階層表現を設定済み |
| デザイン | ページ遷移（View Transitions） | ClientRouter によるスムーズなページ遷移。遷移後のスクリプト再初期化も対応済み |
| デザイン | スクロール登場アニメーション | `data-reveal` を付けるだけで適用。JS無効・reduced-motion・スクリプト失敗のどの環境でもコンテンツが隠れたままにならない三重の安全設計 |
| SEO | OGP / Twitterカード | SNSシェア時のプレビューを自動生成。og:image はデフォルト画像に自動フォールバック |
| SEO | canonical URL | `site` 設定から自動生成。重複コンテンツを防止 |
| アクセシビリティ | ARIA属性・セマンティックHTML | メニュー開閉は `aria-expanded` を単一の状態源として管理。装飾要素は `aria-hidden` で除外 |
| アクセシビリティ | WCAG AA コントラスト | ライト・ダーク両モードで補助テキストまでコントラスト比を設計（AA準拠） |
| アクセシビリティ | prefers-reduced-motion 対応 | 視差効果を減らす設定で全アニメーションを静止表示に |
| アクセシビリティ | プログレッシブエンハンスメント | JS無効環境でもナビゲーション・全コンテンツが機能する |
| デプロイ | GitHub Pages ワークフロー同梱 | コメント解除だけでmainへのpush時に自動公開（テンプレート状態では誤デプロイ防止のため無効化） |
| デプロイ | サブパス配信対応 | プロジェクトサイト（`/repo-name/` 配下）でもリンク・画像・OGPが壊れない `base` 追従設計 |
| 開発体験 | Vitest テスト環境 | jsdom + IntersectionObserverモック構築済み。ロジックのテストがすぐ書ける |
| 開発体験 | lint / format / typecheck | ESLint + Prettier + astro check 設定済み（strict TypeScript） |

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
