# 季節連動機能とSeasonalHeroの削除・中立化 設計

- Issue: #22
- 日付: 2026-07-17
- ステータス: 設計確定

## 概要

テンプレートから「季節」に依存する2層（サイト全体の季節連動と SeasonalHero コンポーネント）を全廃し、季節に依存しない中立な既定へ変更する。トップページのヒーローは、動く季節背景から静的なサブトルグラデ背景へ差し替える。

## 背景

現状テンプレートは「季節」が2層に埋め込まれている。

- **B: サイト全体の季節連動** — `BaseLayout` の is:inline が `<html data-season>` を訪問月から自動付与し、`global.css` が `--season-accent`（リンク下線・見出し・強調テキストのアクセント色）を季節ごとに上書きする。結果、サイト全体のアクセント色が月替わりで変化する。
- **A: SeasonalHero** — 四季のヒーロー背景アニメ（それ自体が「季節」を主題とする部品）。

「大半のサイトはアクセント色を年4回変えたくない」「テンプレの既定は中立であるべき」という方針から、A・B とも削除する。

なお本作業は ClientRouter対応（#15）の前提となる掃除でもある。季節を先に除くことで #15 の遷移対応が大幅に簡素化される（`data-season` 再適用・SeasonalHero 再初期化・rAF管理が不要になる）。

## スコープ

### やること

1. SeasonalHero コンポーネントと専用ドキュメントの削除
2. トップページのヒーローを静的ヒーローへ差し替え
3. サイト全体の季節連動（`data-season` 付与・季節CSS上書き）の削除
4. アクセント変数を季節依存から固定色へリネーム

### やらないこと

- ClientRouter対応（#15 で別途実施。本Issue完了後に着手・本文改訂）
- テスト/typecheck/lint 基盤の構築（#21）
- ヒーロー以外のページ・レイアウトのデザイン変更

## 設計詳細

### 1. コンポーネント削除

- `src/components/SeasonalHero.astro` を削除する。
- `src/components/README.md`（SeasonalHero 専用ドキュメント）を削除する。

### 2. `src/pages/index.astro`

- `import SeasonalHero from "../components/SeasonalHero.astro";` を削除する。
- ヒーローを SeasonalHero ラッパーから静的な器へ差し替える。中身（`.hero-content` とその子要素）は変更しない。

```astro
<div class="home-hero">
  <div class="hero-content">
    <p class="hero-role">SOFTWARE ENGINEER / SRE</p>
    <h1 class="hero-name">{SITE_AUTHOR}</h1>
    <span class="hero-rule" aria-hidden="true"></span>
    <p class="hero-copy">つくることと、動かし続けること。</p>
  </div>
</div>
```

### 3. `src/styles/global.css`

- `.home-hero` に高さとサブトル縦グラデ背景を付与する（既存の全幅指定 `width: 100vw` / `margin-inline` / `margin-top: -1rem` は維持）。

```css
.home-hero {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  margin-top: -1rem;
  height: 70vh;
  background: linear-gradient(160deg, var(--color-bg), var(--color-surface));
}
```

- 季節アクセントの上書きブロックを削除する。
  - ライト: `html[data-season="summer|autumn|winter"]`（65〜73行付近）
  - ダーク: `@media (prefers-color-scheme: dark)` 内の `html[data-season=...]`（86〜94行付近）
- `--season-accent` を `--accent` にリネームする。
  - 既定値はライト（63行）・ダーク（84行）の現行値をそのまま維持する。
  - 消費箇所は `grep -rn "season-accent" src/` の全ヒットを対象とする。**global.css 内（108・135・217・242行）に限らず、`src/components/Footer.astro`（`.social-links a:hover` の `color`）と `src/components/Header.astro`（`.nav-link` の `text-decoration-color`）も追従させる**。取りこぼすと未定義変数参照でスタイルが壊れる。
- 61行のコメント「季節アクセントカラー（html[data-season] に連動）」を、固定アクセントを表す内容へ更新する。
- 156行付近のコメント「純CSSのため…SeasonalHero の背景（rAF）とは独立して…」を、静的ヒーローに合わせて更新する（SeasonalHero への言及を除去）。

### 4. `src/layouts/BaseLayout.astro`

- is:inline スクリプトの `data-season` 付与ブロックを削除する。`js` / `reduced-motion` 付与ブロックは維持する。
- 削除に伴い不要になった季節連動のコメントを除去する。

## 検証

テスト基盤が未整備（#21）のため、`pnpm build` とブラウザ実機で検証する。

- `pnpm build` がエラー・warning 0 件で通過する。
- ブラウザで以下を確認する。
  - リンク・見出し等のアクセント色が固定で、月によって変化しない。
  - トップページに静的なサブトルグラデのヒーローが表示され、テキストの入場アニメが従来どおり再生される。
  - `prefers-reduced-motion` 時にヒーローのテキストが静止表示される。
- `grep -rn "season\|SeasonalHero\|data-season\|--season-accent" src/` で季節関連の記述が残っていないことを確認する（コンテンツ由来の無関係な語を除く）。

## 影響範囲

| ファイル | 変更 |
|---------|------|
| `src/components/SeasonalHero.astro` | 削除 |
| `src/components/README.md` | 削除 |
| `src/pages/index.astro` | ヒーロー差し替え・import削除 |
| `src/styles/global.css` | 季節CSS削除・変数リネーム・`.home-hero` 背景付与・コメント更新 |
| `src/layouts/BaseLayout.astro` | `data-season` 付与削除 |
| `src/components/Footer.astro` | `--season-accent` → `--accent` 追従 |
| `src/components/Header.astro` | `--season-accent` → `--accent` 追従 |
