# Home 3セクション実装 + サイト全体季節連動 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Homeページにヒーロー（SeasonalHero）・スキル・Contactの3セクションを実装し、サイト全体のアクセントカラーを訪問時の季節に連動させる（Issue #2）。

**Architecture:** 季節判定は `BaseLayout` の `<head>` 内 `is:inline` スクリプトに一元化し、`<html data-season>` を設定する。SeasonalHero（`season="auto"`）とサイト全体のアクセントカラー（CSS変数 `--season-accent`）の両方がこれを参照する。JS無効時・判定前はデフォルト（春）にフォールバックする。

**Tech Stack:** Astro v6（静的サイト）、TypeScript、素のCSS（CSS変数 + `color-mix()`）

**Spec:** `docs/records/specs/2026-07-08-2-seasonal-hero-home-sections-design.md`

**テストについて:** このプロジェクトにはテストフレームワーク・lint・typecheckが存在しない（`package.json` のscriptsは `dev`/`build`/`preview`/`astro` のみ）。静的表示が主なため、specの検証方針に従い品質ゲートは各タスク後の `npm run build` と、最終タスクでのブラウザ実機確認（Chrome DevTools）とする。TDDのRed-Greenサイクルは適用しない。

**作業ディレクトリ:** すべてのコマンドは worktree `.claude/worktrees/feature-2-home-sections`（ブランチ `feature/2-home-sections`）で実行する。

**月→季節マッピング（唯一の正）:** 12〜2月=winter / 3〜5月=spring / 6〜8月=summer / 9〜11月=autumn。Task 2（BaseLayout）と Task 4（SeasonalHeroフォールバック）の2箇所に同じロジックを実装するため、両者が一致していることを必ず確認する。

---

### Task 1: 素材ファイルのコミット

`SeasonalHero.astro` と使い方ドキュメントはメインリポジトリに未追跡ファイルとして存在するのみ。まず無改変のままworktreeへコピーしてコミットする（以降の変更差分を追いやすくするため）。

**Files:**
- Create: `src/components/SeasonalHero.astro`（メインリポジトリからコピー）
- Create: `src/components/README.md`（メインリポジトリからコピー）

- [ ] **Step 1: 素材をコピー**

```bash
cp /Users/asaokatakuya/SynologyDrive/workspace/private/homepage/src/components/SeasonalHero.astro src/components/
cp /Users/asaokatakuya/SynologyDrive/workspace/private/homepage/src/components/README.md src/components/
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功（素材はまだどこからも参照されていないが、コンパイル対象にはなる）

- [ ] **Step 3: コミット**

```bash
git add src/components/SeasonalHero.astro src/components/README.md
git commit -m "feat: SeasonalHero素材を追加（四季のヒーロー背景アニメーション）"
```

---

### Task 2: BaseLayout — 季節判定の一元化

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: `<head>` に季節判定のインラインスクリプトを追加**

`<BaseHead ... />` の直後に以下を追加する。`is:inline` により初回描画前に実行され、FOUCを防ぐ。

```astro
<script is:inline>
  // 訪問時の月から季節を判定し、サイト全体の季節連動の起点となる data-season を設定する
  // マッピング: 12〜2月=winter / 3〜5月=spring / 6〜8月=summer / 9〜11月=autumn
  const month = new Date().getMonth() + 1;
  document.documentElement.dataset.season =
    month <= 2 || month === 12
      ? "winter"
      : month <= 5
        ? "spring"
        : month <= 8
          ? "summer"
          : "autumn";
</script>
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: 訪問時の月から季節を判定しhtml要素にdata-seasonを設定"
```

---

### Task 3: global.css — 季節アクセントカラーとセクションスタイル

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: CSS変数・共通スタイル・セクションスタイルを追加**

`src/styles/global.css` の末尾に以下を追加する。色値は `SeasonalHero.astro` の `ACCENT` 定数（春 `#e48ca0` / 夏 `#3a9daa` / 秋 `#cf6a2e` / 冬 `#87a3bc`）と同一にする。

