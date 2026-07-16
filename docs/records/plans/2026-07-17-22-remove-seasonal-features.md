# 季節連動機能とSeasonalHeroの削除・中立化 実装プラン（Issue #22）

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** テンプレートから「季節」に依存する2層（サイト全体の季節連動 `html[data-season]` と SeasonalHero コンポーネント）を全廃し、トップページのヒーローを静的なサブトルグラデ背景へ、アクセント色を固定色（`--accent`）へ中立化する（Issue #22）。

**Architecture:** 削除は3段階に分ける。(1)ヒーローの静的化と SeasonalHero 削除（import と実体を同一タスクで消し、常にビルド可能に保つ）、(2)サイト全体の季節連動の削除（BaseLayout の `data-season` 付与と global.css の季節上書きを同一タスクで消す）、(3)`--season-accent` → `--accent` リネーム（定義2箇所と消費6箇所を同一タスクで一括変更し、未定義変数参照を一瞬も作らない）。既定値は現行の春の値（ライト `#e48ca0` / ダーク `#e79aae`）をそのまま固定色として維持するため、見た目は現行の「春」と同一になる。

**Tech Stack:** Astro 6（静的サイト）、素のCSS。依存の追加・削除なし（削除のみの変更）。

**設計spec:** `docs/records/specs/2026-07-17-22-remove-seasonal-features-design.md`

**作業ディレクトリ:** すべてのコマンドは worktree `.claude/worktrees/feature-22`（ブランチ `feature/22-remove-seasonal-features`）で実行する。

---

## テスト方針についての注記

本リポジトリはテストランナー未導入（`package.json` の scripts は dev/build/preview/astro のみ。テスト基盤は #21 で別途構築予定）。したがって自動テストは書かず、**各タスクで `npm run build` の成功 + 最終タスクでのブラウザ実機確認**を検証ゲートとする。

---

## ファイル構成

| ファイル | 役割 | 変更 |
|----------|------|------|
| `src/components/SeasonalHero.astro` | 四季のヒーロー背景アニメ | 削除 |
| `src/components/README.md` | SeasonalHero 専用ドキュメント | 削除 |
| `src/pages/index.astro` | ヒーローを静的な器へ差し替え・import削除 | 修正 |
| `src/styles/global.css` | `.home-hero` に高さ・背景付与、季節上書き削除、変数リネーム、コメント更新 | 修正 |
| `src/layouts/BaseLayout.astro` | is:inline の `data-season` 付与ブロック削除 | 修正 |
| `src/components/Header.astro` | `--season-accent` → `--accent` 追従 | 修正 |
| `src/components/Footer.astro` | `--season-accent` → `--accent` 追従 | 修正 |

タスクは各々が単体でビルド通過・サイト動作（未定義変数参照なし）を保つ順序で並べる。

---

### Task 1: トップページのヒーローを静的化し、SeasonalHero を削除する

import の削除・実体ファイルの削除・`.home-hero` への高さ/背景の付与は相互依存のため、**同一タスクで一括して行う**（importだけ残すとビルドが壊れ、高さ付与を後回しにするとヒーローが潰れる）。

**Files:**
- Modify: `src/pages/index.astro:3,20-29`
- Delete: `src/components/SeasonalHero.astro`
- Delete: `src/components/README.md`
- Modify: `src/styles/global.css:113-120,156`

- [ ] **Step 1: `index.astro` のヒーローを静的な器へ差し替える**

`src/pages/index.astro` の frontmatter から import を削除する:

```diff
 import BaseLayout from "../layouts/BaseLayout.astro";
-import SeasonalHero from "../components/SeasonalHero.astro";
 import { SITE_DESCRIPTION, SOCIAL_LINKS, EMAIL, SITE_AUTHOR } from "../consts";
```

ヒーロー部（20-29行）を SeasonalHero ラッパーなしの静的な器へ差し替える。中身（`.hero-content` とその子要素）は変更しない:

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

- [ ] **Step 2: SeasonalHero の実体と専用ドキュメントを削除する**

```bash
git rm src/components/SeasonalHero.astro src/components/README.md
```

- [ ] **Step 3: `.home-hero` に高さとサブトル縦グラデ背景を付与する**

これまで高さ（`height: 70vh` のインラインstyle）と背景は SeasonalHero が与えていた。`.hero-content` は `height: 100%` で親の高さに依存するため、`.home-hero` 自身へ移す。`src/styles/global.css` の `.home-hero`（115-120行）を以下へ変更する（既存の全幅指定・`margin-top` とコメントは維持）:

```css
.home-hero {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  /* ヘッダー直下に密着させるため main の上パディングを打ち消す */
  margin-top: -1rem;
  /* 高さと背景は旧SeasonalHeroから移設。トークン参照によりダークモードにも自動追従する */
  height: 70vh;
  background: linear-gradient(160deg, var(--color-bg), var(--color-surface));
}
```

- [ ] **Step 4: ヒーロー入場アニメーションのコメントから SeasonalHero への言及を除去する**

`src/styles/global.css` の156行のコメントを更新する:

```diff
 /* ===== Homeページ: ヒーロー入場アニメーション ===== */
-/* 純CSSのため JS無効でも再生される。SeasonalHero の背景（rAF）とは独立して同時進行する。 */
+/* 純CSSのため JS無効でも再生される。 */
```

- [ ] **Step 5: ビルドを確認する**

Run: `npm run build`
Expected: エラー・warningなく成功する。

- [ ] **Step 6: 表示を目視確認する**

Run: `npm run dev`
Expected: トップページに高さ70vhの静的なサブトルグラデのヒーローが全幅表示され、テキストが下端に配置される（`.hero-content` の `justify-content: flex-end`）。入場アニメ（肩書き→名前→罫線→キャッチ）は従来どおり再生される。パーティクル・日輪は表示されない。

- [ ] **Step 7: コミット**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: SeasonalHeroを削除しトップのヒーローを静的グラデ背景へ差し替え（#22）"
```

---

### Task 2: サイト全体の季節連動（`data-season`）を削除する

JS側の付与（BaseLayout）とCSS側の上書き（global.css）は対になっているため、**同一タスクで一括して消す**。

**Files:**
- Modify: `src/layouts/BaseLayout.astro:20-46`
- Modify: `src/styles/global.css:65-73,86-94`

- [ ] **Step 1: BaseLayout の is:inline から `data-season` 付与ブロックを削除する**

`src/layouts/BaseLayout.astro` の `<script is:inline>` 内、`data-season` 付与ブロック（21-34行: コメント2行 + ブロック `{...}`）を削除する。`js` / `reduced-motion` 付与ブロックは維持し、そのコメント末尾の「（data-season ブロックと同様）」という参照だけを除去する。変更後の `<script is:inline>` 全体:

```astro
    <script is:inline>
      // JS有効フラグと reduced-motion フラグを初回ペイント前に同期付与する。
      // これにより「JS無効なら data-reveal 要素が隠れない」「reduced-motion なら
      // CSSレベルで最初から可視」を、ちらつき（FOUC）なく成立させる。
      // ブロックで囲み、グローバルスコープへの束縛を防ぐ。
      {
        const de = document.documentElement;
        de.classList.add("js");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          de.classList.add("reduced-motion");
        }
      }
    </script>
```

- [ ] **Step 2: global.css の季節上書きブロックを削除する**

`src/styles/global.css` から以下の2群を削除する:

ライト側（65-73行）:

```css
html[data-season="summer"] {
  --season-accent: #3a9daa;
}
html[data-season="autumn"] {
  --season-accent: #cf6a2e;
}
html[data-season="winter"] {
  --season-accent: #87a3bc;
}
```

ダーク側（`@media (prefers-color-scheme: dark)` 内の86-94行）:

```css
  html[data-season="summer"] {
    --season-accent: #5cbdca;
  }
  html[data-season="autumn"] {
    --season-accent: #e0904f;
  }
  html[data-season="winter"] {
    --season-accent: #a3bdd4;
  }
```

`--season-accent` の既定値定義（ライト63行 `#e48ca0` / ダーク84行 `#e79aae`）はこの時点では**残す**（消費者がまだ旧名を参照しているため。リネームは Task 3 で一括）。

- [ ] **Step 3: ビルドを確認する**

Run: `npm run build`
Expected: エラー・warningなく成功する。

- [ ] **Step 4: 季節連動が消えたことを目視確認する**

Run: `npm run dev`
Expected: DevTools で `<html>` に `data-season` 属性が付かない（`class="js"` のみ）。リンク下線・見出し番号等のアクセント色は春の既定色のまま表示される。

- [ ] **Step 5: コミット**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "feat: サイト全体の季節連動（data-season付与と季節CSS上書き）を削除（#22）"
```

---

### Task 3: `--season-accent` を `--accent` へリネームする（定義と全消費者を一括）

取りこぼすと未定義変数参照でスタイルが静かに壊れるため、**定義2箇所と消費6箇所を同一タスクで一括変更する**。消費箇所は `grep -rn "season-accent" src/` の全ヒット（global.css 108・135・217・242行、Footer.astro 49行、Header.astro 71行）。

**Files:**
- Modify: `src/styles/global.css`（定義: 61-64行・84行 / 消費: 108・135・217・242行 / コメント: 104行）
- Modify: `src/components/Header.astro:71`
- Modify: `src/components/Footer.astro:49`

- [ ] **Step 1: global.css の定義をリネームし、コメントを固定アクセントの内容へ更新する**

ライト側（61-64行）:

```diff
-/* ===== 季節アクセントカラー（html[data-season] に連動） ===== */
+/* ===== アクセントカラー（リンク下線・見出し番号・強調の固定色） ===== */
 :root {
-  --season-accent: #e48ca0; /* デフォルト: 春 */
+  --accent: #e48ca0;
 }
