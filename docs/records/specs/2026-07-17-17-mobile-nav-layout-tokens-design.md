# 設計: モバイルナビと共有レイアウトトークンで整列・レスポンシブを整える

- **Issue**: #17
- **作成日**: 2026-07-17
- **種別**: enhancement（正典テンプレートへの逆輸入）

## 背景と目的

テンプレート利用者が、狭幅表示や整列崩れを自分で直さずに使い始められるように、
homepage リポジトリで実装済みのレイアウト完成度を、正典であるテンプレートへ逆輸入する。
汎用の仕組みのみを対象とし、homepage 固有機能（季節アクセント等）は移植しない。

### 現状の問題（実コードで確認済み）

| 問題 | 実コード上の実態 |
|------|------------------|
| モバイル用ハンバーガーメニューが無い | `Header.astro` は JS を持たず、`.nav-links` が `flex-wrap: wrap` するのみ |
| `max-width: 800px` のハードコードが散在 | `global.css`(main) / `Header.astro`(nav) / `Footer.astro`(footer-inner) の3箇所 |
| 中央寄せの文法がばらばらで左端が揃わない | padding 適用位置が不統一。Header/Footer は max-width 要素の**外側**、main は max-width 要素**自身**に padding → 広幅時に main だけ左端が padding 分（1rem）内側にズレる |
| タグ UI がインライン展開で再利用できない | `ProjectCard.astro` と `pages/projects/[...slug].astro` の**2箇所**に `.tags`/`.tag` が重複展開されている |
| Footer が中央寄せで本文の左揃え規律と不一致 | `.footer{text-align:center}` `.social-links{justify-content:center}` |

## 参照実装

homepage リポジトリ（`/Users/asaokatakuya/SynologyDrive/workspace/private/homepage`）で解決済み。
本設計はその解法を、テンプレートの既存トークン命名にマッピングしながら移植する。

## スコープ

### やること
- Header へのハンバーガーメニュー追加（アクセシビリティ属性・JS 無効フォールバック付き）
- 共有レイアウトトークン（`--content-max-width` / `--content-pad`）の定義と、Header / main / Footer / hero のハードコード幅置換・左端整列
- `TagList.astro` の抽出と、`ProjectCard` および `[...slug].astro` の**両方**からの利用（重複解消）
- Footer のコンテナ整列・両端配置・左揃え化
- `consts.ts` での著者表示名（`SITE_AUTHOR`）と著作権表記名（`COPYRIGHT_HOLDER`）の分離
- レイアウト構造のフル移植（`main` 全幅化 ＋ `.main-inner` ＋ hero スロット）

### やらないこと（スコープ外）
- homepage 固有の季節アクセント（`--season-accent` 等）の移植 → 既存 `--accent` を継続使用
- `reveal.ts` の初期化方式（`initReveal`/`teardownReveal`）への変更 → 現行の直 import 方式を維持
- Breadcrumb コンポーネント（homepage 固有、テンプレートには不要）

## トークン命名マッピング（重要）

homepage のトークンをそのままコピーしてはならない。テンプレートの既存命名体系に合わせる。

| homepage | テンプレートでの扱い |
|----------|----------------------|
| `--content-max-width` / `--content-pad` | **新規追加**（汎用・移植対象） |
| `--color-tag-bg` | 既存の **`--color-surface`** を流用（新規追加しない） |
| `--season-accent` / `--season-accent-text` | 季節機能はスコープ外 → 既存の **`--accent`** にマップ |
| `--color-text-soft` | 本 Issue では不要（TagList 等で使わない） |

## 詳細設計

### 1. `src/styles/global.css`

- `:root` に共有トークンを追加:
  - `--content-max-width: 800px;`
  - `--content-pad: clamp(1.25rem, 5vw, 2rem);`
- `main` を全幅化し、本文幅は新設 `.main-inner` が担う:
  - `main { flex: 1; width: 100%; }`（既存の `max-width`/`margin`/`padding` を除去）
  - `.main-inner { max-width: var(--content-max-width); margin: 0 auto; padding: 1rem var(--content-pad); }`
- ヒーローのフルブリード・ハックを除去:
  - 現状の `.home-hero { width: 100vw; margin-inline: calc(50% - 50vw); margin-top: -1rem; }` を廃止
  - `.home-hero` は全幅背景・アニメーションを保持したまま、内側に `.hero-inner`（`max-width: var(--content-max-width); margin-inline: auto; padding-inline: var(--content-pad);`）を挟み、`.hero-content` を載せて左端を本文と一直線にする
- 本文リンク装飾の基準を変更:
  - `main a { ... }` → `.main-inner a { ... }` に変更（`main` が全幅コンテナになるため、hero 内リンクに本文リンク装飾が乗らないようにする）

### 2. `src/components/Header.astro`（ハンバーガーメニュー）

- マークアップ:
  - `.nav-title` の後に `.menu-toggle`（`<button>`）を追加。属性: `aria-expanded="false"` / `aria-controls="nav-links"` / `aria-label="メニュー"`、内部に `<span class="menu-icon" aria-hidden="true">`
  - `.nav-links` に `id="nav-links"` を付与
- スクリプト（`<script>`）:
  - `astro:page-load` リスナーで `.header` に `.js-enabled` を付与し、`.menu-toggle` のクリックで `aria-expanded` をトグルする
  - ClientRouter 有効環境のため `astro:page-load` は遷移後も発火する