```css
/* ===== 季節アクセントカラー（html[data-season] に連動） ===== */
:root {
  --season-accent: #e48ca0; /* デフォルト: 春 */
  /* タグ背景用の淡色はアクセント色から機械的に導出する */
  --season-accent-soft: color-mix(in srgb, var(--season-accent) 15%, white);
}
html[data-season="summer"] {
  --season-accent: #3a9daa;
}
html[data-season="autumn"] {
  --season-accent: #cf6a2e;
}
html[data-season="winter"] {
  --season-accent: #87a3bc;
}

/* full-bleed（100vw）はスクロールバー幅を含むため横スクロールを防ぐ */
html {
  overflow-x: clip;
}

/* 本文中のリンクを季節アクセント色にする */
main a {
  color: var(--season-accent);
}

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
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 1rem;
  color: #333d47;
}
.hero-name {
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.2;
}
.hero-role {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  letter-spacing: 0.05em;
}
.hero-copy {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  opacity: 0.85;
}

/* ===== Homeページ: セクション共通 ===== */
.home-section {
  margin-block: 3rem;
}
.section-heading {
  border-left: 4px solid var(--season-accent);
  padding-left: 0.75rem;
  margin-bottom: 1.25rem;
}

/* ===== Homeページ: スキルタグ ===== */
.skill-tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.skill-tag {
  border: 1px solid var(--season-accent);
  background: var(--season-accent-soft);
  border-radius: 999px;
  padding: 0.25rem 0.875rem;
  font-size: 0.9rem;
}

/* ===== Homeページ: Contact ===== */
.contact-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add src/styles/global.css
git commit -m "feat: 季節アクセントカラーのCSS変数とHomeセクション用スタイルを追加"
```

---

### Task 4: SeasonalHero — `season="auto"` 対応

素材の変更は季節自動切替に必要な最小限に留める（パーティクル挙動・色は変えない）。

**Files:**
- Modify: `src/components/SeasonalHero.astro`

- [ ] **Step 1: Propsに `"auto"` を追加し、背景をCSSへ移動**

frontmatterを以下のように変更する（`BG` 定数を削除し、`season` 型に `"auto"` を追加）:

```astro
---
// SeasonalHero.astro — 四季のヒーロー背景アニメーション(依存なし・素のJS)
// 使い方: <SeasonalHero season="summer" density={1} speed={1} height="600px" />
// season="auto" は訪問時の月で季節を自動判定します(html[data-season] があればそれを優先)。
// 子要素はそのまま前面にスロット表示されます(見出しなど)。
interface Props {
  season?: "spring" | "summer" | "autumn" | "winter" | "auto";
  density?: number; // 0.3〜2 目安
  speed?: number;   // 0.5〜2 目安
  height?: string;
}
const { season = "spring", density = 1, speed = 1, height = "600px" } = Astro.props;
---
```

テンプレートのルート `<div>` の `style` から `background: ${BG[season]};` を除去する:

```astro
<div
  data-seasonal-hero
  data-season={season}
  data-density={density}
  data-speed={speed}
  style={`position: relative; overflow: hidden; height: ${height};`}
>
```

ファイル末尾（`</script>` の後）に季節ごとの背景CSSを追加する。基底ルールが春のフォールバック（`season="auto"` のJS実行前・JS無効時に表示される）を兼ねる:

```astro
<style>
  [data-seasonal-hero] {
    /* フォールバック: 春(data-seasonが未確定の間もこの背景が表示される) */
    background: linear-gradient(160deg, #fdf7f8 0%, #fbecf0 55%, #f8e3ea 100%);
  }
  [data-seasonal-hero][data-season="summer"] {
    background: linear-gradient(160deg, #f4fafb 0%, #e7f3f5 55%, #dcedf0 100%);
  }
  [data-seasonal-hero][data-season="autumn"] {
    background: linear-gradient(160deg, #fcf6ec 0%, #f8ecd9 55%, #f4e2c8 100%);
  }
  [data-seasonal-hero][data-season="winter"] {
    background: linear-gradient(160deg, #f7f9fb 0%, #edf2f7 55%, #e4ebf2 100%);
  }
</style>
```

- [ ] **Step 2: クライアントスクリプトに auto 解決を追加**

`<script>` 内の初期化ループを変更する。`ACCENT` 定数の直後に季節解決の関数を追加:

