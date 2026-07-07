# Home 3セクション実装設計（SeasonalHero組み込み）

- 対象Issue: #2「Homeページにヒーロー・スキル・Contactセクションを実装する」
- 親設計: `docs/superpowers/specs/2026-05-16-home-page-redesign.md`
- 作成日: 2026-07-08

## 概要

Homeページに「ヒーロー・スキル・Contact」の3セクションを実装する。
ヒーローセクションには生成済み素材 `src/components/SeasonalHero.astro`（四季の背景アニメーション）を使用し、訪問者のアクセス時点の月で季節が自動で切り替わるようにする。

さらに、サイト全体（全ページ）の見た目を季節に連動させる。季節判定はレイアウト層（`<html data-season>`）に一元化し、ヒーローのアニメーションとサイト全体のアクセントカラーの両方が同じ判定結果を参照する。

Issue #3（Projectsピックアップ）・#4（Blog最新記事）のセクションは本設計のスコープ外。

## 決定事項

| 項目 | 内容 |
|------|------|
| ヒーロー素材 | `SeasonalHero.astro`（`season="auto"` を新設して使用） |
| 季節の決定 | 訪問時の月でクライアント側判定（12〜2月=冬 / 3〜5月=春 / 6〜8月=夏 / 9〜11月=秋） |
| 全体連動 | 全ページのアクセントカラーを季節に連動（春=ピンク / 夏=青緑 / 秋=橙 / 冬=青灰。SeasonalHeroの `ACCENT` 色と同一） |
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
  - `100vw` はスクロールバー幅を含むため、横スクロール防止として `html` と `body` の両方に `overflow-x: clip` を設定する（`html` のみでは Chrome でスクロール可能な溢れが残ることを実機確認で確認済み）
  - ヒーローはヘッダー直下に密着させる（`main` の上パディング分を負のマージンで打ち消す）
- ヒーロー上の文字色は淡色背景に合わせて濃色系とする（コンポーネントREADMEの推奨に従う）

## 変更内容

### 0. 素材ファイルのコミット（前提）

`SeasonalHero.astro` と使い方ドキュメント `src/components/README.md` は、メインリポジトリの作業ツリーに**未追跡ファイル**として存在するのみで、まだGitにコミットされていない。
実装の最初のステップとして、この2ファイルをメインリポジトリから本Worktreeへコピーし、本ブランチでコミットする。

### 1. 季節判定の一元化 — `src/layouts/BaseLayout.astro`

季節判定はレイアウト層に一元化し、単一の判定結果をヒーローとアクセントカラーの両方が参照する（ヒーローと全体の季節が食い違わないことを保証する）。

- `<head>` 内に `is:inline` スクリプトを置き、訪問者の月から季節を判定して `document.documentElement.dataset.season` を設定する
- インラインスクリプトは初回描画前に実行されるため、アクセントカラーのちらつき（FOUC）は発生しない
- JS無効時は `data-season` が付与されず、CSS変数のデフォルト値（春）が使われる
- 注意: `is:inline` スクリプトはモジュールを import できないため、月→季節のマッピングは BaseLayout とヒーローのフォールバック（変更内容2参照）の2箇所に実装される。決定事項の表のマッピングを唯一の正とし、両実装が一致していることを検証項目に含める

### 2. `src/components/SeasonalHero.astro` — `season="auto"` 対応

素材の変更は季節自動切替に必要な最小限に留める。

- `Props.season` に `"auto"` を追加。既存デフォルト（`spring`）と既存の固定指定の挙動は維持する（後方互換）
- 背景グラデーションをインラインstyleから `[data-seasonal-hero][data-season="..."]` 属性セレクタのCSS（4季節分）へ移動する。これにより `data-season` の書き換えだけで背景が追従する
- `[data-seasonal-hero]` 共通のフォールバック背景として春のグラデーションを設定する。`season="auto"` はJS実行まで季節が未確定のため、JS実行前・JS無効時はこのフォールバックが表示される（パーティクルは元々JS依存のため表示されない）
- クライアントスクリプトの初期化前に、`data-season === "auto"` の場合は `html[data-season]` を参照して季節を確定させる。`html[data-season]` が無い場合（素材を単体で再利用するケース）は自前で月から判定するフォールバックを持つ

