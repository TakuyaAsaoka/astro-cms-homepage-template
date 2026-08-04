# Astro CMS Homepage Template

Astro + Sveltia CMS で構築する個人ホームページのテンプレートです。
GitHub Pages へのデプロイに対応しています。

## 提供機能

| カテゴリ | 機能 | 提供価値 |
|---------|------|---------|
| ページ | ホーム | ヒーロー・制作（最新3件のピックアップ）・Blog（最新3件）・技術・連絡先を備えたトップページがすぐ使える。ヒーローの文言とスキル一覧はCMSから編集可能 |
| ページ | About | 自己紹介のセクション構成が用意済み。リード文とセクション（追加・削除・並び替え可）はCMSから編集可能 |
| ページ | Blog（note RSS連携） | noteの記事を自動取得して一覧表示。URL未設定時は案内を表示し、取得失敗してもビルドは落ちない |
| ページ | Works 一覧・詳細 | Markdownを1枚書くだけで実績ページが増える（タグ・公開日順・下書き対応） |
| ページ | 404ページ | noindex付きのエラーページを標準装備 |
| CMS・コンテンツ | Sveltia CMS 管理画面 | ブラウザ（`/admin`）だけで Works コンテンツの作成・更新、サイト設定、ページ文言（Home・About）の編集ができる。GitHubにコミットとして保存 |
| CMS・コンテンツ | Content Collections + Zodスキーマ | 不正なフロントマターをビルド時に検出。型安全にコンテンツを扱える |
| CMS・コンテンツ | 下書き（draft）機能 | 公開前のコンテンツを本番から自動除外 |
| カスタマイズ | サイト設定のCMS管理 | サイト名・説明・著者名・著作権表記名・SNSリンク・メールアドレス・note RSS URL を CMS 管理画面（またはYAML 1ファイル）から編集できる。不正なURL・メールアドレスは入力時とビルド時の二段で検出 |
| カスタマイズ | `consts.ts`（技術定数） | 言語・ロケール・タイムゾーンなどビルド設定に紐づく定数を1ファイルで管理 |
| カスタマイズ | 未設定項目の自動非表示 | 空文字にした項目は表示されない。ホームの連絡先（GitHub・メールアドレス）とフッターのSNS一覧は、中身が全て空になるとセクションごと非表示になる。ホームの制作セクション（公開されている制作が0件）とBlogセクション（取得できる記事が0件）も非表示になり、セクション番号（壱・弐・参…）はCSSカウンタで自動的に振り直される |
| カスタマイズ | デザイントークン | 色・フォント・余白をCSS変数で一元管理。トークンを差し替えるだけでブランド変更できる |
| デザイン | ダークモード | OS設定に自動追従。全カラートークンをダーク用に再設計済み（ネイティブUIも追従） |
| デザイン | レスポンシブ対応 | clamp による流動レイアウト + モバイルはハンバーガーメニュー |
| デザイン | 和文フォント2書体 | 明朝（見出し）× ゴシック（本文）の階層表現を設定済み |
| デザイン | ページ遷移（View Transitions） | ClientRouter によるスムーズなページ遷移。遷移後のスクリプト再初期化も対応済み |
| デザイン | スクロール登場アニメーション | `data-reveal` を付けるだけで適用。JS無効・reduced-motion 環境でもコンテンツが隠れない多重の安全設計 |
| SEO | OGP / Twitterカード | SNSシェア時のプレビューを自動生成。og:image はデフォルト画像に自動フォールバック |
| SEO | canonical URL | `site` 設定から自動生成。重複コンテンツを防止 |
| SEO | サイトマップ自動生成 | ビルド時に `sitemap-index.xml`（実体は `sitemap-0.xml`）を生成（`@astrojs/sitemap`）。`site`・`base` 設定に自動追従 |
| アクセシビリティ | ARIA属性・セマンティックHTML | メニュー開閉は `aria-expanded` を単一の状態源として管理。装飾要素は `aria-hidden` で除外 |
| アクセシビリティ | フォーカス可視化の統一 | キーボード操作時のフォーカスリングを `:focus-visible` でサイト横断に適用。文字色トークン基準のため、テーマが変わってもコントラストが保たれる |
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

