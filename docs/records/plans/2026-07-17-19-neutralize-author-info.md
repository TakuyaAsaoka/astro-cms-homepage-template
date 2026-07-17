# 作者固有情報の中立化 実装計画（#19）

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** テンプレートに残る作者（TakuyaAsaoka）固有の個人情報・例示コンテンツ・固有パスを、要編集と分かる中立なプレースホルダに置き換える。

**Architecture:** 値・コンテンツの置き換えが中心。プレースホルダは `src/consts.ts` に集約し、`index.astro` の GitHub リンク表示は `SOCIAL_LINKS` から動的生成する。デッドコードの `SITE_URL` を削除し、サイトの絶対URLは `astro.config.mjs` の `site` に一元化する。`base` はデプロイ形態依存のためプレースホルダ `/your-repo` とし、`public/admin/config.yml` の `public_folder` と同期させる。README を実際のプレースホルダと対応させ、表記を統一する。

**Tech Stack:** Astro v6 / TypeScript / vitest / Sveltia CMS。品質ゲート = `npm run build && npm run test:run && npm run typecheck && npm run lint`（warning 0 件）。

**設計方針（TDD について）:** 本タスクは値・コンテンツの置き換えが主で、新規の独立したテスト可能なロジック単位を生まない（唯一の変換 `SOCIAL_LINKS.github.replace(...)` はテンプレート内インライン、既存にレンダリングテスト基盤なし）。人工的なユニットテスト追加は YAGNI と判断し、**各変更を関心ごとにコミットし、ビルド・型チェック・lint・grep ゲートで検証する**。既存の `src/consts.test.ts` は引き続きパスすること。

**Spec:** `docs/records/specs/2026-07-17-19-neutralize-author-info-design.md`

---

## Task 1: `src/consts.ts` の中立化と `SITE_URL` 削除

**Files:**
- Modify: `src/consts.ts`（13行目 `SITE_URL` 削除、18行目 github、24行目 EMAIL、27行目 SITE_AUTHOR）

- [ ] **Step 1: `SITE_URL` が本当に未使用かリポジトリ全体で確認**

Run: `grep -rn "SITE_URL" src public README.md docs/custom-domain-ssl.md`
Expected: 該当は次の3ファイルのみ — `src/consts.ts:13`（定義）、`README.md:41`（編集例）、`docs/custom-domain-ssl.md:131`（編集例）。いずれも本計画で削除・更新する（`consts.ts` の実コードから参照している箇所は無いこと）。

- [ ] **Step 2: `SITE_URL` の行を削除**

`src/consts.ts` の以下の行（13行目）を削除する:

```typescript
export const SITE_URL = "https://example.com";
```

- [ ] **Step 3: `SOCIAL_LINKS.github` / `EMAIL` / `SITE_AUTHOR` をプレースホルダに置換**

置換前:
```typescript
export const SOCIAL_LINKS = {
  github: "https://github.com/TakuyaAsaoka",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス
export const EMAIL = "asaoka.biz@gmail.com";

// 著者名（ヒーロー・フッターで参照）
export const SITE_AUTHOR = "アサオカ タクヤ";
```

置換後:
```typescript
export const SOCIAL_LINKS = {
  github: "https://github.com/your-username",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス
export const EMAIL = "you@example.com";

// 著者名（ヒーロー・フッターで参照）
export const SITE_AUTHOR = "Your Name";
```

- [ ] **Step 4: 型チェックと既存テストを実行**

Run: `npm run typecheck && npm run test:run`
Expected: PASS（`SITE_URL` 削除でエラーが出ないこと、`consts.test.ts` がパスすること）。

- [ ] **Step 5: コミット**

```bash
git add src/consts.ts
git commit -m "refactor: consts.ts の個人情報を中立化しデッドコードのSITE_URLを削除（#19）"
```

---

## Task 2: `src/pages/index.astro` の中立化

**Files:**
- Modify: `src/pages/index.astro`（6-15行目 skills、21行目 肩書き、24行目 コピー、48-50行目 GitHubリンク表示）

- [ ] **Step 1: skills 配列を中立プレースホルダに置換**

置換前（6-15行目）:
```astro
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
```

置換後:
```astro
const skills = ["Skill 1", "Skill 2", "Skill 3", "Skill 4"];
```

- [ ] **Step 2: 肩書きとコピーを中立プレースホルダに置換**

置換前:
```astro
      <p class="hero-role">SOFTWARE ENGINEER / SRE</p>
```
置換後:
```astro
      <p class="hero-role">YOUR ROLE</p>
```