```

ダーク側（`@media (prefers-color-scheme: dark)` 内 :root、84行）:

```diff
-    --season-accent: #e79aae; /* 春 */
+    --accent: #e79aae;
```

- [ ] **Step 2: global.css 内の消費4箇所をリネームし、104行のコメントを更新する**

```diff
-/* 本文リンク: 墨色文字 + 季節色の下線（コントラストは墨色で担保） */
+/* 本文リンク: 墨色文字 + アクセント色の下線（コントラストは墨色で担保） */
 main a {
   ...
-  text-decoration-color: var(--season-accent);
+  text-decoration-color: var(--accent);
```

同様に `.hero-role`（135行）・`.section-num`（217行）・`.skill-list li + li::before`（242行）の `color: var(--season-accent);` を `color: var(--accent);` へ変更する。

- [ ] **Step 3: Header / Footer の消費を追従させる**

`src/components/Header.astro`（71行）:

```diff
   .nav-link:hover,
   .nav-link:focus-visible,
   .nav-link.active {
     text-decoration: underline;
-    text-decoration-color: var(--season-accent);
+    text-decoration-color: var(--accent);
```

`src/components/Footer.astro`（49行）:

```diff
   .social-links a:hover {
-    color: var(--season-accent);
+    color: var(--accent);
```

- [ ] **Step 4: 季節関連の記述が残っていないことを grep で確認する**

Run: `grep -rn "season\|SeasonalHero\|data-season\|--season-accent" src/`
Expected: ヒット0件。

Run: `grep -rn "季節\|四季" src/`
Expected: ヒット0件（コメント中の日本語の言及も残っていない）。

- [ ] **Step 5: ビルドを確認する**

Run: `npm run build`
Expected: エラー・warningなく成功する。

- [ ] **Step 6: コミット**

```bash
git add src/styles/global.css src/components/Header.astro src/components/Footer.astro
git commit -m "refactor: --season-accentを--accentへリネームし固定アクセント色に（#22）"
```

---

### Task 4: ブラウザ実機確認（品質ゲート）

テスト基盤が未整備（#21）のため、`npm run build` の通過とブラウザ実機確認を品質ゲートとする。Chrome DevTools MCP（`mcp__chrome-devtools__*`）を使用する。

**Files:** なし（検証のみ）

- [ ] **Step 1: プレビューサーバー起動**

Run: `npm run build && npm run preview`（バックグラウンド実行）
Expected: ビルドがエラー・warning 0件で通過し、`http://localhost:4321` で配信される（`astro.config.mjs` の `base` 設定によりパスが付く場合はそれに従う）。

- [ ] **Step 2: specの検証項目を通しで確認する**

| ケース | 期待結果 |
|--------|----------|
| 正常系（トップページ） | 静的なサブトルグラデのヒーロー（70vh・全幅・横スクロールなし）が表示され、テキスト入場アニメが従来どおり再生される |
| 正常系（アクセント色の固定） | `<html>` に `data-season` が無い。`evaluate_script` で `document.documentElement.dataset.season = "winter"` を設定してもリンク下線・見出し番号等の色が変化しない（連動が完全に切れている） |
| 正常系（他ページへの波及なし） | Blog・Projects ページでリンク下線・ヘッダーnav（hover/active）・フッターSNSリンク（hover）のアクセント色が従来（春）と同じ色で表示される |
| 正常系（ダークモード） | `emulate` で `prefers-color-scheme: dark` を設定。ヒーロー背景が藍墨のグラデ（`--color-bg`→`--color-surface`）になり、アクセント色がダーク用の固定色 `#e79aae` になる |
| 異常系（reduced-motion） | `emulate` で `prefers-reduced-motion: reduce` を設定してリロード。ヒーローのテキストが演出なしで最終状態で静止表示される |
| 異常系（JS無効） | JavaScript を無効化してリロード。ヒーローはCSSアニメで再生され、静的背景も表示される（旧SeasonalHeroと違いJSに依存しない） |
| 境界値（モバイル幅） | 375px幅等のエミュレートでヒーロー・セクションのレイアウトが破綻しない |

- [ ] **Step 3: コンソールエラーの確認**

`list_console_messages` で、削除した SeasonalHero 由来のスクリプトエラーや404が出ていないことを確認する。

- [ ] **Step 4: スクリーンショットの保存**

トップページ（ライト/ダーク）のスクリーンショットを取得し、ユーザーへ共有する。

---

### Task 5: 仕上げ

- [ ] **Step 1: コードレビュー**

@superpowers:requesting-code-review に従いコードレビューを実施し、指摘を修正する。

- [ ] **Step 2: mainの最新を取り込み**

```bash
git fetch origin main && git merge origin/main
```

Expected: コンフリクトなし（あれば解消する）。

- [ ] **Step 3: 最終ビルド確認**

Run: `npm run build`
Expected: 成功（エラー・warningとも0件）。

- [ ] **Step 4: PR作成**

Issue #22 を参照するPRを作成する（`Closes #22`）。本文に「#15（ClientRouter対応）の前提となる掃除であり、季節除去により #15 の遷移対応が簡素化される」旨を記載する。

- [ ] **Step 5: マージ後のクリーンアップ（PR承認・マージ後）**

```bash
cd /Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template
git worktree remove .claude/worktrees/feature-22
git branch -d feature/22-remove-seasonal-features
git pull
```