3. サイト情報を設定

サイト名・説明・著者名などの表示系の設定は `src/content/settings/site.yaml` にあります。CMS 導入後は管理画面の「Site Settings」から編集できます（導入前はファイルを直接編集）。

```yaml
title: あなたのサイト名
description: サイトの説明
author: Your Name # 著者表示名（ヒーロー等）
copyrightHolder: Your Name # 著作権表記名（フッターの © 表記）
email: you@example.com
social:
  github: https://github.com/your-username
  twitter: ""
  youtube: ""
noteRssUrl: "" # note の RSS URL（例: "https://note.com/your-name/rss"）
```

> `social` の各項目と `email` は、空文字にすると表示されません。ホームの連絡先セクションは `social.github` と `email` の両方が、フッターのSNS一覧は `social` の全項目が空文字のとき、セクションごと非表示になります。`noteRssUrl` が空文字の場合、Blogページは設定を促す案内を表示し、ホームの Blog セクションは非表示になります（セクション番号は自動的に振り直されます）。

言語・タイムゾーンなどの技術的な定数は `src/consts.ts` で設定します。

```typescript
export const SITE_LANG = "ja"; // <html lang> と日付の書式に反映
export const SITE_LOCALE = "ja-JP"; // og:locale に反映（言語-地域の2要素）
export const SITE_TIMEZONE = "Asia/Tokyo"; // note RSS の日付表示の基準（Works の公開日は暦日なので影響しない）
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
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── components/         # 再利用可能なコンポーネント
│   ├── content/            # コンテンツコレクション（Works の Markdown・サイト設定/ページ文言の YAML）
│   ├── layouts/            # ページレイアウト
│   ├── lib/                # 公開ルール等の共通ロジック（と そのテスト）
│   ├── pages/              # ページ（ファイルベースルーティング）
│   ├── scripts/            # クライアントスクリプト（スクロール登場処理とテスト）
│   ├── styles/             # グローバルスタイル
│   ├── test/               # テスト用ヘルパー（IntersectionObserverモック）
│   ├── consts.ts           # 技術定数（言語・タイムゾーン等）
│   ├── consts.test.ts      # 技術定数のテスト
│   ├── content.config.ts   # コンテンツスキーマ定義
│   └── site-settings.ts    # サイト設定（CMS管理）の取得
├── .gitignore
├── .prettierignore         # Prettier除外設定
├── .prettierrc.json        # Prettier設定
├── astro.config.mjs        # Astro設定
├── CLAUDE.md               # AI開発ルール
├── eslint.config.js        # ESLint設定
├── package.json
├── tsconfig.json           # TypeScript設定
├── vitest.config.ts        # Vitest設定
└── vitest.setup.ts         # テスト共通セットアップ
```

## ページ構成

| ページ | パス | 説明 |
|-------|------|------|
| ホーム | `/` | トップページ |
| About | `/about` | 自己紹介 |
| Blog | `/blog` | ブログ記事一覧 |
| Works | `/works` | 制作一覧 |
| Works 詳細 | `/works/[slug]` | 制作詳細（Markdown 1件につき1ページ） |
| 404 | `/404`（存在しないパスへのアクセス時） | noindex 付きのエラーページ |

## コマンド

すべてのコマンドはプロジェクトルートで実行します：

| コマンド | 説明 |
| :--- | :--- |
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバーを起動（`localhost:4321`） |
| `npm run build` | プロダクションビルド（`./dist/` に出力） |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm test` | テスト（ウォッチ） |
| `npm run test:run` | テスト（1回実行） |
| `npm run typecheck` | 型チェック（`astro check`） |
| `npm run lint` / `lint:fix` | ESLint 実行 / 自動修正 |
| `npm run format` / `format:check` | Prettier 整形 / 整形チェック |

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
