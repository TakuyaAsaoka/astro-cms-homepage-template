# Homeアニメーション追加 実装プラン（Issue #8）

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home のヒーロー入場（順次フェードアップ + 罫線が伸びる）とスクロール登場（2段階フェードイン）を、和モダン・エディトリアルの世界観を壊さず、reduced-motion / JS無効でも破綻しない形で追加する。

**Architecture:** 演出を2機構に分離する。(1)ヒーロー入場は純CSS animation（JS不要、`@media (prefers-reduced-motion: reduce)` で無効化）。(2)スクロール登場は `data-reveal` 属性 + IntersectionObserver。FOUC回避のため `js`/`reduced-motion` クラスは BaseLayout の head 内 `<script is:inline>`（既存の `data-season` と同方式・初回ペイント前に同期実行）で付与し、IntersectionObserver 本体は `src/scripts/reveal.ts`（バンドル module）に分離する。

**Tech Stack:** Astro 6（静的サイト）、素のCSS、素のTypeScript（IntersectionObserver）。追加依存なし。

**設計spec:** `docs/records/specs/2026-07-09-8-home-animations-design.md`

---

## テスト方針についての注記

本リポジトリはテストランナー未導入（`package.json` の scripts は dev/build/preview/astro のみ）。したがって自動テストは書かず、**各タスクで `npm run build` の成功 + 開発サーバーでの目視確認**を検証ゲートとする。最終タスクで受け入れ条件の全項目を通しで確認する。

---

## ファイル構成

| ファイル | 役割 | 変更 |
|----------|------|------|
| `src/layouts/BaseLayout.astro` | head inline で `js`/`reduced-motion` フラグ同期付与、body末尾で `reveal.ts` を import | 修正 |
| `src/scripts/reveal.ts` | `[data-reveal]` を IntersectionObserver で監視し一度だけ `.is-visible` 付与 | 新規 |
| `src/styles/global.css` | ヒーロー入場のキーフレーム・stagger、スクロール登場の初期/可視状態、reduced-motion対応 | 修正 |
| `src/pages/index.astro` | 各セクションの見出し・中身に `data-reveal` 付与 | 修正 |

タスクは各々が単体でビルド通過・サイト動作を保つ順序で並べる。

---

### Task 1: head inline で `js` / `reduced-motion` フラグを同期付与する

**Files:**
- Modify: `src/layouts/BaseLayout.astro:20-35`

- [ ] **Step 1: 既存の `<script is:inline>` に フラグ付与ブロックを追加する**

`src/layouts/BaseLayout.astro` の既存 `<script is:inline>`（`data-season` を設定しているブロックの直後、同じ `<script is:inline>` 内）に、以下のブロックを追加する。既存の `data-season` ブロックはそのまま残す。

```js
      // JS有効フラグと reduced-motion フラグを初回ペイント前に同期付与する。
      // これにより「JS無効なら data-reveal 要素が隠れない」「reduced-motion なら
      // CSSレベルで最初から可視」を、ちらつき（FOUC）なく成立させる。
      // ブロックで囲み、グローバルスコープへの束縛を防ぐ（data-season ブロックと同様）。
      {
        const de = document.documentElement;
        de.classList.add("js");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          de.classList.add("reduced-motion");
        }
      }
```

- [ ] **Step 2: ビルドで壊れていないことを確認する**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 3: フラグ付与を目視確認する**

Run: `npm run dev` でサーバーを起動し、ブラウザの DevTools で `<html>` 要素を確認する。
Expected: `<html lang="ja" class="js">`（JS有効時）になっている。DevTools の Rendering パネルで「Emulate CSS prefers-reduced-motion: reduce」を有効にしてリロードすると `class="js reduced-motion"` になる。

