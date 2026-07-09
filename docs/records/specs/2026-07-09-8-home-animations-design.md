# Homeアニメーション追加 設計（Issue #8）

## 概要

デザイン刷新（#7）で確定した和モダン・エディトリアルの土台の上に「動き」を乗せ、ファーストビューとスクロール体験を豊かにする。過度にせず、落ち着いた世界観を壊さない範囲でリッチな第一印象を作る。

対象は Home（`src/pages/index.astro`）のみ。

## 全体構成

演出を2つの独立した仕組みに分ける。

| 演出 | 方式 | JS依存 | 置き場所 |
|------|------|--------|----------|
| ヒーロー入場 | 純CSS animation（stagger delay） | なし | `src/styles/global.css` |
| スクロール登場 | `data-reveal` + IntersectionObserver | あり | 共通スクリプト（新規） + `src/styles/global.css` |

2つを分離する理由: ヒーロー入場は初回描画時に無条件で走るためJS不要のCSSで完結でき、JS無効環境でも再生される。スクロール登場は「ビューポート進入」の検知が必須のためJS（IntersectionObserver）を用いる。関心を分けることで各々を単純・堅牢に保つ。

## 1. ヒーロー入場

**演出方針**: 順次フェードアップ + 罫線が伸びる（ブレインストーミングA案）。

- 対象要素と順序: `.hero-role` → `.hero-name` → `.hero-rule` → `.hero-copy`
- 各要素は初期状態 `opacity: 0` + `transform: translateY(12px)`（罫線のみ `width: 0`）から、最終状態へアニメーション
- イージング: `cubic-bezier(.22, 1, .36, 1)`（ease-out系。品よく減速する）
- デュレーション: `0.7s`（罫線の伸長は `0.6s`）
- stagger delay: `0.10s`（role）→ `0.35s`（name）→ `0.70s`（rule）→ `0.95s`（copy）
- 純CSSのため、SeasonalHero の背景アニメーション（rAF）とは独立して同時進行する。開いた瞬間に背景の季節演出とヒーローの立ち上がりが重なり、第一印象を強める。

**キーフレーム（方針。実装時に微調整可）**:

- `fadeUp`: `opacity 0→1`, `translateY 12px→0`
- `growRule`: `width 0→52px`（既存の `.hero-rule` 幅に一致）

## 2. スクロール登場

**演出方針**: 2段階（見出しブロック → 少し遅れて中身）（ブレインストーミングB案）。共通の再利用可能な仕組みで実装する（A案: `data-reveal` 方式）。

### 実装を2つに分離する（FOUC回避の要）

CSSの初期隠し状態（`opacity:0`）を成立させるには、その判定フラグ（`js` クラス）が**初回ペイントより前**に付いていなければならない。Astro のバンドル `<script>`（`type="module"` 相当で遅延実行）でフラグを付けると、「一瞬見えてから隠れ、その後 reveal で再表示される」逆FOUC（ちらつき）が起きる。そのため役割を2つに分ける。

**(a) フラグ付与 — `BaseLayout.astro` の head 内 `<script is:inline>`（同期実行）**

既存の `data-season` 判定スクリプト（`src/layouts/BaseLayout.astro` の head 内 `<script is:inline>`）と同じ方式で、初回ペイント前に `<html>` へ以下を同期付与する。

- `js` クラス（JS有効フラグ）
- `prefers-reduced-motion: reduce` にマッチする場合は `reduced-motion` クラス

これにより「JS無効なら `js` が付かず隠れない」「reduced-motion なら CSS レベルで最初から可視」の両方を、ちらつきなく成立させる。

**(b) 監視ロジック — `src/scripts/reveal.ts`（新規・バンドル module）**

`BaseLayout.astro` の `<script>`（バンドル対象）から `import` して読み込む。単体で `<script src>` 参照はしない。

責務（単一目的）: 「`[data-reveal]` を付けた要素を、ビューポート進入時に一度だけ可視化する」。