置換前:
```astro
      <p class="hero-copy">つくることと、動かし続けること。</p>
```
置換後:
```astro
      <p class="hero-copy">ここにキャッチコピーを入れます。</p>
```

- [ ] **Step 3: GitHub リンクの表示テキストを `SOCIAL_LINKS` から動的生成**

置換前（48-50行目）:
```astro
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer"
          >github.com/TakuyaAsaoka</a
        >
```
置換後:
```astro
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer"
          >{SOCIAL_LINKS.github.replace(/^https?:\/\//, "")}</a
        >
```

- [ ] **Step 4: ビルドと index.astro の grep 確認**

Run: `npm run build && grep -n -E "TakuyaAsaoka|SOFTWARE ENGINEER|つくること" src/pages/index.astro`
Expected: ビルド成功。grep は 0 件（該当なし）。

- [ ] **Step 5: コミット**

```bash
git add src/pages/index.astro
git commit -m "refactor: index.astro の作者固有コンテンツを中立化しGitHub表示を動的化（#19）"
```

---

## Task 3: `astro.config.mjs` と `public/admin/config.yml` の中立化

**Files:**
- Modify: `astro.config.mjs`（4行目 site、7行目 base、コメント）
- Modify: `public/admin/config.yml`（10行目 public_folder）

- [ ] **Step 1: `astro.config.mjs` を中立化しコメントを整備**

ファイル全体を以下に置換:
```javascript
import { defineConfig } from "astro/config";

export default defineConfig({
  // 本番サイトの絶対URL。canonical と OGP に使う（全デプロイ形態で必須）。
  //   GitHub Pages: "https://your-username.github.io" / 独自ドメイン: "https://example.com"
  site: "https://example.com",

  // デプロイ先の基準パス（プレースホルダ。デプロイ形態に応じて設定する）。
  //   ・プロジェクトサイト(your-username.github.io/your-repo/) → "/your-repo"（リポジトリ名に変更）
  //   ・独自ドメイン / ユーザーサイト(your-username.github.io)  → "/"
  //   ← 誤った値のままだと CSS・画像・リンクのパスが壊れる
  //   base を変更したら public/admin/config.yml の public_folder も同じ値に揃えること
  //   （CMSが挿入する画像パスは自動追従しないため）。
  base: "/your-repo",
});
```

- [ ] **Step 2: `public/admin/config.yml` の `public_folder` を同期**

置換前（10行目）:
```yaml
public_folder: "/homepage/images"
```
置換後:
```yaml
public_folder: "/your-repo/images"
```
（7-9行目の同期コメントはそのまま維持する）

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: PASS（`base` 変更後もビルドが通ること）。

- [ ] **Step 4: コミット**

```bash
git add astro.config.mjs public/admin/config.yml
git commit -m "refactor: astro.config と CMS設定の固有パスを中立化（#19）"
```

---

## Task 4: `README.md` とドキュメントの更新

**Files:**
- Modify: `README.md`（31-32行目 clone例、36-42行目 consts手順、44-51行目 astro.config手順、デプロイ節にトラブルシュート追加）
- Modify: `docs/custom-domain-ssl.md`（128-132行目 削除する `SITE_URL` 参照を除去）

- [ ] **Step 1: clone コマンド例の表記を統一**

置換前（31-32行目）:
```bash
git clone git@github.com:<ユーザー名>/<リポジトリ名>.git
cd <リポジトリ名>
```
置換後:
```bash
git clone git@github.com:your-username/your-repo.git
cd your-repo
```

- [ ] **Step 2: `consts.ts` 編集手順から `SITE_URL` を除去し、SOCIAL_LINKS/EMAIL/SITE_AUTHOR を追加**

置換前（手順3のコードブロック、38-42行目）:
```typescript
export const SITE_TITLE = "あなたのサイト名";
export const SITE_DESCRIPTION = "サイトの説明";
export const SITE_URL = "https://example.com";
```
置換後:
```typescript
export const SITE_TITLE = "あなたのサイト名";
export const SITE_DESCRIPTION = "サイトの説明";

export const SOCIAL_LINKS = {
  github: "https://github.com/your-username",
  twitter: "",
  youtube: "",
};
export const EMAIL = "you@example.com";
export const SITE_AUTHOR = "Your Name";
```

- [ ] **Step 3: `astro.config.mjs` 手順を表記統一＋デプロイ形態別ガイドに更新**

置換前（手順4、44-51行目）:
```markdown
4. `astro.config.mjs` の `site` と `base` を自分の環境に合わせて変更

​```javascript
export default defineConfig({
  site: "https://<ユーザー名>.github.io",
  base: "/<リポジトリ名>",
});
​```
```
置換後:
````markdown
4. `astro.config.mjs` の `site` と `base` をデプロイ形態に合わせて設定