- [ ] **Step 4: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: js/reduced-motionフラグをhead inlineで同期付与（#8）"
```

---

### Task 2: ヒーロー入場アニメーション（純CSS）を追加する

**Files:**
- Modify: `src/styles/global.css`（ヒーロー関連セクション: 99-121行付近と、末尾へのキーフレーム追加）

- [ ] **Step 1: `.hero-rule` の初期幅を 0 にする**

`src/styles/global.css` の `.hero-rule` ブロック（111-116行付近）の `width: 52px;` を `width: 0;` に変更する（他のプロパティ height/background/margin はそのまま）。最終幅 52px はアニメーションと reduced-motion 側で担保する。

```css
.hero-rule {
  width: 0;
  height: 1px;
  background: var(--color-ink);
  margin: 1.25rem 0;
}
```

- [ ] **Step 2: ヒーロー入場のキーフレームと stagger を追加する**

`src/styles/global.css` のヒーロー関連セクションの末尾（`.hero-copy` ブロックの直後）に以下を追加する。

```css
/* ===== Homeページ: ヒーロー入場アニメーション ===== */
/* 純CSSのため JS無効でも再生される。SeasonalHero の背景（rAF）とは独立して同時進行する。 */
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes hero-grow-rule {
  from {
    width: 0;
  }
  to {
    width: 52px;
  }
}
.hero-role {
  opacity: 0;
  animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
}
.hero-name {
  opacity: 0;
  animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
}
.hero-rule {
  animation: hero-grow-rule 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards;
}
.hero-copy {
  opacity: 0;
  animation: hero-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.95s forwards;
}

/* reduced-motion: アニメーションを無効化し、最終状態で静止表示する */
@media (prefers-reduced-motion: reduce) {
  .hero-role,
  .hero-name,
  .hero-copy {
    opacity: 1;
    animation: none;
  }
  .hero-rule {
    width: 52px;
    animation: none;
  }
}
```

注意: `.hero-role` は既存で `color`/`margin-bottom` 等を持つ。上記は同名セレクタの後方定義で `opacity`/`animation` を足す形になり、既存プロパティは維持される。

- [ ] **Step 3: ビルドを確認する**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 4: 入場演出を目視確認する**

Run: `npm run dev`
Expected: Home を開くと 肩書き→名前→罫線→キャッチ が時間差で下からふわっと現れ、罫線が左から52pxまで伸びる。DevTools で reduced-motion をエミュレートしてリロードすると、演出なしで最初から全要素が最終状態で表示される。

- [ ] **Step 5: コミット**

```bash
git add src/styles/global.css
git commit -m "feat: ヒーロー入場の順次フェードアップと罫線伸長を追加（#8）"
```

---

### Task 3: スクロール登場の共通スクリプト `reveal.ts` を追加し読み込む

**Files:**
- Create: `src/scripts/reveal.ts`
- Modify: `src/layouts/BaseLayout.astro`（body末尾にバンドル `<script>` を追加）

- [ ] **Step 1: `src/scripts/reveal.ts` を作成する**

```ts
// data-reveal を付けた要素を、ビューポート進入時に一度だけ可視化する。
// js / reduced-motion クラスの付与は BaseLayout の head 内 inline script が担う（初回ペイント前）。
// このスクリプトは監視のみを責務とする。

// reduced-motion 時はCSS側で最初から可視になるため、監視自体を張らない。
const reduced = document.documentElement.classList.contains("reduced-motion");

if (!reduced) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // 一度出たら解除しない
        }
      }
    },
    // 少しスクロールしてから発火させ、初期ビューポート内要素の即時発火を和らげる
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of document.querySelectorAll("[data-reveal]")) {
    observer.observe(el);
  }
}
```

- [ ] **Step 2: BaseLayout から `reveal.ts` を読み込む**

`src/layouts/BaseLayout.astro` の `</body>` 直前（`<Footer />` の後）に、Astro がバンドルする module `<script>`（`is:inline` を付けない）を追加する。

```astro
    <Footer />
    <script>
      import "../scripts/reveal.ts";
    </script>
  </body>
```

- [ ] **Step 3: ビルドを確認する**

Run: `npm run build`
Expected: エラーなく成功する。`reveal.ts` がバンドルされ、まだ `data-reveal` 要素は無いので挙動に変化はない。

- [ ] **Step 4: コミット**

```bash
git add src/scripts/reveal.ts src/layouts/BaseLayout.astro
git commit -m "feat: data-reveal監視の共通スクリプトを追加（#8）"
```

---

### Task 4: スクロール登場のCSS（初期/可視/2段階/reduced-motion）を追加する

**Files:**
- Modify: `src/styles/global.css`（末尾に追加）

この時点ではまだ `data-reveal` 要素が無いため、このCSSは見た目に影響しない（Task 5で有効化される）。

- [ ] **Step 1: スクロール登場のCSSを追加する**

`src/styles/global.css` の末尾に以下を追加する。

```css
/* ===== Homeページ: スクロール登場（data-reveal） ===== */
/* 初期の隠し状態は「JS有効かつ reduced-motion でない」ときのみ適用する。
   → JS無効時は html.js が付かず隠れない。reduced-motion 時はセレクタが外れ最初から可視。 */
