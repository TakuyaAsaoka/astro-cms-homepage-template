# テンプレートのダークモード（藍墨）設計（Issue #12）

## 概要

和モダン・エディトリアルデザインのテンプレートに、ダークモードを基盤機能として追加する。切替は OS 設定への自動追従のみ。ダーク配色は「藍墨（あいずみ）」— ライトの墨色（`#2a333c`, 色相 H≈210° の青み）と同じ色相を“地”に反転させ、文字は生成りのオフホワイトにして「墨の中に紙色が浮かぶ」刷り物の質感を作る。全コントラスト WCAG AA を満たす。

このダーク対応の確立後、テンプレートのエディトリアルHome＋アニメーションを姉妹リポジトリ `homepage` へ移植する（homepage #53）。順序: 本Issue → homepage移植。

## 切替方式

`prefers-color-scheme: dark` への**自動追従のみ**。手動トグル・localStorage 永続化・JSによるテーマ適用は行わない。

理由:
- CSS の `@media (prefers-color-scheme: dark)` だけで完結し、**FOUC（ちらつき）が原理的に発生しない**（初回ペイントからブラウザが正しいテーマで描画する）。
- 姉妹 `homepage` リポジトリも同方式のため、移植時に整合する。
- 将来トグル（自動＋手動上書き）への拡張は可能。今回はスコープ外。

## 色トークン設計（`src/styles/global.css`）

### 新設トークン（ライト値）

現状、body に背景指定が無く白背景に依存し、複数箇所に境界・面のハードコード色がある（Footer `#e7ecef`、ProjectCard `#e0e0e0`/`#f0f0f0`、blog `#e0e0e0`/`#666`、projects `#666`/`#f0f0f0`）。これを解消するため背景・境界・面のトークンを新設し、既存ハードコードを集約する。

| トークン | ライト値 | 用途・集約対象 |
|----------|---------|------|
| `--color-bg` | `#ffffff` | ページ地。`body { background: var(--color-bg); }` を追加 |
| `--color-surface` | `#f0f0f0` | カード・タグ・コード背景。ProjectCard/projects の `#f0f0f0` を集約 |
| `--color-border` | `#e0e0e0` | 境界罫。ProjectCard/blog の `#e0e0e0` と Footer の `#e7ecef` を集約（`#e7ecef`→`#e0e0e0` は視覚的にほぼ同一の淡グレーで、トークン統一による軽微な変更として許容） |

`#666`（blog/projects の補助テキスト）は既存の `--color-muted`（`#646d76`）へ集約する（`#666`→`#646d76` は近似色で視覚差ほぼなし）。

既存トークン（`--color-ink` `#2a333c` / `--color-ink-soft` `#3d474f` / `--color-muted` `#646d76` / `--season-accent`）はライト値を維持する。

**ネイティブUI対応**: `:root { color-scheme: light dark; }` を追加し、フォームコントロール・スクロールバー等のブラウザ既定UIもダークに追従させる（トークン差し替えだけでは既定UIがライトのまま残るため）。

### ダーク上書き（`@media (prefers-color-scheme: dark)`）

`:root` 内の全色トークンを藍墨値へ差し替える。

| トークン | ダーク値 | 対背景コントラスト（実測） |
|----------|---------|--------------------------|
| `--color-bg` | `#1b1e24` | — |
| `--color-surface` | `#232730` | — |
| `--color-ink` | `#e8e6e1`（生成り白） | 13.4:1 |
| `--color-ink-soft` | `#c3c1bb` | 9.3:1 |
| `--color-muted` | `#9a9891` | 5.8:1 |
| `--color-border` | `#3a3f48` | 1.6:1（罫は気配程度で意図的に低） |

季節アクセント（`--season-accent`）は現状 `:root`（春デフォルト）＋ `html[data-season="summer|autumn|winter"]` の**4セレクタ**でライト値が定義されている。

| 季節 | ライト | ダーク | 対地コントラスト |
|------|--------|--------|----------------|
| 春（`:root`） | `#e48ca0` | `#e79aae` | 7.7:1 |
| 夏（`html[data-season="summer"]`） | `#3a9daa` | `#5cbdca` | 7.6:1 |
| 秋（`html[data-season="autumn"]`） | `#cf6a2e` | `#e0904f` | 6.6:1 |
| 冬（`html[data-season="winter"]`） | `#87a3bc` | `#a3bdd4` | 8.6:1 |

**重要（詳細度の地雷）**: ダーク上書きは必ず**ライト定義と同一のセレクタ**で行うこと。`@media` はカスケードの詳細度を上げないため、`@media dark { :root { --season-accent: <春ダーク> } }` だけでは `html[data-season="summer"]`（ライト値・詳細度 0,1,1）に負けて**夏でダーク値に切り替わらない**。したがって `@media (prefers-color-scheme: dark)` 内に `:root`（春）と `html[data-season="summer"]` / `[autumn]` / `[winter]` の**4セレクタすべて**を、ライト定義と同じ詳細度で書く。

```css
@media (prefers-color-scheme: dark) {
  :root { --season-accent: #e79aae; /* 春 */ }
  html[data-season="summer"] { --season-accent: #5cbdca; }
  html[data-season="autumn"] { --season-accent: #e0904f; }
  html[data-season="winter"] { --season-accent: #a3bdd4; }
}
```