```javascript
export default defineConfig({
  site: "https://your-username.github.io", // 独自ドメインなら "https://example.com"
  base: "/your-repo", // 形態別の設定は下表を参照
});
```

デプロイ形態によって `base` の値が変わります。

| デプロイ形態 | URL例 | `site` | `base` |
|------------|-------|--------|--------|
| プロジェクトサイト | `your-username.github.io/your-repo/` | `https://your-username.github.io` | `/your-repo` |
| ユーザー/組織サイト | `your-username.github.io/` | `https://your-username.github.io` | `/` |
| 独自ドメイン | `example.com/` | `https://example.com` | `/` |

> `base` を変更したら `public/admin/config.yml` の `public_folder` も同じ値に揃えてください（CMSが挿入する画像パスは自動追従しません）。
````

- [ ] **Step 4: デプロイ節にトラブルシュートを追加**

`README.md` の「デプロイ」節、124行目（`初回は GitHub リポジトリの Settings → Pages ...`）の直後に、以下を追加する:

```markdown

> **CSS・画像が読み込まれない場合**: `astro.config.mjs` の `base` がデプロイ形態と合っているか確認してください（プロジェクトサイトは `/your-repo`、ユーザーサイト・独自ドメインは `/`）。
```

- [ ] **Step 5: `docs/custom-domain-ssl.md` から削除済み `SITE_URL` の参照を除去**

セクション6「Astro設定の更新」の `### src/consts.ts` サブセクションは、削除する `SITE_URL` の設定を指示しており誤誘導になる。同セクション上部の `astro.config.mjs` 例（`site: "https://example.com"`）が唯一の情報源なので、以下のブロック（128-132行目、直前の空行含む）を削除する:

````markdown

### `src/consts.ts`

```typescript
export const SITE_URL = "https://example.com";
```
````

削除後、セクションは `astro.config.mjs` のブロックから `### public/admin/config.yml（CMS使用時）` へ直接つながる。

- [ ] **Step 6: Prettier で整形しコミット**

Run: `npm run format && npm run format:check`
Expected: format:check が PASS（整形差分なし）。

```bash
git add README.md docs/custom-domain-ssl.md
git commit -m "docs: READMEとドキュメントの手順・プレースホルダを中立化し表記を統一（#19）"
```

---

## Task 5: 最終検証（品質ゲート + grep ゲート）

**Files:** なし（検証のみ）

- [ ] **Step 1: 作者固有識別子の grep ゲート**

Run: `grep -rn -E "TakuyaAsaoka|asaoka|アサオカ" src public astro.config.mjs README.md`
Expected: 0 件（出力なし、exit code 1）。

- [ ] **Step 2: 旧プレースホルダ表記の残存確認**

Run: `grep -rn -E "<ユーザー名>|<リポジトリ名>|/homepage" src public astro.config.mjs README.md`
Expected: 0 件（山括弧表記・`/homepage` が残っていないこと）。

- [ ] **Step 3: `SITE_URL` の残存確認**

Run: `grep -rn "SITE_URL" src public README.md docs/custom-domain-ssl.md`
Expected: 0 件（削除済み定数への参照が、コード・README・ユーザー向けドキュメントに残っていないこと）。

- [ ] **Step 4: 品質ゲートを warning 0 件で通す**

Run: `npm run build && npm run test:run && npm run typecheck && npm run lint`
Expected: 全て PASS、warning 0 件。

- [ ] **Step 5: Prettier 整形チェック**

Run: `npm run format:check`
Expected: PASS（整形差分なし）。

---

## 完了条件（spec の受け入れ条件と対応）

- [ ] `SOCIAL_LINKS.github` / `EMAIL` / `SITE_AUTHOR` が中立プレースホルダ（Task 1）
- [ ] `SITE_URL` を削除（Task 1）
- [ ] 肩書き・コピー・skills が中立プレースホルダ（Task 2）
- [ ] GitHub リンク表示が `SOCIAL_LINKS` 由来の動的表示（Task 2）
- [ ] `site` / `base` がプレースホルダ化＋形態別ガイド・実害・同期のコメント（Task 3）
- [ ] `public_folder` が `base` と同期＋コメント（Task 3）
- [ ] README の手順とプレースホルダの対応一致・表記統一（Task 4）
- [ ] grep ゲート 0 件（Task 5）
- [ ] 品質ゲート warning 0 件（Task 5）
