# デザイン刷新（和モダン・エディトリアル）実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Homeページとサイト全体を「和モダン・エディトリアル」デザインに刷新する（明朝見出し＋ゴシック本文、墨色、ヒーロー非対称構図、漢数字セクション見出し、スキルの文字組み、下線リンク）。

**Architecture:** Google Fonts（Shippori Mincho / Zen Kaku Gothic New）をBaseHeadで読み込み、global.cssにフォント・色のCSS変数とタイポグラフィ基盤を定義。ページ・ヘッダー・フッターのマークアップとスタイルを刷新する。季節連動の仕組み（`html[data-season]` と `--season-accent`）は既存のまま利用し、リンクは「墨色文字＋季節色下線」に統一する。

**Tech Stack:** Astro v6（静的サイト）、素のCSS（CSS変数）、Google Fonts

**Spec:** `docs/records/specs/2026-07-09-7-editorial-design-design.md`

**テストについて:** このプロジェクトにはテストフレームワーク・lint・typecheckが無い（`package.json` のscriptsは `dev`/`build`/`preview`/`astro` のみ）。品質ゲートは各タスク後の `npm run build` 成功と、最終タスクのブラウザ実機確認（Chrome DevTools）。TDDのRed-Greenは適用しない。

**作業ディレクトリ:** すべてのコマンドは worktree `.claude/worktrees/feature-7-editorial-design`（ブランチ `feature/7-editorial-design`）で実行する。

**色・書体の定数（唯一の正）:**
- 見出し書体: `Shippori Mincho`（weight 500/600） / 本文書体: `Zen Kaku Gothic New`（weight 400/500/700）
- 墨色 `#2a333c`（本文補助 `#3d474f` / 注釈 `#9aa4ad`）
- 季節アクセント `--season-accent`（春 #e48ca0 / 夏 #3a9daa / 秋 #cf6a2e / 冬 #87a3bc、既存）

---

### Task 1: consts.ts に著者名を追加

**Files:**
- Modify: `src/consts.ts`

- [ ] **Step 1: `SITE_AUTHOR` を追加**

既存の `EMAIL` 定義の下に追加する（他の定数は変更しない）:

```typescript
// 著者名（ヒーロー・フッターで参照）
export const SITE_AUTHOR = "アサオカ タクヤ";
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add src/consts.ts
git commit -m "feat: 著者名の定数SITE_AUTHORを追加"
```

---

### Task 2: BaseHead — Google Fonts 読み込み

**Files:**
- Modify: `src/components/BaseHead.astro`

- [ ] **Step 1: preconnect と stylesheet を追加**

`<link rel="icon" ... />` の行（18行目）の直後に追加する:

```astro
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
/>
```

`display=swap` により、フォント読み込み中もフォールバックフォントで文字が表示される。

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功。`dist/index.html` に fonts.googleapis.com への link が出力されることを確認

- [ ] **Step 3: コミット**

```bash
git add src/components/BaseHead.astro
git commit -m "feat: Google Fonts（Shippori Mincho / Zen Kaku Gothic New）を読み込む"
```

---

### Task 3: global.css — タイポグラフィ基盤とリンク様式

このタスクで、フォント変数・墨色・見出しの明朝化・リンク様式（墨色文字＋季節色下線）を全ページに効かせる。あわせて孤立するCSS変数を削除する。

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: フォント・色の変数を追加し、リセット部を更新**

先頭のリセット（1〜31行目）**のみ**を以下に置き換える。`:root` にフォント・色変数を追加し、`html` にフォントと墨色を適用、見出しの共通スタイルを追加する。

> ⚠️ **注意**: この置き換え対象は1〜31行目まで。その下にある `html, body { overflow-x: clip }` ブロック（52〜58行目相当）は full-bleed ヒーローの横スクロールを防ぐ重要な指定なので、**絶対に巻き込まず、そのまま残すこと**。「先頭のリセット部を広めに書き直す」という解釈は禁止。

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --font-serif: "Shippori Mincho", "Hiragino Mincho ProN", serif;
  --font-sans: "Zen Kaku Gothic New", system-ui, -apple-system, sans-serif;
  --color-ink: #2a333c; /* 墨色: 見出し・本文 */
  --color-ink-soft: #3d474f; /* 本文の補助 */
  --color-muted: #9aa4ad; /* 英字ラベル・注釈 */
}