- `[data-reveal]` 要素を IntersectionObserver で監視し、進入したら `.is-visible` を付与して `unobserve`（**一度出たら解除しない**）
- `reduced-motion` の場合は監視を張らず即リターン（可視化は下記CSSが担うため、JS側で何もしなくても全内容が見える）
- 初期ビューポートに既に入っている要素（ヒーロー直下の最初のセクション等）は observer が即発火して即表示される。これは仕様として許容する。より確実にスクロール後に発火させたい場合は `rootMargin` を負値（例 `0px 0px -10% 0px`）にする方針を実装時に選べる

インターフェース: HTML側は要素に `data-reveal` を付けるだけ。スクリプトの内部実装を変えても利用側は影響を受けない。

### Home 側のマークアップ

各セクション（Skills / Contact）で2段階にする。

- 見出しブロック（`.section-heading`）に `data-reveal`
- 中身（`.skill-list` / `.contact-list`）に `data-reveal`
- CSSで中身側に遅延（約 `0.23s`）を与え、見出し → 中身の2段階を作る

### CSS

- 初期の隠し状態は `html.js:not(.reduced-motion) [data-reveal]` にのみ適用する（`opacity: 0` + `translateY(16px)`）
- `.is-visible` で最終状態へ `transition`（`cubic-bezier(.22,1,.36,1)` / `0.7s`）
- **JS無効時は `html.js` が付かないため初期隠し状態が適用されず、全内容が最初から見える**
- **reduced-motion 時は `html.reduced-motion` により隠し状態のセレクタが外れ、CSSレベルで最初から可視**（JSの発火を待つタイミング窓が生じない）。念のため `@media (prefers-reduced-motion: reduce)` でも `[data-reveal]` を可視・`transition:none` にして二重に担保する

## 3. アクセシビリティ／堅牢性

Issue の受け入れ条件に対応する。

| 条件 | 対応 |
|------|------|
| `prefers-reduced-motion: reduce` | ヒーローは `@media (prefers-reduced-motion: reduce)` で animation を無効化し最終状態を表示。スクロール登場は head inline が付ける `html.reduced-motion` により CSS レベルで最初から可視（JSの発火を待たない） |
| JS無効 | ヒーローはCSSで再生（JS不要）。スクロール登場は `html.js` が付かず初期隠し状態が適用されないため全内容表示 |
| モバイル幅 | 移動量は12〜16pxの微小移動のみ。横方向の移動やレイアウトシフトを伴わないため破綻しない |

## 4. テスト方針

本リポジトリは Astro 静的サイトでテストランナー未導入のため、**ビルド成功 + 手動確認**を品質ゲートとする。

- `npm run build` が成功する
- 手動確認:
  - 正常系: ヒーローの stagger が再生される／スクロールでセクションが2段階でフェードインする
  - 異常系（reduced-motion）: 即座に最終状態で表示される（Chrome DevTools のエミュレートで確認）
  - 異常系（JS無効）: 全コンテンツが表示され、隠れたままの要素がない
  - 境界値（モバイル幅）: 演出が破綻しない

## 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/styles/global.css` | ヒーロー入場のキーフレーム・stagger、スクロール登場の初期/可視状態、reduced-motion対応 |
| `src/scripts/reveal.ts`（新規） | `data-reveal` を IntersectionObserver で監視する共通スクリプト。BaseLayout の `<script>` から `import` する |
| `src/layouts/BaseLayout.astro` | head 内 `<script is:inline>` で `js`・`reduced-motion` クラスを同期付与。バンドル `<script>` から `reveal.ts` を import |
| `src/pages/index.astro` | 各セクションへ `data-reveal` 付与 |

## スコープ外（Issue準拠）

- ホバーの微動（リンク下線が伸びる等）
- 季節トランジション（季節切替時の色変化・パララックス）
- Blog / Projects ページ固有のアニメーション