```typescript
  const SEASONS = ["spring", "summer", "autumn", "winter"];
  // 月→季節: 12〜2月=winter / 3〜5月=spring / 6〜8月=summer / 9〜11月=autumn
  // (BaseLayoutのインラインスクリプトと同一マッピングであること)
  function currentSeason(): string {
    const m = new Date().getMonth() + 1;
    return m <= 2 || m === 12 ? "winter" : m <= 5 ? "spring" : m <= 8 ? "summer" : "autumn";
  }
```

初期化ループの季節取得部分を変更（変更前: `const season = root.dataset.season || "spring";`）:

```typescript
  for (const root of document.querySelectorAll<HTMLElement>("[data-seasonal-hero]")) {
    const layer = root.querySelector<HTMLElement>("[data-sh-layer]")!;
    let season = root.dataset.season || "spring";
    if (season === "auto") {
      // レイアウト層(html[data-season])の判定を優先し、単体利用時は自前判定にフォールバック
      const htmlSeason = document.documentElement.dataset.season;
      season = htmlSeason && SEASONS.includes(htmlSeason) ? htmlSeason : currentSeason();
      root.dataset.season = season; // 背景CSSと今後の参照を確定させる
    }
    const density = parseFloat(root.dataset.density || "1");
    const speed = parseFloat(root.dataset.speed || "1");
```

以降（日輪・tick・reduced-motion処理）は変更しない。

- [ ] **Step 3: マッピング一致の確認**

Task 2 で追加した BaseLayout のインラインスクリプトと、上記 `currentSeason()` の月→季節マッピングが完全に一致していることを目視確認する（唯一の正: 12〜2月=winter / 3〜5月=spring / 6〜8月=summer / 9〜11月=autumn）。

- [ ] **Step 4: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 5: コミット**

```bash
git add src/components/SeasonalHero.astro
git commit -m "feat: SeasonalHeroにseason=\"auto\"を追加し背景を属性セレクタCSSに移動"
```

---

### Task 5: consts.ts — GitHubリンクとメールアドレス

**Files:**
- Modify: `src/consts.ts`

- [ ] **Step 1: 定数を設定・追加**

`SOCIAL_LINKS.github` を設定し、`EMAIL` を追加する:

```typescript
// SNSリンク（使わないものは空文字にする）
export const SOCIAL_LINKS = {
  github: "https://github.com/TakuyaAsaoka",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス
export const EMAIL = "asaoka.biz@gmail.com";
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add src/consts.ts
git commit -m "feat: GitHubリンクを設定し公開用メールアドレス定数を追加"
```

---

### Task 6: index.astro — 3セクションの実装

**Files:**
- Modify: `src/pages/index.astro`（全面書き換え）

- [ ] **Step 1: ページを書き換え**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SeasonalHero from "../components/SeasonalHero.astro";
import { SITE_DESCRIPTION, SOCIAL_LINKS, EMAIL } from "../consts";

// スキルセクションに表示する技術タグ
const skills = [
  "TypeScript",
  "React",
  "Node.js",
  "AWS",
  "Kubernetes",
  "Terraform",
  "Grafana",
  "Prometheus",
];
---

<BaseLayout title="Home" description={SITE_DESCRIPTION}>
  <div class="home-hero">
    <SeasonalHero season="auto" height="70vh">
      <div class="hero-content">
        <h1 class="hero-name">アサオカ タクヤ</h1>
        <p class="hero-role">Software Engineer / SRE</p>
        <p class="hero-copy">つくることと、動かし続けること。</p>
      </div>
    </SeasonalHero>
  </div>

  <section class="home-section">
    <h2 class="section-heading">Skills</h2>
    <ul class="skill-tags">
      {skills.map((skill) => <li class="skill-tag">{skill}</li>)}
    </ul>
  </section>

  <section class="home-section">
    <h2 class="section-heading">Contact</h2>
    <ul class="contact-links">
      <li>
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
      </li>
      <li>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </li>
    </ul>
  </section>
</BaseLayout>
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 3: コミット**

```bash
git add src/pages/index.astro
git commit -m "feat: Homeページにヒーロー・スキル・Contactセクションを実装"
```

---

### Task 7: Header / Footer — アクセント色の季節連動

**Files:**
- Modify: `src/components/Header.astro`（スコープドスタイルのみ）
- Modify: `src/components/Footer.astro`（スコープドスタイルのみ）

