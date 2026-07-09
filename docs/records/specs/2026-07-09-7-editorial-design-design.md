# デザイン刷新設計（和モダン・エディトリアル）

- 対象Issue: #7「Homeページとサイト全体のデザインを和モダン・エディトリアルに刷新する」
- 前提設計: `docs/records/specs/2026-07-08-2-seasonal-hero-home-sections-design.md`（季節連動の仕組みは変更しない）
- 作成日: 2026-07-09

## 概要

現状のデザインは機能的には完成しているが「安っぽい」印象がある。ユーザー診断の結果、原因は
**タイポグラフィの弱さ・レイアウトの単調さ・部品の作り込みの素朴さ**の3点（色の淡い世界観は維持で合意）。

3つの方向性（和モダン・エディトリアル / スイス・ミニマル / ハイブリッド）をモックアップで比較し、
**和モダン・エディトリアル**が承認された。明朝体を軸に、字間・罫線・非対称構図で「静かな上質さ」を作る。

検討の結果、不採用としたもの:

- 縦書きの時候ラベル（「夏の候」等）— ユーザー判断で削除
- 色の変更 — 淡い季節パレットと墨色の組み合わせは維持

## 決定事項

| 項目 | 内容 |
|------|------|
| 見出し書体 | Shippori Mincho（Google Fonts、weight 500/600） |
| 本文書体 | Zen Kaku Gothic New（Google Fonts、weight 400/500/700） |
| 文字色 | 墨色 `#2a333c`（本文の補助色は `#3d474f`、淡い注釈は `#646d76`＝白背景でWCAG AA 4.66:1を満たす） |
| ヒーロー構図 | 左下寄せの非対称配置（時候ラベルなし） |
| セクション見出し | 漢数字＋和文＋英字ラベル（例: 壱 技術 SKILLS） |
| スキル表記 | 「・」区切りの文字組み（丸チップ廃止） |
| Contact | ラベル（GITHUB / EMAIL）＋季節色の下線リンク |
| 季節連動 | 既存の `html[data-season]` とCSS変数の仕組みをそのまま利用 |

## デザイン仕様

### 1. タイポグラフィ基盤（全ページ）

`src/components/BaseHead.astro`:

- Google Fonts の読み込みを追加: `preconnect`（fonts.googleapis.com / fonts.gstatic.com）＋ stylesheet link
- 対象: `Shippori Mincho:wght@500;600` と `Zen Kaku Gothic New:wght@400;500;700`
- `display=swap` を指定し、読み込み中もフォールバックフォントで文字が読める状態を保つ

`src/styles/global.css`:

```css
:root {
  --font-serif: "Shippori Mincho", "Hiragino Mincho ProN", serif;
  --font-sans: "Zen Kaku Gothic New", system-ui, sans-serif;
  --color-ink: #2a333c;       /* 墨色: 見出し・本文 */
  --color-ink-soft: #3d474f;  /* 本文の補助 */
  --color-muted: #646d76;     /* 英字ラベル・注釈（白背景でWCAG AA 4.66:1） */
}
```

- `html` の `font-family` を `var(--font-sans)`、`color` を `var(--color-ink)` に変更
- `h1`〜`h3` は `var(--font-serif)`・`font-weight: 600`・広めの字間（`letter-spacing: 0.12em` 目安）
- 本文リンク: `--season-accent-text` の文字色をやめ、**墨色の文字＋季節色の下線**（`text-decoration-color: var(--season-accent)`、`text-underline-offset: 4px`）に統一する。文字自体が墨色になるためコントラスト問題（WCAG AA）は解消される

### 2. ヒーロー（`src/pages/index.astro` + `global.css`）

- `.hero-content` を中央揃えから**左下寄せ**に変更（`justify-content: flex-end; align-items: flex-start; text-align: left;` ＋ 左右パディング）
- 構成（上から）:
  1. 肩書き: `SOFTWARE ENGINEER / SRE` — 明朝・小さめ・字間 0.35em・季節アクセント色
  2. 名前: `アサオカ タクヤ` — 明朝・`clamp(2.2rem, 6vw, 3.4rem)`・字間 0.12em
  3. 罫線: 幅 52px・高さ 1px・墨色（装飾のため `<span class="hero-rule" aria-hidden="true">` として実装）
  4. キャッチコピー: `つくることと、動かし続けること。` — 明朝・字間 0.22em
- 背景アニメーション（日輪・パーティクル）は無変更。日輪は右側にあるため、左下寄せの文字と構図が噛み合う
- モバイル幅では左右パディングを詰め、`clamp` でフォントサイズが自然に縮む。字間が広いため `hero-copy` は改行を許容する

### 3. セクション見出し・Skills・Contact（`src/pages/index.astro` + `global.css`）

セクション見出し（`.section-heading` の左線マーカーを廃止し、新構造に）:

```html
<h2 class="section-heading">
  <span class="section-num">壱</span>
  <span class="section-title">技術</span>
  <span class="section-label" aria-hidden="true">SKILLS</span>
</h2>
```

