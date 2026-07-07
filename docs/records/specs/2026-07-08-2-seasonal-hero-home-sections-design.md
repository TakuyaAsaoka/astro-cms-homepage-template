# Home 3セクション実装設計（SeasonalHero組み込み）

- 対象Issue: #2「Homeページにヒーロー・スキル・Contactセクションを実装する」
- 親設計: `docs/superpowers/specs/2026-05-16-home-page-redesign.md`
- 作成日: 2026-07-08

## 概要

Homeページに「ヒーロー・スキル・Contact」の3セクションを実装する。
ヒーローセクションには生成済み素材 `src/components/SeasonalHero.astro`（四季の背景アニメーション）を使用し、訪問者のアクセス時点の月で季節が自動で切り替わるようにする。

Issue #3（Projectsピックアップ）・#4（Blog最新記事）のセクションは本設計のスコープ外。

## 決定事項

| 項目 | 内容 |
|------|------|
| ヒーロー素材 | `SeasonalHero.astro`（`season="auto"` を新設して使用） |
| 季節の決定 | 訪問時の月でクライアント側判定（12〜2月=冬 / 3〜5月=春 / 6〜8月=夏 / 9〜11月=秋） |
| 名前 | アサオカ タクヤ |
| 肩書き | Software Engineer / SRE |
| 一言紹介 | つくることと、動かし続けること。 |
| スキルタグ | TypeScript / React / Node.js / AWS / Kubernetes / Terraform / Grafana / Prometheus |
| GitHub | https://github.com/TakuyaAsaoka |
| 公開メール | asaoka.biz@gmail.com（`mailto:` リンク） |

## ページ構成

```
┌──────────────────────────────────────┐
│  SeasonalHero（season="auto", 70vh）  │ ← 画面幅いっぱい（full-bleed）
│   アサオカ タクヤ                     │
│   Software Engineer / SRE            │
│   つくることと、動かし続けること。     │
└──────────────────────────────────────┘
│  Skills（800px列内・タグチップ8個）    │
├──────────────────────────────────────┤
│  Contact（GitHubリンク・メール）       │
└──────────────────────────────────────┘
```

- `main` は `max-width: 800px` のため、ヒーローのみ breakout CSS（`width: 100vw; margin-inline: calc(50% - 50vw)`）で全幅表示する
- ヒーロー上の文字色は淡色背景に合わせて濃色系とする（コンポーネントREADMEの推奨に従う）

## 変更内容

### 1. `src/components/SeasonalHero.astro` — `season="auto"` 対応

素材の変更は季節自動切替に必要な最小限に留める。

- `Props.season` に `"auto"` を追加。既存デフォルト（`spring`）と既存の固定指定の挙動は維持する（後方互換）
- 背景グラデーションをインラインstyleから `[data-seasonal-hero][data-season="..."]` 属性セレクタのCSS（4季節分）へ移動する。これにより `data-season` の書き換えだけで背景が追従する
- クライアントスクリプトの初期化前に、`data-season === "auto"` の場合は訪問者の月から季節を判定して `data-season` を確定させる

代替案として「ビルド時に月から計算（素材無改変）」「ページ側スクリプトによる外部パッチ」を検討したが、前者は再デプロイまで季節が固定され要件を満たさず、後者はスクリプト実行順序に依存して脆いため不採用とした。

### 2. `src/pages/index.astro` — 全面書き換え

- ヒーロー: `<SeasonalHero season="auto" height="70vh">` に名前・肩書き・一言紹介をスロットで配置
- スキル: 見出し + タグチップのリスト（`<ul>` ベース）
- Contact: GitHubリンク（`SOCIAL_LINKS.github`）とメールリンク（`mailto:EMAIL`）

### 3. `src/consts.ts`

- `SOCIAL_LINKS.github` に `https://github.com/TakuyaAsaoka` を設定
- `EMAIL` 定数を新規追加（`asaoka.biz@gmail.com`）

### 4. `src/styles/global.css`

- セクション余白・見出しの共通スタイル
- スキルタグチップのスタイル
- Contactリンクのスタイル
- ヒーロー用 full-bleed ユーティリティ

## 検証

プロジェクトに test / lint / typecheck スクリプトは存在しないため、以下を品質ゲートとする。

1. `npm run build` が成功すること
2. `npm run preview` + ブラウザ確認:
   - 名前・肩書き・一言紹介が表示される
   - スキルタグ8個が表示される
   - GitHubリンクとメールアドレスが表示され、メールリンクが `mailto:` で始まる
   - 季節が現在の月に対応して表示される（`data-season` の確認）
   - `prefers-reduced-motion` 時に静止画へフォールバックする

## スコープ外

- Projectsピックアップセクション（Issue #3）
- Blog最新記事セクション（Issue #4）
- SeasonalHero の見た目（色・パーティクル挙動）の調整