html {
  font-family: var(--font-sans);
  line-height: 1.7;
  color: var(--color-ink);
}

h1,
h2,
h3 {
  font-family: var(--font-serif);
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 1.4;
}

body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

img {
  max-width: 100%;
  height: auto;
}
```

- [ ] **Step 2: 季節変数から孤立するものを削除**

季節アクセントの `:root` ブロック（現33〜42行目相当）を以下に置き換える。`--season-accent-soft`（丸チップ廃止で不要）と `--season-accent-text`（リンク様式変更で不要）を削除し、`--season-accent` のみ残す:

```css
/* ===== 季節アクセントカラー（html[data-season] に連動） ===== */
:root {
  --season-accent: #e48ca0; /* デフォルト: 春 */
}
```

`html[data-season="summer/autumn/winter"]` の3ブロックはそのまま残す。

- [ ] **Step 3: リンク様式を「墨色文字＋季節色下線」に変更**

`main a`（現60〜63行目相当）を以下に置き換える:

```css
/* 本文リンク: 墨色文字 + 季節色の下線（コントラストは墨色で担保） */
main a {
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-color: var(--season-accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
```

- [ ] **Step 4: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 5: コミット**

```bash
git add src/styles/global.css
git commit -m "feat: フォント変数・墨色・下線リンクのタイポグラフィ基盤を追加し孤立変数を削除"
```

---

### Task 4: index.astro + global.css — ヒーローの非対称構図

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: ヒーローのマークアップを変更**

`src/pages/index.astro` の import に `SITE_AUTHOR` を追加する:

```astro
import { SITE_DESCRIPTION, SOCIAL_LINKS, EMAIL, SITE_AUTHOR } from "../consts";
```

ヒーロー部分（現20〜28行目）を以下に置き換える。左下寄せの構成（肩書き→名前→罫線→コピー）:

```astro
  <div class="home-hero">
    <SeasonalHero season="auto" height="70vh">
      <div class="hero-content">
        <p class="hero-role">SOFTWARE ENGINEER / SRE</p>
        <h1 class="hero-name">{SITE_AUTHOR}</h1>
        <span class="hero-rule" aria-hidden="true"></span>
        <p class="hero-copy">つくることと、動かし続けること。</p>
      </div>
    </SeasonalHero>
  </div>
```

- [ ] **Step 2: ヒーローのスタイルを刷新**

`src/styles/global.css` のヒーロー部分（現65〜95行目相当、`.home-hero` から `.hero-copy` まで）を以下に置き換える。`.home-hero` の full-bleed と `margin-top` は維持し、`.hero-content` を左下寄せに変更する:

```css
/* ===== Homeページ: ヒーロー ===== */
/* main（max-width: 800px, padding: 1rem）を突き抜けて全幅表示する */
.home-hero {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  /* ヘッダー直下に密着させるため main の上パディングを打ち消す */
  margin-top: -1rem;
}
.hero-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  padding: clamp(1.5rem, 5vw, 3.5rem);
  color: var(--color-ink);
}
.hero-role {
  font-family: var(--font-serif);
  font-size: clamp(0.7rem, 1.6vw, 0.85rem);
  letter-spacing: 0.35em;
  color: var(--season-accent);
  margin-bottom: 1rem;
}
.hero-name {
  font-size: clamp(2.2rem, 6vw, 3.4rem);
  letter-spacing: 0.12em;
  line-height: 1.25;
}
.hero-rule {
  width: 52px;
  height: 1px;
  background: var(--color-ink);
  margin: 1.25rem 0;
}
.hero-copy {
  font-family: var(--font-serif);
  font-size: clamp(0.95rem, 2vw, 1.15rem);
  letter-spacing: 0.22em;
}
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 4: コミット**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: ヒーローを左下寄せの非対称構図に刷新"
```

---

### Task 5: index.astro + global.css — セクション見出し・Skills・Contact

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: セクションのマークアップを変更**

`src/pages/index.astro` のSkills・Contactセクション（現30〜47行目）を以下に置き換える。見出しは漢数字＋和文＋英字ラベル、Skillsは `・` 区切り用のリスト、Contactはラベル＋リンク:

```astro
  <section class="home-section">
    <h2 class="section-heading">
      <span class="section-num">壱</span>
      <span class="section-title">技術</span>
      <span class="section-label" aria-hidden="true">SKILLS</span>
    </h2>
    <ul class="skill-list" role="list">
      {skills.map((skill) => <li>{skill}</li>)}
    </ul>
  </section>

  <section class="home-section">
    <h2 class="section-heading">
      <span class="section-num">弐</span>
      <span class="section-title">連絡先</span>
      <span class="section-label" aria-hidden="true">CONTACT</span>
    </h2>
    <ul class="contact-list" role="list">
      <li>
        <span class="contact-label">GITHUB</span>
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">github.com/TakuyaAsaoka</a>
      </li>
      <li>
        <span class="contact-label">EMAIL</span>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </li>
    </ul>
  </section>
```

- [ ] **Step 2: セクション・Skills・Contactのスタイルを刷新**

`src/styles/global.css` のセクション以降（現97〜128行目相当、`.home-section` から `.contact-links` まで）を以下に置き換える。旧 `.section-heading`（左線）・`.skill-tags`/`.skill-tag`（丸チップ）・`.contact-links` を新スタイルに差し替える:

```css
/* ===== Homeページ: セクション共通 ===== */
.home-section {
  margin-block: 4rem;
}
.section-heading {
  display: flex;
  align-items: baseline;
  gap: 0.9em;
  margin-bottom: 1.5rem;
}
.section-num {
  font-size: 0.9em;
  color: var(--season-accent);
}
.section-title {
  letter-spacing: 0.25em;
}
.section-label {
  font-family: var(--font-sans);
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--color-muted);
}

