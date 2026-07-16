# View Transitions(ClientRouter)対応 設計

- Issue: #15
- 日付: 2026-07-17
- ステータス: 設計確定
- 前提: #22（季節連動・SeasonalHero 削除）マージ済み

## 概要

テンプレートに View Transitions（`ClientRouter`）を標準装備する。ClientRouter の遷移は「中身だけ差し替え、バンドル済み `<script>`（module）を再実行しない」ため、遷移後に次が壊れる。これを遷移安全にする。

1. `<html>` の `js` / `reduced-motion` フラグ（head 内 is:inline が実行時付与）が swap で消える
2. `reveal.ts`（登場アニメ）が遷移先で再実行されず、`[data-reveal]` が隠れたまま

## 背景

Astro のバンドル module script は **初回1回だけ実行され、ClientRouter 遷移では再実行されない**。また `<html>` は swap で丸ごと置換されるため、JS で付与したフラグ（`js` / `reduced-motion`）は失われる。`reveal.ts` の登場アニメ用 CSS は `html.js:not(.reduced-motion) [data-reveal]` に依存するため、`js` が失われると遷移後にアニメが機能しない。

季節連動・SeasonalHero は #22 で削除済みのため、本設計の対象は **汎用フラグ（js/reduced-motion）と reveal のみ**。

### Astro 6.3.1 の挙動（ソース確認済み）

- バンドル module script は初回1回のみ実行。遷移時は再実行されない。
- `astro:page-load` は初回ロード（`window.load` 時）と各遷移完了後に発火する。**初回は `window.load`（画像・フォント読込後）** のため、初回描画を待たせないにはトップレベルの即時初期化が必要。
- `astro:after-swap` は新ドキュメントの最初のペイント前に同期発火する（フラグ再適用が FOUC なしで成立）。
- is:inline script は、全ページで内容が同一なら遷移時に再実行されない（`document` に登録したリスナーは swap をまたいで永続する）。

## 設計詳細

### 1. `src/layouts/BaseLayout.astro` — ClientRouter 統合

frontmatter で `ClientRouter` を import し、`<head>` に配置する。

```astro
---
import { ClientRouter } from "astro:transitions";
// ...既存の import
---
<head>
  <BaseHead title={title} description={description} image={image} />
  <ClientRouter />
  <!-- 以降、is:inline フラグスクリプト -->
</head>
```

### 2. `src/layouts/BaseLayout.astro` — フラグの after-swap 再適用

is:inline のフラグ付与を関数化し、**①即実行（FOUC防止）② `astro:after-swap` で再適用**する。`document` は swap で置換されないためリスナーは1回登録で足り、ロジックは単一定義でよい。ブロックで囲みグローバル束縛を防ぐ（既存方針を踏襲）。

```astro
<script is:inline>
  // JS有効フラグと reduced-motion フラグを付与する。
  // <html> は ClientRouter の swap で置換されフラグが消えるため、
  // 初回ペイント前の即時付与に加え、astro:after-swap（新ページのペイント前）で再適用する。
  // この is:inline は全ページで同一内容であること（内容が変わると遷移時に再実行されリスナーが多重登録される）。
  {
    const applyFlags = () => {
      const de = document.documentElement;
      de.classList.add("js");
      de.classList.toggle(
        "reduced-motion",
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };
    applyFlags();
    document.addEventListener("astro:after-swap", applyFlags);
  }
</script>
```

### 3. `src/scripts/reveal.ts` — 三点セット化

初期化を冪等な `initReveal` に関数化し、**①トップレベルで即実行 ② `astro:page-load` で再実行**する。`initReveal` は冒頭で前回の observer を破棄するため、遷移を繰り返しても監視は常に1つ（多重監視しない）。reduced-motion 判定は init 内で行う（遷移ごとに再評価）。`astro:before-swap` での teardown は張らない（冪等 init が後始末を兼ねる）。

```ts
// data-reveal を付けた要素を、ビューポート進入時に一度だけ可視化する。
// ClientRouter 遷移に対応するため初期化を関数化し、初回実行 + astro:page-load で再実行する。
// init は冪等（冒頭で前回の observer を破棄）で、遷移での多重監視を防ぐ。
// js / reduced-motion クラスの付与は BaseLayout の head 内 is:inline が担う。

let observer: IntersectionObserver | null = null;

function initReveal() {
  // 冪等化: 前回の監視を破棄する（遷移での多重監視を防ぐ）。
  observer?.disconnect();
  observer = null;

  // reduced-motion 時はCSS側で最初から可視になるため、監視自体を張らない。
  if (document.documentElement.classList.contains("reduced-motion")) return;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // 一度出たら解除する
        }
      }
    },
    // 少しスクロールしてから発火させ、初期ビューポート内要素の即時発火を和らげる
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    obs.observe(el);
  }
  observer = obs;
}

// 初回は即実行する（astro:page-load の初回発火は window.load 時で遅いため）。
initReveal();
// 遷移後は astro:page-load で再初期化する。
document.addEventListener("astro:page-load", initReveal);
```

BaseLayout の `<script>import "../scripts/reveal.ts";</script>`（body末尾）は変更しない。

## やらないこと

- 共通ライフサイクルヘルパー（`lifecycle.ts` 等）の新設 — 配線は各2行で、直接記述の方が明快。
- `astro:before-swap` での teardown 登録 — 冪等 init が多重監視を防ぐため不要。
- 季節連動・SeasonalHero 関連 — #22 で削除済み。

## 検証

テスト基盤未整備（#21）のため、`npm run build` 通過 + ブラウザ実機／ビルド成果物の確認を品質ゲートとする。

- `npm run build` がエラー・warning 0 件で通過する。
- ブラウザ（ClientRouter 有効）で index → blog → projects → 戻る と遷移し:
  - 各ページで `[data-reveal]` の登場アニメが発動する（隠れ残りしない）。
  - `<html>` に `js` クラスが遷移後も維持される（DevTools で確認）。
  - IntersectionObserver が多重化しない（遷移を繰り返しても登場アニメが正しく1回ずつ）。
- OS を reduced-motion にして遷移すると、observer を張らず内容が最初から可視。
- 遷移が視覚的に滑らか（ClientRouter が効いている）。

## 影響範囲

| ファイル | 変更 |
|---------|------|
| `src/layouts/BaseLayout.astro` | ClientRouter 統合・フラグの after-swap 再適用化 |
| `src/scripts/reveal.ts` | 三点セット化（冪等 init + page-load） |