- 漢数字: 明朝・季節アクセント色（`--season-accent`）
- 和文タイトル: 明朝・字間 0.25em
- 英字ラベル: サンセリフ小・字間 0.3em・`--color-muted`。装飾のため `aria-hidden`
- Skillsは「壱 技術 SKILLS」、Contactは「弐 連絡先 CONTACT」

Skills（丸チップ廃止。クラス名を `skill-tags` → `skill-list`、`contact-links` → `contact-list` にリネームし、旧チップCSSは削除する）:

- `<ul class="skill-list" role="list">` を維持しつつ、CSSで `li` をインライン化し、区切りの「・」（季節アクセント色）を `li + li::before` で挿入する（リストのセマンティクスを保ったまま文字組みにする）
- 行間はゆったり（`line-height: 2.4` 目安）

Contact:

```html
<ul class="contact-list" role="list">
  <li><span class="contact-label">GITHUB</span><a href="...">github.com/TakuyaAsaoka</a></li>
  <li><span class="contact-label">EMAIL</span><a href="mailto:...">asaoka.biz@gmail.com</a></li>
</ul>
```

- ラベルは英字小・字間 0.2em・`--color-muted`
- リンクは墨色文字＋季節色下線（タイポグラフィ基盤のリンク様式）。GitHubリンクの表示テキストは「GitHub」から「github.com/TakuyaAsaoka」に変更

### 4. ヘッダー・フッター（`src/components/Header.astro` / `Footer.astro`）

- ヘッダー: サイト名を明朝・字間 0.2em に。navリンクはサンセリフ小・字間 0.18em、hover/active の下線様式（季節色・offset）は既存を踏襲
- フッター: 上罫線（`1px solid #e7ecef`）を追加し、SNSリンクは英字大文字・字間 0.25em・`--color-muted`（hoverで季節色）。コピーライトは「© 2026 アサオカ タクヤ」に変更し明朝小
- Footer の `&copy; {new Date().getFullYear()} All rights reserved.` は「© {年} アサオカ タクヤ」に変更する。名前はハードコードせず `consts.ts` に `SITE_AUTHOR = "アサオカ タクヤ"` を追加して参照する（`index.astro` のヒーローの名前も同定数を参照）

### 5. Blog / Projects ページ

- 固有のレイアウト改修はスコープ外。ただしタイポグラフィ基盤（フォント・墨色・リンク様式・見出しの明朝化）は `global.css` 経由で自動的に適用される
- ProjectCard 等の部品刷新は必要になれば別Issue

## 影響範囲

| ファイル | 変更内容 |
|---------|---------|
| `src/components/BaseHead.astro` | Google Fonts読み込み（preconnect + swap） |
| `src/styles/global.css` | フォント変数・墨色・リンク様式・ヒーロー/セクション/Skills/Contactスタイルの刷新 |
| `src/pages/index.astro` | ヒーロー構図・セクション見出し構造・Skills/Contactマークアップ変更 |
| `src/components/Header.astro` | サイト名の明朝化・navの文字組み |
| `src/components/Footer.astro` | 上罫線・SNSリンクの文字組み・コピーライト変更 |
| `src/consts.ts` | `SITE_AUTHOR` 定数を追加 |

変更しないもの: `SeasonalHero.astro`（アニメーション・auto判定）、`BaseLayout.astro`（季節判定）、季節アクセントCSS変数（`--season-accent`）の切替の仕組み。

孤立する変数の削除: リンク様式の変更（墨色文字＋季節色下線）で `--season-accent-text` が、丸チップ廃止で `--season-accent-soft` が、それぞれ参照ゼロになる。両変数とも定義ごと削除し、dead code を残さない。残すのは `--season-accent`（漢数字・下線・区切り点・見出しマーカー等で継続使用）のみ。

## 検証

品質ゲートは `npm run build` ＋ ブラウザ実機確認（既存方針を踏襲）。

1. `npm run build` が成功すること
2. `npm run preview` ＋ ブラウザ確認:
   - 見出しが明朝体・本文がゴシック体・文字色が墨色（全ページ: Home / Blog / Projects）
   - ヒーローが左下寄せ、日輪・パーティクルと構図が噛み合っている
   - セクション見出し（壱 技術 SKILLS / 弐 連絡先 CONTACT）とスキルの「・」区切り表示
   - Contactのラベル＋下線リンク、mailtoが機能する
   - 季節切替（`html[data-season]` 書き換え）で漢数字・下線・区切り点の色が追従する
   - リンク文字が墨色になり、白背景とのコントラストが WCAG AA を満たす
   - モバイル幅（375px）でヒーロー・セクションが破綻しない
   - フォント読み込み前もフォールバックで文字が読める（DevToolsでフォントをブロックして確認）

## スコープ外

- Blog / Projects ページ固有のレイアウト改修（ProjectCard等の部品刷新を含む）
- SeasonalHero のアニメーション・色の変更
- 縦書きの時候ラベル（不採用決定）
- ダークモード対応