/* ===== Homeページ: スキル（・区切りの文字組み） ===== */
.skill-list {
  list-style: none;
  color: var(--color-ink-soft);
  line-height: 2.4;
  letter-spacing: 0.06em;
}
.skill-list li {
  display: inline;
}
.skill-list li + li::before {
  content: "・";
  color: var(--season-accent);
  margin: 0 0.5em;
}

/* ===== Homeページ: Contact ===== */
.contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.contact-label {
  display: inline-block;
  width: 5em;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  color: var(--color-muted);
}
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 4: コミット**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: セクション見出し・スキル文字組み・Contactを和モダンに刷新"
```

---

### Task 6: Header / Footer — 文字組みの刷新

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Headerのサイト名を明朝・nav字間を調整**

`src/components/Header.astro` の `<style>` 内、`.nav-title` を以下に変更する:

```css
  .nav-title {
    font-family: var(--font-serif);
    font-weight: 600;
    letter-spacing: 0.2em;
    text-decoration: none;
    color: inherit;
  }
```

`.nav-link`（既存）に字間を追加する（`color: inherit;` の行を以下に置き換え）:

```css
  .nav-link {
    font-size: 0.9rem;
    letter-spacing: 0.18em;
    text-decoration: none;
    color: inherit;
  }
```

（`.nav-link:hover, .nav-link:focus-visible, .nav-link.active` の下線様式は既存のまま維持する）

- [ ] **Step 2: Footerに上罫線・SNSリンクの文字組み・コピーライトを変更**

`src/components/Footer.astro` を確認し、`import` に `SITE_AUTHOR` を追加する:

```astro
import { SOCIAL_LINKS, SITE_AUTHOR } from "../consts";
```

コピーライト行（`&copy; {new Date().getFullYear()} All rights reserved.`）を以下に変更する:

```astro
    <p class="copyright">&copy; {new Date().getFullYear()} {SITE_AUTHOR}</p>
```

`<style>` 内、`.footer` に上罫線を追加し、`.social-links a` の色と文字組みを変更、`.copyright` を追加する（既存の `.social-links a { color: var(--season-accent-text); }` は削除して以下に置き換え）:

```css
  .footer {
    padding: 2rem 1rem;
    text-align: center;
    border-top: 1px solid #e7ecef;
  }
  .social-links a {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-muted);
    text-decoration: none;
  }
  .social-links a:hover {
    color: var(--season-accent);
  }
  .copyright {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--color-muted);
  }
