# モバイルナビと共有レイアウトトークン 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox ( - [ ] ) syntax for tracking.

**Goal:** homepage リポジトリで実装済みのレイアウト完成度（ハンバーガーメニュー・共有レイアウトトークン・左端整列・TagList 抽出・Footer 両端配置）を、正典であるテンプレートへ逆輸入する（Issue #17）。

**Architecture:** `:root` に共有トークン（`--content-max-width` / `--content-pad`）を定義し、Header / main / hero / Footer のすべてを「max-width ＋ 内側 padding」の同一文法に統一して左端ラインを揃える。`main` は全幅コンテナ化し、本文幅は新設 `.main-inner`、ヒーローは `slot="hero"` ＋ `.hero-inner` が担う。ハンバーガーは `aria-expanded` を single source of truth とし、JS は属性トグルのみ・表示制御は CSS（プログレッシブ・エンハンスメント）。タグ UI は `TagList.astro` に抽出し 2 箇所の重複を解消する。

**Tech Stack:** Astro（ClientRouter 有効・スコープドスタイル）、Vitest（`consts.test.ts` / `reveal.test.ts` のみ既存）、素の CSS（カスタムプロパティ）。

---

## 前提・全体方針

- **設計 spec（唯一の正典）**: `docs/records/specs/2026-07-17-17-mobile-nav-layout-tokens-design.md`。本計画はこれに完全準拠する。
- **作業ディレクトリ**: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17`（以下、パスはすべてここ基点の絶対パス）。
- **トークンマッピング（重要）**: homepage のコードを丸写ししない。`--color-tag-bg` → 既存 `--color-surface`、`--season-accent`/`--season-accent-text` → 既存 `--accent`、`--color-text` → 既存 `--color-ink` にマップする。
- **やらないこと（spec 準拠・実装中に混入させない）**:
  - 季節アクセント（`--season-accent`、`data-season`）の移植 → 既存 `--accent` を継続使用
  - `reveal.ts` の初期化方式変更（`initReveal`/`teardownReveal` 化）→ 現行の直 import 方式を維持
  - Breadcrumb コンポーネント（homepage 固有）
  - `--color-text-soft` の追加（本 Issue では不要）
- **テスト方針**:
  - `consts.ts` への定数追加のみ TDD（失敗するテスト → 実装 → パス）。テストケース名は**日本語**。
  - CSS / レイアウト / Astro コンポーネントの見た目変更は vitest で検証しにくいため TDD を当てはめない。各タスクで `npm run build`（成功）＋ `npm run typecheck`（エラー・warning 0 件）＋ 手動確認項目で担保する。
  - ハンバーガー開閉ロジック（`aria-expanded` トグル）は DOM 単体テストが技術的には可能だが、既存にコンポーネント DOM テスト基盤が無い。**基盤を新設しない**（YAGNI）。build / typecheck ＋ 手動確認で担保する。
- **コミット規約**: メッセージは日本語・簡潔。`git add` は変更ファイルを明示列挙（`git add -A` 禁止）。各コミット本文の末尾に必ず以下 2 行を付ける:

```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH
```

- **注意**: Task 2（CSS）と Task 3（HTML 構造）は片方だけではレイアウトが崩れるため、**Task 2 ではコミットせず Task 3 の末尾でまとめて 1 コミット**にする（コミット単位で常に整合した状態を保つ）。

---

### Task 1: `consts.ts` に `COPYRIGHT_HOLDER` を追加（TDD）

`SITE_AUTHOR`（表示名: ヒーロー等）と `COPYRIGHT_HOLDER`（著作権表記名: Footer）の役割を分離する。

**Files:**
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/consts.test.ts`（import 行 2、末尾に describe 追加）
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/consts.ts`（29〜30 行目付近）

- [ ] **Step 1: 失敗するテストを書く**

`src/consts.test.ts` の import（2 行目）に `COPYRIGHT_HOLDER` を追加する:

```typescript
import {
  ensureTrailingSlash,
  BASE_PATH,
  DEFAULT_OG_IMAGE,
  COPYRIGHT_HOLDER,
} from "./consts";
```

ファイル末尾に既存の書式（describe / it、日本語テストケース名）に合わせて追加する:

```typescript
describe("COPYRIGHT_HOLDER", () => {
  it("空でない文字列が定義されている", () => {
    expect(COPYRIGHT_HOLDER.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `npm run test:run -- src/consts.test.ts`
Expected: FAIL（`consts.ts` が `COPYRIGHT_HOLDER` を export していないため、`does not provide an export named 'COPYRIGHT_HOLDER'` 相当のエラー）

- [ ] **Step 3: 最小実装を書く**

`src/consts.ts` の `SITE_AUTHOR` ブロック（29〜30 行目）を以下に置き換える（既存コメントの更新＋新定数追加）:

```typescript
// 著者表示名（ヒーロー等の見せる場所で参照）
export const SITE_AUTHOR = "Your Name";

// 著作権表記名（Footer の © 表記で参照）。表示名と著作権者が異なる場合に
// 個別に変更できるよう SITE_AUTHOR と分離している
export const COPYRIGHT_HOLDER = "Your Name";
```

- [ ] **Step 4: テストを実行してパスを確認する**

Run: `npm run test:run -- src/consts.test.ts`
Expected: PASS（`consts.test.ts` の全 6 テストがパス）

- [ ] **Step 5: コミット**

```bash
git add src/consts.ts src/consts.test.ts
git commit -m "feat: 著者表示名と著作権表記名を分離するCOPYRIGHT_HOLDERを追加（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

---

### Task 2: `global.css` に共有トークン定義・`main` 全幅化・`.main-inner`・`.hero-inner` を追加

**このタスクではコミットしない**（Task 3 で HTML 構造を合わせてから 1 コミットにする）。CSS だけ先に変えると `.main-inner` が存在せず一時的にレイアウトが崩れるが、Task 3 完了時点で整合する。

**Files:**
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/styles/global.css`（:root 9〜22 行目、main 48〜54 行目、main a 86〜93 行目、.home-hero〜.hero-content 95〜115 行目）

- [ ] **Step 1: `:root` に共有トークンを追加する**

`:root` ブロック（9〜22 行目）の `--font-sans` 行の直後に以下 2 行を追加する:

```css
  --content-max-width: 800px; /* 本文・ナビ・フッター共有の最大幅 */
  /* コンテンツの左右パディング。Header / .main-inner / .hero-inner / Footer で共用し、
     全ページの左端ラインを一直線に揃える */
  --content-pad: clamp(1.25rem, 5vw, 2rem);
```

追加後の `:root` 全体は以下になる:

```css
:root {
  color-scheme: light dark; /* ネイティブUI（フォーム/スクロールバー）をテーマ追従 */
  --font-serif: "Shippori Mincho", "Hiragino Mincho ProN", serif;
  --font-sans: "Zen Kaku Gothic New", system-ui, -apple-system, sans-serif;
  --content-max-width: 800px; /* 本文・ナビ・フッター共有の最大幅 */
  /* コンテンツの左右パディング。Header / .main-inner / .hero-inner / Footer で共用し、
     全ページの左端ラインを一直線に揃える */
  --content-pad: clamp(1.25rem, 5vw, 2rem);
  --color-ink: #2a333c; /* 墨色: 見出し・本文 */
  --color-ink-soft: #3d474f; /* 本文の補助 */
  --color-muted: #646d76; /* 英字ラベル・注釈。白背景でWCAG AA(5.26:1)を満たす淡いグレー */
  --color-bg: #ffffff; /* ページ地 */
  --color-surface: #f0f0f0; /* カード・タグ・コード背景 */
  --color-border: #e0e0e0; /* 境界罫 */
  --hero-rule-width: 52px; /* ヒーロー罫線の最終幅 */
  --anim-ease: cubic-bezier(0.22, 1, 0.36, 1); /* 入場・登場共通のイージング */
  --anim-duration: 0.7s; /* フェードの基本デュレーション */
}
```

- [ ] **Step 2: `main` を全幅化し `.main-inner` を新設する**

現在の `main` ブロック（48〜54 行目）:

```css
main {
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
```

を以下に置き換える:

```css
/* main は全幅のままヒーロー（hero スロット）を受け、本文の幅制限は .main-inner が担う */
main {
  flex: 1;
  width: 100%;
}

.main-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 1rem var(--content-pad);
}
```

- [ ] **Step 3: 本文リンク装飾の基準を `.main-inner a` に変更する**

現在のブロック（86〜93 行目）:

```css
/* 本文リンク: 墨色文字 + アクセント色の下線（コントラストは墨色で担保） */
main a {
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
```

を以下に置き換える（`main` が全幅コンテナになるため、hero 内リンクに本文リンク装飾が乗らないよう基準を `.main-inner` に変更）:

```css
/* 本文リンク: 墨色文字 + アクセント色の下線（コントラストは墨色で担保）。
   main は全幅コンテナ（hero を含む）のため、本文コンテナの .main-inner を基準にする */
.main-inner a {
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}
```

- [ ] **Step 4: ヒーローのフルブリード・ハックを除去し `.hero-inner` を新設する**

現在の `.home-hero` 〜 `.hero-content` ブロック（95〜115 行目）:

```css
/* ===== Homeページ: ヒーロー ===== */
/* main（max-width: 800px, padding: 1rem）を突き抜けて全幅表示する */
.home-hero {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  /* ヘッダー直下に密着させるため main の上パディングを打ち消す */
  margin-top: -1rem;
  /* 高さと背景をヒーロー自身に持たせる。トークン参照によりダークモードにも自動追従する */
  height: 70vh;
  background: linear-gradient(160deg, var(--color-bg), var(--color-surface));
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
```

を以下に置き換える:

```css
/* ===== Homeページ: ヒーロー ===== */
/* main は全幅コンテナのため、幅ハック（100vw）なしでヒーロー背景が全幅に広がる。
   高さと背景をヒーロー自身に持たせる。トークン参照によりダークモードにも自動追従する */
.home-hero {
  height: 70vh;
  background: linear-gradient(160deg, var(--color-bg), var(--color-surface));
}
/* ヒーロー内テキストを本文（.main-inner）と同じ幅制限に載せ、左端ラインを全ページで揃える。
   height: 100% は必須（.hero-content が justify-content: flex-end でヒーロー下端に
   本文を固定しているため、高さを継承しないと下端揃えが崩れる） */
.hero-inner {
  height: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding-inline: var(--content-pad);
}
.hero-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  /* 左右 padding は .hero-inner の --content-pad が担う（二重にしない）。
     下端の余白のみ .hero-content が持つ */
  padding-block: 0 clamp(2rem, 6vh, 3.25rem);
  color: var(--color-ink);
}
```

- [ ] **Step 5: ビルドが通ることだけ確認する（コミットはしない）**

Run: `npm run build`
Expected: ビルド成功（この時点では BaseLayout に `.main-inner` が無くレイアウトは一時的に不整合だが、ビルド自体は通る）。**コミットせず Task 3 へ進む。**

---

### Task 3: `BaseLayout.astro` を hero スロット＋`.main-inner` 構造化し、`index.astro` の hero を `slot="hero"` 化

Task 2 の CSS と対になる HTML 構造変更。完了時点で Task 2 と合わせて整合する。

**Files:**
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/layouts/BaseLayout.astro`（53〜55 行目）
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/pages/index.astro`（10〜17 行目）

- [ ] **Step 1: `BaseLayout.astro` の `<main>` を hero スロット＋`.main-inner` 構造に変更する**

現在（53〜55 行目）:

```astro
    <main>
      <slot />
    </main>
```

を以下に置き換える:

```astro
    <main>
      <slot name="hero" />
      <div class="main-inner">
        <slot />
      </div>
    </main>
```

- [ ] **Step 2: `index.astro` のヒーローを `slot="hero"` ＋ `.hero-inner` 構造に変更する**

現在（10〜17 行目）:

```astro
  <div class="home-hero">
    <div class="hero-content">
      <p class="hero-role">YOUR ROLE</p>
      <h1 class="hero-name">{SITE_AUTHOR}</h1>
      <span class="hero-rule" aria-hidden="true"></span>
      <p class="hero-copy">ここにキャッチコピーを入れます。</p>
    </div>
  </div>
```

を以下に置き換える（`slot="hero"` の付与と `.hero-inner` の挿入）:

```astro
  <div class="home-hero" slot="hero">
    <div class="hero-inner">
      <div class="hero-content">
        <p class="hero-role">YOUR ROLE</p>
        <h1 class="hero-name">{SITE_AUTHOR}</h1>
        <span class="hero-rule" aria-hidden="true"></span>
        <p class="hero-copy">ここにキャッチコピーを入れます。</p>
      </div>
    </div>
  </div>
```

- [ ] **Step 3: ビルドと型チェックを実行する**

Run: `npm run build && npm run typecheck`
Expected: 両方成功、エラー・warning 0 件

- [ ] **Step 4: 手動確認（`npm run dev` または `npm run preview`）**

- Home: ヒーロー背景が画面全幅に広がり、ヒーロー内テキスト（YOUR ROLE / 名前）の左端が下のセクション本文（技術・連絡先）の左端と一直線に揃う
- Home: ヒーロー本文がヒーロー（70vh）の**下端**に固定されている（`height: 100%` の継承確認）
- 下層ページ（`/blog/`・`/projects/`・`/about/`）: 本文が中央寄せ・最大 800px で表示され、リンク下線（アクセント色）が従来どおり付く
- 横スクロールが発生しない

- [ ] **Step 5: Task 2 と Task 3 をまとめてコミット**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: 共有レイアウトトークンを定義しmainをmain-inner構造化（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

---

### Task 4: `Header.astro` にハンバーガーメニューを追加

`aria-expanded` を single source of truth とし、JS は属性トグルのみ・表示制御は CSS 隣接セレクタ。JS 無効時は `.js-enabled` が付かず `.nav-links` が常時表示される（プログレッシブ・エンハンスメント）。開閉ロジックの DOM 単体テストは基盤新設になるため書かない（YAGNI）。build / typecheck ＋ 手動確認で担保する。

**Files:**
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/components/Header.astro`（全面書き換え。frontmatter は変更なし）

- [ ] **Step 1: `Header.astro` を以下の内容に全面書き換えする**

frontmatter（`---` 内）は現状のまま変更しない。マークアップ・script・style を以下の完全な形にする:

```astro
---
import { SITE_TITLE, BASE_PATH } from "../consts";

const navItems = [
  { label: "Home", href: BASE_PATH },
  { label: "Blog", href: `${BASE_PATH}blog/` },
  { label: "Projects", href: `${BASE_PATH}projects/` },
];

// active 判定は末尾スラッシュの有無に依存しないよう正規化して比較する
function normalizePath(path: string): string {
  return path.replace(/\/$/, "");
}
const currentPath = normalizePath(Astro.url.pathname);
---

<header class="header">
  <nav class="nav">
    <a href={BASE_PATH} class="nav-title">{SITE_TITLE}</a>
    <button
      class="menu-toggle"
      aria-expanded="false"
      aria-controls="nav-links"
      aria-label="メニュー"
    >
      <span class="menu-icon" aria-hidden="true"></span>
    </button>
    <ul id="nav-links" class="nav-links">
      {
        navItems.map((item) => (
          <li>
            <a
              href={item.href}
              class:list={[
                "nav-link",
                { active: currentPath === normalizePath(item.href) },
              ]}
            >
              {item.label}
            </a>
          </li>
        ))
      }
    </ul>
  </nav>
</header>

<script>
  // JS有効時のみ .js-enabled を付与し、ハンバーガーの表示と開閉を有効化する。
  // JS無効時は .js-enabled が付かず .nav-links が常時表示される
  // （プログレッシブ・エンハンスメント）。
  // 開閉状態は aria-expanded を single source of truth とし、表示制御はCSSが担う。
  // ClientRouter 有効環境のため astro:page-load は遷移後も発火し、
  // 遷移で置換された新しい Header にもリスナーとクラスが再適用される。
  document.addEventListener("astro:page-load", () => {
    const toggle = document.querySelector(".menu-toggle");
    const header = document.querySelector(".header");

    if (toggle && header) {
      header.classList.add("js-enabled");

      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
      });
    }
  });
</script>

<style>
  .header {
    padding: 1rem 0;
  }
  /* .main-inner / .hero-inner と同一構造（max-width＋内側padding）にして左端ラインを揃える */
  .nav {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding-inline: var(--content-pad);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .nav-title {
    font-family: var(--font-serif);
    font-weight: 600;
    letter-spacing: 0.2em;
    text-decoration: none;
    color: inherit;
  }
  .menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    /* ボタンのUA既定色に依存させず、menu-icon の currentColor を文字色に揃える */
    color: inherit;
  }
  .menu-icon,
  .menu-icon::before,
  .menu-icon::after {
    display: block;
    width: 24px;
    height: 2px;
    background: currentColor;
    transition: transform 0.3s;
  }
  .menu-icon {
    position: relative;
  }
  .menu-icon::before,
  .menu-icon::after {
    content: "";
    position: absolute;
    left: 0;
  }
  .menu-icon::before {
    top: -7px;
  }
  .menu-icon::after {
    top: 7px;
  }
  /* 開いている間は中央線を消し、上下線を交差させて × にする */
  .menu-toggle[aria-expanded="true"] .menu-icon {
    background: transparent;
  }
  .menu-toggle[aria-expanded="true"] .menu-icon::before {
    top: 0;
    transform: rotate(45deg);
  }
  .menu-toggle[aria-expanded="true"] .menu-icon::after {
    top: 0;
    transform: rotate(-45deg);
  }
  .nav-links {
    display: flex;
    list-style: none;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .nav-link {
    font-size: 0.9rem;
    letter-spacing: 0.18em;
    text-decoration: none;
    color: inherit;
  }
  .nav-link:hover,
  .nav-link:focus-visible,
  .nav-link.active {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 6px;
  }

  @media (max-width: 767px) {
    /* JS有効（.js-enabled）時のみハンバーガーを出し、ナビを折り畳む */
    .js-enabled .menu-toggle {
      display: block;
    }
    .js-enabled .nav-links {
      display: none;
      width: 100%;
      flex-direction: column;
      gap: 0.5rem;
    }
    .js-enabled .menu-toggle[aria-expanded="true"] ~ .nav-links {
      display: flex;
    }
  }
</style>
```

変更ポイント（差分の要旨）:
- `.header` の padding を `1rem` → `1rem 0`（左右は `.nav` の `--content-pad` が担う）
- `.nav` の `max-width: 800px` → `var(--content-max-width)` ＋ `padding-inline: var(--content-pad)` 追加
- `.menu-toggle`（button）と `.menu-icon`（3 本線 → × 変形）を追加、`.nav-links` に `id="nav-links"` 付与
- `astro:page-load` で `.js-enabled` 付与＋ `aria-expanded` トグルの `<script>` を追加
- `.nav-title` / `.nav-link` の既存タイポグラフィ（letter-spacing 0.2em / 0.18em、focus-visible 対応）は**変更しない**。下線色は既存 `--accent` のまま

- [ ] **Step 2: ビルドと型チェックを実行する**

Run: `npm run build && npm run typecheck`
Expected: 両方成功、エラー・warning 0 件

- [ ] **Step 3: 手動確認（`npm run preview` ＋ ブラウザ）**

- 幅 767px 以下: ハンバーガーが表示され、`.nav-links` が隠れる。クリックで開閉し、アイコンが 3 本線 ⇔ × に変形。`aria-expanded` が `false`/`true` でトグルされる（DevTools で確認）
- 幅 768px 以上: ハンバーガー非表示、ナビ横並び（従来どおり）
- ページ遷移（Home → Blog 等、ClientRouter 経由）後もハンバーガーが動作する
- JS 無効（DevTools > Ctrl+Shift+P > "Disable JavaScript"）: ハンバーガーは出ず、ナビ項目が常時表示される
- Header の左端（サイトタイトル）が本文・ヒーローの左端と一直線に揃う

- [ ] **Step 4: コミット**

```bash
git add src/components/Header.astro
git commit -m "feat: Headerにハンバーガーメニューを追加しnavを共有トークン化（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

---

### Task 5: `Footer.astro` を左揃え・両端配置化し `COPYRIGHT_HOLDER` を参照

JSX の順序を copyright（先頭・左）→ social-links（右）に**並べ替える**（restyle だけでは不十分）。`Object.entries(SOCIAL_LINKS).filter(...)` 方式は維持する。

**Files:**
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/components/Footer.astro`（全面書き換え）

- [ ] **Step 1: `Footer.astro` を以下の内容に全面書き換えする**

```astro
---
import { SOCIAL_LINKS, COPYRIGHT_HOLDER } from "../consts";

const activeLinks = Object.entries(SOCIAL_LINKS).filter(([, url]) => url);
---

<footer class="footer">
  <div class="footer-inner">
    <p class="copyright">&copy; {new Date().getFullYear()} {COPYRIGHT_HOLDER}</p>
    {
      activeLinks.length > 0 && (
        <ul class="social-links">
          {activeLinks.map(([name, url]) => (
            <li>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            </li>
          ))}
        </ul>
      )
    }
  </div>
</footer>

<style>
  .footer {
    padding: 2rem 0;
    border-top: 1px solid var(--color-border);
  }
  /* .main-inner / .hero-inner と同一構造（max-width＋内側padding）にして左端ラインを揃え、
     © と SNS リンクを両端配置する */
  .footer-inner {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding-inline: var(--content-pad);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
  }
  .social-links {
    display: flex;
    list-style: none;
    gap: 1rem;
  }
  .social-links a {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--color-muted);
    text-decoration: none;
  }
  .social-links a:hover {
    color: var(--accent);
  }
  .copyright {
    font-family: var(--font-serif);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: var(--color-muted);
  }
</style>
```

変更ポイント（差分の要旨）:
- import を `SITE_AUTHOR` → `COPYRIGHT_HOLDER` に変更し、© 表記で使用
- JSX 順序を copyright → social-links に並べ替え（© が左、SNS が右）
- `.footer` から `text-align: center` を除去、padding を `2rem 1rem` → `2rem 0`
- `.footer-inner` を `max-width: var(--content-max-width)` ＋ `padding-inline: var(--content-pad)` ＋ flex 両端配置（`justify-content: space-between; align-items: baseline; flex-wrap: wrap;`）
- `.social-links` から `justify-content: center` と `margin-bottom: 1rem` を除去（縦積みでなくなるため）
- タイポグラフィ（font-size / letter-spacing / uppercase / hover 色）は既存のまま

- [ ] **Step 2: ビルドと型チェックを実行する**

Run: `npm run build && npm run typecheck`
Expected: 両方成功、エラー・warning 0 件

- [ ] **Step 3: 手動確認**

- Footer が中央寄せでなくなり、© が左端・SNS リンクが右端に両端配置される
- Footer の © の左端が Header / 本文 / ヒーローの左端と一直線に揃う
- 狭幅で © と SNS が折り返しても崩れない（`flex-wrap: wrap` ＋ gap）
- `consts.ts` の `SOCIAL_LINKS` がすべて空文字のとき `<ul>` 自体が描画されない（現行動作の維持）

- [ ] **Step 4: コミット**

```bash
git add src/components/Footer.astro
git commit -m "feat: FooterをCOPYRIGHT_HOLDER参照の左揃え両端配置に変更（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

---

### Task 6: `TagList.astro` を新規作成し、`ProjectCard.astro` と `[...slug].astro` の重複を解消

TagList は余白（margin）を持たない純粋な表示コンポーネント。余白は消費側が `:global(.tags)` で調整する。タグ背景は既存 `--color-surface`（homepage の `--color-tag-bg` は追加しない）。

**Files:**
- Create: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/components/TagList.astro`
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/components/ProjectCard.astro`（マークアップ 19〜27 行目、スタイル 41〜52 行目）
- Modify: `/Users/asaokatakuya/SynologyDrive/workspace/private/astro-cms-homepage-template/.claude/worktrees/feature-17/src/pages/projects/[...slug].astro`（import・マークアップ 23〜31 行目、スタイル 52〜63 行目）

- [ ] **Step 1: `TagList.astro` を新規作成する**

```astro
---
interface Props {
  tags: string[];
}

const { tags } = Astro.props;
---

{
  tags.length > 0 && (
    <ul class="tags">
      {tags.map((tag) => (
        <li class="tag">{tag}</li>
      ))}
    </ul>
  )
}

<style>
  /* 余白（margin）はコンポーネント側で持たない。消費側が :global(.tags) で調整する */
  .tags {
    display: flex;
    list-style: none;
    gap: 0.5rem;
  }
  .tag {
    font-size: 0.85rem;
    padding: 0.1rem 0.5rem;
    background: var(--color-surface);
    border-radius: 2px;
  }
</style>
```

- [ ] **Step 2: `ProjectCard.astro` を TagList 利用に置き換える**

ファイル全体を以下にする:

```astro
---
import { BASE_PATH } from "../consts";
import TagList from "./TagList.astro";

interface Props {
  title: string;
  description: string;
  tags: string[];
  slug: string;
}

const { title, description, tags, slug } = Astro.props;
---

<article class="project-card">
  <h3>
    <a href={`${BASE_PATH}projects/${slug}/`}>{title}</a>
  </h3>
  <p>{description}</p>
  <TagList tags={tags} />
</article>

<style>
  .project-card {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  .project-card h3 a {
    text-decoration: none;
    color: inherit;
  }
  /* TagList は余白を持たないため、カード内の余白は消費側で与える */
  .project-card :global(.tags) {
    margin-top: 0.5rem;
  }
</style>
```

- [ ] **Step 3: `src/pages/projects/[...slug].astro` を TagList 利用に置き換える**

ファイル全体を以下にする:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import TagList from "../../components/TagList.astro";
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const projects = await getCollection("projects");
  return projects
    .filter((p) => !p.data.draft)
    .map((project) => ({
      params: { slug: project.id },
      props: { project },
    }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<BaseLayout title={project.data.title} description={project.data.description}>
  <article>
    <h1>{project.data.title}</h1>
    <time>{project.data.pubDate.toLocaleDateString("ja-JP")}</time>
    <TagList tags={project.data.tags} />
    {
      project.data.url && (
        <p>
          <a href={project.data.url} target="_blank" rel="noopener noreferrer">
            View Project
          </a>
        </p>
      )
    }
    <div class="content">
      <Content />
    </div>
  </article>
</BaseLayout>

<style>
  time {
    color: var(--color-muted);
    font-size: 0.9rem;
  }
  /* TagList は余白を持たないため、記事内の余白は消費側で与える */
  article :global(.tags) {
    margin: 0.5rem 0;
  }
  .content {
    margin-top: 2rem;
  }
</style>
```

変更ポイント（差分の要旨）:
- インライン tags 展開（`tags.map((tag: string) => ...)` の JSX ブロック）を `<TagList tags={project.data.tags} />` に置換（`tags.length > 0` の分岐は TagList 内部に移動）
- 旧 `.tags` / `.tag` スタイルを除去し、`article :global(.tags) { margin: 0.5rem 0; }` を追加
- `time` / `.content` のスタイルは変更しない

- [ ] **Step 4: ビルドと型チェックを実行する**

Run: `npm run build && npm run typecheck`
Expected: 両方成功、エラー・warning 0 件

- [ ] **Step 5: 手動確認**

- プロジェクト一覧（`/projects/` のカード）と詳細ページの両方で、タグが従来と同じ見た目（surface 背景・0.85rem・角丸 2px）・同じ余白で表示される
- タグが空のプロジェクトで `<ul class="tags">` が描画されない

- [ ] **Step 6: コミット**

```bash
git add src/components/TagList.astro src/components/ProjectCard.astro "src/pages/projects/[...slug].astro"
git commit -m "refactor: タグUIをTagListに抽出しProjectCardと詳細ページの重複を解消（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

---

### Task 7: 品質ゲート（マージ前検証）

**Files:**
- なし（検証のみ。warning が出た場合のみ該当ファイルを修正）

- [ ] **Step 1: 品質ゲート 4 コマンドを実行する**

Run: `npm run build && npm run test:run && npm run typecheck && npm run lint`
Expected: 4 コマンドすべて成功、**エラー・warning 0 件**（`test:run` は `consts.test.ts`（6 件）と `reveal.test.ts` の全テストがパス）

- [ ] **Step 2: warning が出た場合はあるべき姿で修正する**

- 既存・新規を問わず 0 件になるまで修正する。「自分の変更が原因か既存か」で分類しない（唯一の問いは「どう直すか」）
- `as` キャスト等の回避策ではなく、正規の型絞り込み等のあるべき姿で対処する
- フォーマット起因なら `npm run format` で整形する
- 修正した場合は変更ファイルを明示列挙してコミットする:

```bash
git add <修正したファイルを明示列挙>
git commit -m "fix: 品質ゲートの警告を解消（#17）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Sk6DeH2SRPATZmyK57koQH"
```

- [ ] **Step 3: 手動確認の総仕上げ（spec のテスト計画に対応）**

`npm run preview` で以下を最終確認する:

- 狭幅（767px 以下）でハンバーガーが表示され、開閉でナビ項目にアクセスできる
- JS 無効時にナビ項目が常時表示される
- Header / main / Footer / hero の左端ラインが一直線に揃う（広幅・狭幅の両方）
- Footer が左揃え・両端配置になっている
- プロジェクト一覧・詳細の両方でタグが正しく表示される