方針: 明度を1〜2段上げ、彩度は据え置きか微減。ネオン化（彩度上げ）は和の静けさを壊すため禁止。4色すべて本文 AA（4.5:1）超のため、小さな英字ラベルにもそのまま使える。

## 季節ヒーロー（`src/components/SeasonalHero.astro`）

コンポーネント内 `<style>` に4季節の淡いライトグラデ背景（`[data-seasonal-hero][data-season="..."]`）が定義されている。これに `@media (prefers-color-scheme: dark)` 版の夜グラデを追加する。

| 季節 | ダークグラデ（160deg） | イメージ |
|------|----------------------|---------|
| 春 | `#211d23 → #2c222b` | 夜桜（紅梅がかった墨） |
| 夏 | `#17222a → #153039` | 夜の水面 |
| 秋 | `#241e19 → #2e2218` | 熾火のこげ茶 |
| 冬 | `#1b202a → #212c3a` | 雪明かりの藍 |

方針: ライトが「白に淡彩」なら、ダークは「墨に一滴の季節色」。彩度はごく低く、地との差は輝度でなく色相で感じさせる。

パーティクル色・日輪（JS側の `PARTICLE_COLORS` / `ACCENT`）は**現状維持**とする。冬の白・春の桜色・秋の橙・夏の青緑の粒子は暗地でも十分に読め、JS を prefers-color-scheme に反応させる複雑化を避けるため、今回のダーク対応は**ヒーローのCSS背景グラデーションのみ変更**とする。日輪（`ACCENT[season]` を opacity 0.14 で敷く円）もそのまま暗地で成立する。

## コンポーネント修正（ハードコード色のトークン化）

現状のハードコード色を、対応するトークンへ**確定で**置換する（監査で見つかった実在の色。マッピングは前掲）。`#666`→`--color-muted`、`#e0e0e0`/`#e7ecef`→`--color-border`、`#f0f0f0`→`--color-surface`。

| ファイル | 変更 |
|----------|------|
| `src/components/Footer.astro` | `border-top: 1px solid #e7ecef` → `var(--color-border)` |
| `src/components/ProjectCard.astro` | `border: 1px solid #e0e0e0` → `var(--color-border)`、`background: #f0f0f0` → `var(--color-surface)` |
| `src/pages/blog.astro` | `#e0e0e0` → `var(--color-border)`、`#666` → `var(--color-muted)` |
| `src/pages/projects/[...slug].astro` | `#666` → `var(--color-muted)`、`#f0f0f0` → `var(--color-surface)` |
| `src/components/SeasonalHero.astro` | `<style>` に4季節のダーク版グラデ追加 |
| `src/styles/global.css` | トークン新設・`body` 背景適用・`color-scheme: light dark`・`@media dark` 上書き・季節アクセント4セレクタ上書き |

`main a`（本文リンク）は既に `var(--color-ink)` / `var(--season-accent)` を使用しており、ダークは自動対応。`src/components/Header.astro` は監査済み — `color: inherit` とトークンのみでハードコード色が無いため**変更不要**。

## アクセシビリティ / 堅牢性

| 項目 | 対応 |
|------|------|
| コントラスト | 本文3階調・アクセント4色は対地 WCAG AA 以上を実測済み。ヒーローの暗色グラデ各ストップ上の文字（`--color-ink`＝生成り白）は AA 見込みが高いが、**実装後の目視・実測で最終確認する** |
| ライト維持 | トークンのライト値は現行と完全一致に保ち、ライト時の見た目を変えない |
| FOUC | `@media` のみで JS 不使用のため、初回ペイントから正しいテーマ。ちらつき無し |

## テスト方針

テストランナー未導入のため **`npm run build` 成功 + 目視確認**を品質ゲートとする。

- `npm run build` が成功する
- Chrome DevTools の `emulate colorScheme` でライト/ダークを切り替え、4季節ぶんのヒーローとセクションを確認
- 主要な文字/背景・アクセント/地の組み合わせが WCAG AA を満たす
- ライト時の既存デザインが変わらない

## 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/styles/global.css` | 背景・境界・面トークン新設、`body` 背景適用、`color-scheme: light dark`、`@media dark` で全トークン藍墨化、季節アクセント4セレクタ（`:root`＋`html[data-season]`×3）のダーク上書き |
| `src/components/SeasonalHero.astro` | `<style>` に4季節のダーク版グラデ追加 |
| `src/components/Footer.astro` | 境界罫 `#e7ecef` → `var(--color-border)` |
| `src/components/ProjectCard.astro` | `#e0e0e0` → `var(--color-border)`、`#f0f0f0` → `var(--color-surface)` |
| `src/pages/blog.astro` | `#e0e0e0` → `var(--color-border)`、`#666` → `var(--color-muted)` |
| `src/pages/projects/[...slug].astro` | `#666` → `var(--color-muted)`、`#f0f0f0` → `var(--color-surface)` |

`src/components/Header.astro` は監査済み・変更不要（ハードコード色なし）。

## スコープ外

- 手動トグル・テーマ永続化（将来 自動＋トグル へ拡張可）
- ダーク配色に伴うデザイン刷新（あくまで既存エディトリアルのダーク版）
- パーティクル配色のダーク作り込み（JS の prefers-color-scheme 連動）