- [ ] **Step 1: Headerのnav下線を季節色に**

`Header.astro` の `<style>` 内、`.nav-link.active` を変更し、hoverを追加する:

```css
  .nav-link:hover,
  .nav-link.active {
    text-decoration: underline;
    text-decoration-color: var(--season-accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 6px;
  }
```

（変更前の `.nav-link.active { text-decoration: underline; }` はこのルールに置き換える）

- [ ] **Step 2: FooterのSNSリンクを季節色に**

`Footer.astro` の `<style>` 内に追加する:

```css
  .social-links a {
    color: var(--season-accent);
  }
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功

- [ ] **Step 4: コミット**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat: ヘッダー・フッターのアクセント色を季節に連動"
```

---

### Task 8: ブラウザ実機確認（品質ゲート）

specの検証項目をブラウザで確認する。Chrome DevTools MCP（`mcp__chrome-devtools__*`）を使用する。

- [ ] **Step 1: プレビューサーバー起動**

Run: `npm run build && npm run preview`（バックグラウンド実行）
Expected: `http://localhost:4321` で配信される（`astro.config.mjs` の `base` 設定によりパスが付く場合はそれに従う）

- [ ] **Step 2: Homeページの表示確認**

ブラウザで開き、以下を確認する:

1. 名前「アサオカ タクヤ」・肩書き「Software Engineer / SRE」・一言紹介「つくることと、動かし続けること。」が表示される
2. スキルタグ8個（TypeScript / React / Node.js / AWS / Kubernetes / Terraform / Grafana / Prometheus）が表示される
3. GitHubリンク（https://github.com/TakuyaAsaoka）とメールアドレスが表示され、メールリンクの `href` が `mailto:` で始まる
4. `document.documentElement.dataset.season` が現在の月（7月=summer）に対応し、ヒーローの `data-season` と一致する
5. ヒーローが画面幅いっぱいに表示され、横スクロールが発生しない
6. スキルタグ・見出しマーカー・リンク・ヘッダーnav（hover/active）・フッターのアクセント色が季節色（7月なら青緑 #3a9daa）になっている

- [ ] **Step 3: 他ページ・他季節の確認**

1. Blog・Projectsページでもアクセント色が季節に連動している
2. `evaluate_script` で `document.documentElement.dataset.season = "winter"` 等に書き換え、アクセント色とヒーロー背景（CSSのみ）が追従することを確認する（パーティクルは初期化時の季節のままで良い）

- [ ] **Step 4: prefers-reduced-motion の確認**

CSSエミュレーション（`emulate` ツール）で `prefers-reduced-motion: reduce` を設定してリロードし、ヒーローが静止画（パーティクル固定表示）になることを確認する。

- [ ] **Step 5: スクリーンショットの保存**

Homeページ全体のスクリーンショットを取得し、ユーザーへ共有する。

---

### Task 9: 仕上げ

- [ ] **Step 1: コードレビュー**

@superpowers:requesting-code-review に従いコードレビューを実施し、指摘を修正する。

- [ ] **Step 2: mainの最新を取り込み**

```bash
git fetch origin main && git merge origin/main
```

Expected: コンフリクトなし（あれば解消する）

- [ ] **Step 3: 最終ビルド確認**

Run: `npm run build`
Expected: 成功（warningも0件）

- [ ] **Step 4: PR作成**

Issue #2 を参照するPRを作成する（`Closes #2`）。本文にスコープ拡張（サイト全体の季節連動）の経緯を記載する。

- [ ] **Step 5: マージ後のクリーンアップ（PR承認・マージ後）**

```bash
# メインリポジトリ側に残る未追跡の素材コピーを削除(git pullの衝突防止)
rm /Users/asaokatakuya/SynologyDrive/workspace/private/homepage/src/components/SeasonalHero.astro
rm /Users/asaokatakuya/SynologyDrive/workspace/private/homepage/src/components/README.md
# worktreeとブランチの削除、mainの最新化
cd /Users/asaokatakuya/SynologyDrive/workspace/private/homepage
git worktree remove .claude/worktrees/feature-2-home-sections
git branch -d feature/2-home-sections
git pull
```