- スコープドスタイル:
  - `.nav` をトークン化（`max-width: var(--content-max-width); margin: 0 auto; padding-inline: var(--content-pad);`）、`.header` は縦 padding のみ
  - ハンバーガーアイコン（`.menu-icon` の 3 本線、`aria-expanded="true"` で×に変形）
  - `@media (max-width: 767px)` で `.js-enabled` 時のみ `.menu-toggle` を表示し `.nav-links` を折り畳む
  - リンク下線色は既存 `--accent` を使用
- **JS 無効時**は `.js-enabled` が付かないため、`.nav-links` は常時表示される（プログレッシブ・エンハンスメント）

### 3. `src/components/Footer.astro`（左揃え・両端配置）

- `COPYRIGHT_HOLDER` を import し、コピーライト表記に使用
- 既存の `Object.entries(SOCIAL_LINKS).filter(([, url]) => url)` 方式は維持
- マークアップ: `.footer-inner` に copyright（先頭）と social-links を配置
- スタイル:
  - `.footer` は縦 padding ＋ `border-top`。`text-align: center` を除去
  - `.footer-inner` を `max-width: var(--content-max-width); margin: 0 auto; padding-inline: var(--content-pad);` ＋ `display: flex; justify-content: space-between;`（© と SNS を両端配置）
  - `.social-links` の `justify-content: center` を除去

### 4. `src/components/TagList.astro`（新規）＋利用箇所

- 新規コンポーネント:
  - Props: `tags: string[]`
  - `tags.length > 0 &&` で `<ul class="tags">` / `<li class="tag">` を描画
  - タグ背景は既存 `--color-surface` を使用
  - 余白（margin）はコンポーネント側で持たず、消費側が `:global(.tags)` で調整する
- `src/components/ProjectCard.astro`:
  - インライン tags を `<TagList tags={tags} />` に置換
  - 旧 `.tags`/`.tag` スタイルを除去し、`.project-card :global(.tags) { margin-top: 0.5rem; }` を追加
- `src/pages/projects/[...slug].astro`:
  - インライン tags を `<TagList tags={project.data.tags} />` に置換
  - 旧 `.tags`/`.tag` スタイルを除去し、`article :global(.tags) { margin: 0.5rem 0; }` を追加

### 5. `src/consts.ts`

- `COPYRIGHT_HOLDER` を新規追加（プレースホルダ値）
- コメントで役割を明記: `SITE_AUTHOR` = 表示名（ヒーロー等）／`COPYRIGHT_HOLDER` = 著作権表記名（Footer）

### 6. `src/layouts/BaseLayout.astro` / `src/pages/index.astro`

- `BaseLayout.astro`:
  - `<main>` を `<slot name="hero" />` ＋ `<div class="main-inner"><slot /></div>` の構造に変更
- `src/pages/index.astro`:
  - `.home-hero` を `slot="hero"` としてヒーロースロットへ移動
  - `.home-hero` 内に `.hero-inner` を挟み、その中に `.hero-content` を置く

## データフロー・インターフェース

- `TagList.astro` は `tags: string[]` を受け取り、空配列時は何も描画しない純粋な表示コンポーネント。内部構造を消費側が知る必要はなく、余白のみ `:global(.tags)` で外側から調整する。
- ハンバーガーの開閉状態は DOM 上の `aria-expanded` を single source of truth とし、CSS の隣接セレクタ（`.menu-toggle[aria-expanded="true"] ~ .nav-links`）で表示を制御する。JS は属性トグルのみを担う。

## エラーハンドリング・エッジケース

- **JS 無効**: `.js-enabled` が付かず、ナビ項目が常時表示される（受け入れ条件）
- **ClientRouter 遷移**: `astro:page-load` で毎遷移後に `.js-enabled` を再付与（`<html>` swap でクラスが失われないよう page-load を使用）
- **狭幅（767px 以下）**: ハンバーガー表示、開閉でナビ項目にアクセス可能
- **SNS リンク未設定**: 空文字は `filter` で除外され、リンクが 0 件なら `<ul>` 自体を描画しない（現行動作を維持）

## テスト計画

- 品質ゲート 4 コマンド（`npm run build && npm run test:run && npm run typecheck && npm run lint`）を warning 0 件で通す
- 既存テスト（`consts.test.ts` / `reveal.test.ts`）への影響を確認する。`COPYRIGHT_HOLDER` 追加が `consts.test.ts` の期待に影響するかを検証し、必要ならテストを正しい形に更新する
- 手動検証:
  - 狭幅でハンバーガーが表示され、開閉でナビ項目にアクセスできる
  - JS 無効時にナビ項目が常時表示される
  - Header / main / Footer / hero の左端ラインが一直線に揃う
  - Footer が左揃え・両端配置になっている
  - プロジェクト一覧・詳細の両方でタグが正しく表示される

## 受け入れ条件（Issue #17）との対応

- [x] `Header` にハンバーガーメニューを追加（`aria-expanded`/`aria-controls`/`aria-label`、JS 無効フォールバック付き） → 詳細設計 2
- [x] `global.css` に共有トークンを定義しハードコード幅を置換 → 詳細設計 1
- [x] タグ UI を `TagList.astro` に抽出し `ProjectCard` から利用 → 詳細設計 4（**加えて `[...slug].astro` からも利用し重複を完全解消**）
- [x] Footer をコンテナ整列・両端配置にし左揃え規律に合わせる → 詳細設計 3
- [x] 著者表示名と著作権表記名を分離する定数を `consts` に用意 → 詳細設計 5