```

注: `Footer.astro` の現在の `.social-links a` の色指定は `--season-accent-text` を参照しているが、Task 3でこの変数を削除するため、必ずこのタスクで置き換える（未参照の変数を残さない）。

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功。`grep -r "season-accent-text\|season-accent-soft" src/` で参照が0件であることを確認（孤立変数の完全除去）

- [ ] **Step 4: コミット**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat: ヘッダー・フッターの文字組みを和モダンに刷新"
```

---

### Task 7: ブラウザ実機確認（品質ゲート）

Chrome DevTools MCP（`mcp__chrome-devtools__*`）を使用する。`astro.config.mjs` の `base: "/homepage"` によりURLは `http://localhost:4321/homepage/`。

- [ ] **Step 1: プレビュー起動**

Run: `npm run build && npm run preview`（バックグラウンド）
Expected: `http://localhost:4321/homepage/` で配信

- [ ] **Step 2: タイポグラフィと構図の確認**

Homeページを開き、以下を確認する:

1. 見出し・名前・キャッチコピーが明朝体（Shippori Mincho）、本文・スキルがゴシック体（Zen Kaku Gothic New）で表示される（`getComputedStyle` の `font-family` で確認）
2. 文字色が墨色（`rgb(42, 51, 60)` 付近）
3. ヒーローが左下寄せ（肩書き→名前→罫線→コピーの縦並び、左寄せ）
4. セクション見出しが「壱 技術 SKILLS」「弐 連絡先 CONTACT」
5. スキルが `・` 区切りの文字組み（丸チップでない）
6. Contactがラベル（GITHUB/EMAIL）＋リンク、リンクは墨色文字＋季節色下線
7. リンクの `href`: GitHubが `https://github.com/TakuyaAsaoka`、メールが `mailto:asaoka.biz@gmail.com`

- [ ] **Step 3: 季節連動とコントラストの確認**

1. `document.documentElement.dataset.season` が現在月（7月=summer）に対応
2. `evaluate_script` で `document.documentElement.dataset.season` を spring/autumn/winter に書き換え、漢数字・スキルの区切り点・リンク下線・肩書きの色が追従することを確認
3. リンク文字色が墨色（`rgb(42, 51, 60)`）で、白背景に対しWCAG AA（4.5:1以上）を満たすことを確認

- [ ] **Step 4: 他ページ・レスポンシブ・フォールバックの確認**

1. Blog・Projectsページで見出しが明朝・本文がゴシック・墨色になっている（基盤の適用）
2. `resize_page` で幅375pxにし、ヒーローの非対称構図・セクションが破綻しないことを確認
3. フォント読み込み前の挙動: DevToolsで fonts.gstatic.com をブロックしてリロードし、フォールバック（serif/sans-serif）で文字が読めることを確認（`emulate` の networkConditions か、`take_snapshot` で内容が表示されていることの確認で代替可）

- [ ] **Step 5: スクリーンショットの保存と共有**

Home全体（夏）と、季節を1つ切り替えた状態のスクリーンショットを取得し、ユーザーへ共有する。

---

### Task 8: 仕上げ

- [ ] **Step 1: コードレビュー**

@superpowers:requesting-code-review に従いコードレビューを実施し、指摘を修正する。

- [ ] **Step 2: mainの最新を取り込み**

```bash
git fetch origin main && git merge origin/main
```

Expected: コンフリクトなし（あれば解消）

- [ ] **Step 3: 最終ビルド確認**

Run: `npm run build`
Expected: 成功（warningも0件）

- [ ] **Step 4: PR作成**

Issue #7 を参照するPRを作成する（`Closes #7`）。本文にデザイン刷新の要点（和モダン・エディトリアル、時候ラベルは不採用、リンク様式の変更）を記載する。

- [ ] **Step 5: マージ後のクリーンアップ（PR承認・マージ後）**

```bash
cd /Users/asaokatakuya/SynologyDrive/workspace/private/homepage
git worktree remove .claude/worktrees/feature-7-editorial-design
git branch -d feature/7-editorial-design
git pull
```

その後、後続のアニメーション対応（Issue #8）に着手可能になる。