html.js:not(.reduced-motion) [data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
html.js:not(.reduced-motion) [data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}
/* 2段階登場: 中身側（data-reveal="delayed"）に遅延を与え、見出し→中身の順にする */
html.js:not(.reduced-motion) [data-reveal="delayed"] {
  transition-delay: 0.23s;
}

/* reduced-motion: 二重の担保（html.reduced-motion で既に可視だが、念のためCSSでも） */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: ビルドを確認する**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 3: コミット**

```bash
git add src/styles/global.css
git commit -m "feat: スクロール登場のCSS（2段階・reduced-motion対応）を追加（#8）"
```

---

### Task 5: index.astro の各セクションに `data-reveal` を付与する

**Files:**
- Modify: `src/pages/index.astro:31-58`

- [ ] **Step 1: Skills セクションに `data-reveal` を付ける**

`src/pages/index.astro` の Skills セクション（31-40行付近）で、見出し `<h2 class="section-heading">` に `data-reveal`、`<ul class="skill-list" ...>` に `data-reveal="delayed"` を付ける。

```astro
  <section class="home-section">
    <h2 class="section-heading" data-reveal>
      <span class="section-num">壱</span>
      <span class="section-title">技術</span>
      <span class="section-label" aria-hidden="true">SKILLS</span>
    </h2>
    <ul class="skill-list" role="list" data-reveal="delayed">
      {skills.map((skill) => <li>{skill}</li>)}
    </ul>
  </section>
```

- [ ] **Step 2: Contact セクションに `data-reveal` を付ける**

Contact セクション（42-58行付近）で、見出し `<h2 class="section-heading">` に `data-reveal`、`<ul class="contact-list" ...>` に `data-reveal="delayed"` を付ける。

```astro
  <section class="home-section">
    <h2 class="section-heading" data-reveal>
      <span class="section-num">弐</span>
      <span class="section-title">連絡先</span>
      <span class="section-label" aria-hidden="true">CONTACT</span>
    </h2>
    <ul class="contact-list" role="list" data-reveal="delayed">
      <!-- 中身はそのまま -->
    </ul>
  </section>
```

- [ ] **Step 3: ビルドを確認する**

Run: `npm run build`
Expected: エラーなく成功する。

- [ ] **Step 4: スクロール登場を目視確認する**

Run: `npm run dev`
Expected: Home を下にスクロールすると、Skills・Contact の各セクションが「見出し → 少し遅れて中身」の2段階で下からふわっと現れる。一度現れた要素は再スクロールしても再生されない。

- [ ] **Step 5: コミット**

```bash
git add src/pages/index.astro
git commit -m "feat: Homeセクションにdata-revealを付与しスクロール登場を有効化（#8）"
```

---

### Task 6: 受け入れ条件の通し検証

**Files:** なし（検証のみ）

- [ ] **Step 1: ビルド最終確認**

Run: `npm run build`
Expected: エラー・警告なく成功する。

- [ ] **Step 2: 受け入れ条件を通しで目視確認する**

`npm run dev` で以下をすべて確認する。

| ケース | 期待結果 |
|--------|----------|
| 正常系（通常表示） | ヒーローが stagger で入場し罫線が伸びる／スクロールで各セクションが2段階フェードイン |
| 異常系（reduced-motion） | DevTools で `prefers-reduced-motion: reduce` をエミュレート→リロード。演出なしで最初から全内容が最終状態で表示される。隠れたままの要素がない |
| 異常系（JS無効） | DevTools で JavaScript を無効化→リロード。ヒーローはCSSで再生され、スクロール登場対象は最初から全部見える（隠れたままにならない） |
| 境界値（モバイル幅） | DevTools のデバイスエミュレート（375px幅等）で、演出・レイアウトが破綻しない |

- [ ] **Step 3: reduced-motion と JS無効を Chrome DevTools MCP で確認する（任意・可能なら）**

`mcp__chrome-devtools__emulate` 等で `prefers-reduced-motion` を切り替え、`take_screenshot` で静止状態を記録する。

- [ ] **Step 4: 検証結果に問題がなければ完了。以降は開発プロセス（コードレビュー → ローカル検証 → PR）へ**

このプランの実装完了後は `~/.claude/CLAUDE.md` の開発プロセス ステップ5以降（コードレビュー、ローカル検証、PR作成）に従う。