代替案として「ビルド時に月から計算（素材無改変）」「ページ側スクリプトによる外部パッチ」を検討したが、前者は再デプロイまで季節が固定され要件を満たさず、後者はスクリプト実行順序に依存して脆いため不採用とした。

### 3. `src/pages/index.astro` — 全面書き換え

- ヒーロー: `<SeasonalHero season="auto" height="70vh">` に名前・肩書き・一言紹介をスロットで配置
- スキル: 見出し + タグチップのリスト（`<ul>` ベース）
- Contact: GitHubリンク（`SOCIAL_LINKS.github`）とメールリンク（`mailto:EMAIL`）

### 4. `src/consts.ts`

- `SOCIAL_LINKS.github` に `https://github.com/TakuyaAsaoka` を設定
- `EMAIL` 定数を新規追加（`asaoka.biz@gmail.com`）

### 5. `src/styles/global.css` — 季節アクセントカラーと共通スタイル

季節ごとのアクセントカラーをCSS変数として定義する。色はSeasonalHeroの `ACCENT` 定数と同一の値を使う。

```css
:root {
  --season-accent: #e48ca0;  /* デフォルト: 春 */
  /* タグ背景用の淡色はアクセント色から機械的に導出する */
  --season-accent-soft: color-mix(in srgb, var(--season-accent) 15%, white);
  /* テキスト用の濃色。アクセント色そのままでは白背景に対しWCAG AAのコントラスト比
     (4.5:1)を満たさないため、文字色には濃色に寄せた導出色を使う。
     混合比50%で全季節がAAを満たす(最悪値: 春 5.00:1) */
  --season-accent-text: color-mix(in srgb, var(--season-accent) 50%, #333d47);
}
html[data-season="summer"] { --season-accent: #3a9daa; }
html[data-season="autumn"] { --season-accent: #cf6a2e; }
html[data-season="winter"] { --season-accent: #87a3bc; }
```

CSS変数の適用先:

- スキルタグチップ（枠線 + 淡色背景）: `--season-accent` / `--season-accent-soft`
- セクション見出しのマーカー、ヘッダーnavの下線（装飾要素）: `--season-accent`
- 本文中のリンク色（Contactリンク含む）とフッターSNSリンク（テキスト）: `--season-accent-text`
- そのほか、セクション余白・full-bleed ユーティリティ・`html { overflow-x: clip }` を追加

### 6. `src/components/Header.astro` / `src/components/Footer.astro`

- ヘッダー: ナビゲーションのアクティブ・ホバー時の下線色を `var(--season-accent)` に変更
- フッター: SNSリンクの色を `var(--season-accent)` に変更
- いずれもスコープドスタイル内の色指定の変更のみで、構造は変えない

## 検証

プロジェクトに test / lint / typecheck スクリプトは存在しないため、以下を品質ゲートとする。

1. `npm run build` が成功すること
2. BaseLayout と SeasonalHero フォールバックの月→季節マッピングが決定事項の表と一致していること（コードレビューで確認）
3. `npm run preview` + ブラウザ確認:
   - 名前・肩書き・一言紹介が表示される
   - スキルタグ8個が表示される
   - GitHubリンクとメールアドレスが表示され、メールリンクが `mailto:` で始まる
   - 季節が現在の月に対応して表示される（`html[data-season]` とヒーローの `data-season` が一致していること）
   - スキルタグ・見出しマーカー・リンク・ヘッダーnav・フッターのアクセント色が季節色になっている
   - Blog・Projectsページでもアクセント色が季節に連動している
   - `prefers-reduced-motion` 時に静止画へフォールバックする

## スコープ外

- Projectsピックアップセクション（Issue #3）
- Blog最新記事セクション（Issue #4）
- SeasonalHero の見た目（色・パーティクル挙動）の調整
- 季節連動の手動切替UI（訪問者が季節を選べる機能）
