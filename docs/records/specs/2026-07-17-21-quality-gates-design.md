# 品質ゲート（test / typecheck / lint）整備 — 設計

- Issue: #21
- 日付: 2026-07-17

## 目的

グローバル開発プロセスが要求する品質ゲート `build && test:run && typecheck && lint` のうち、
このリポジトリに欠けている `test:run` / `typecheck` / `lint` を整備する。CI は無効化されているため、
ローカル検証が唯一の品質ゲートであり、その土台を用意する。

## 前提

- パッケージマネージャは **npm**（`package-lock.json` が存在。pnpm-lock は無い）。
- Astro 6 系。ESLint は 9 系（flat config）。
- 現状の `package.json` scripts は `dev / build / preview / astro` のみ、`devDependencies` は空。

## スコープ

### やること

1. `package.json` に scripts と devDependencies を追加する。
2. vitest / ESLint / Prettier / astro check の設定ファイルを追加する。
3. 既存ロジック（`reveal.ts` / `consts.ts`）に単体テストを追加する。
4. テスト可能化のための最小リファクタを行う。
5. `CLAUDE.md` の共通コマンド節を実際の script 名に整合させる。

### やらないこと

- 全コンポーネント・全ページの網羅的テスト（別Issue）。
- CI（GitHub Actions）の再有効化（無効化は既定方針）。

## 設計詳細

### scripts（npm）

| script | コマンド | 用途 |
|--------|---------|------|
| `test` | `vitest` | ウォッチ実行 |
| `test:run` | `vitest run` | 品質ゲート用 |
| `typecheck` | `astro check` | 型チェック |
| `lint` | `eslint .` | lint |
| `lint:fix` | `eslint . --fix` | lint 自動修正 |
| `format` | `prettier --write .` | 整形 |
| `format:check` | `prettier --check .` | 整形チェック |

### devDependencies

| 分類 | パッケージ |
|------|-----------|
| test | `vitest`, `jsdom` |
| typecheck | `@astrojs/check`, `typescript` |
| lint | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, `globals` |
| format | `prettier`, `prettier-plugin-astro`, `eslint-config-prettier` |

### 設定ファイル

- `vitest.config.ts` — `environment: jsdom` / `globals: true` / setup ファイル指定。
- `vitest.setup.ts` — jsdom に無い `IntersectionObserver` のモックを登録する。
- `eslint.config.js` — flat config。適用順は
  `@eslint/js` recommended → `typescript-eslint` → `eslint-plugin-astro` →
  `eslint-config-prettier`（整形系ルールの競合を最後に無効化）。
- `.prettierrc.json` + `.prettierignore` — `prettier-plugin-astro` を有効化。

### テスト

- `src/scripts/reveal.test.ts`（jsdom + IntersectionObserver モック）
  - `[data-reveal]` 要素を observe する。
  - 交差時に `is-visible` を付与し unobserve する。
  - `reduced-motion` クラス時は監視を張らない。
  - 再初期化で前回 observer を disconnect する（冪等性）。
- `src/consts.test.ts`
  - 末尾スラッシュ正規化ロジックの検証（付いていれば維持、無ければ付与）。

### テスト可能化のための最小リファクタ（あるべき姿）

- `reveal.ts`: `initReveal` を named export にする。副作用 import（初回実行 + `astro:page-load` 登録）は維持する。
- `consts.ts`: 末尾スラッシュ付与を純関数として抽出・export し、`BASE_PATH` はそれを利用する。

### ドキュメント整合

- `CLAUDE.md` の「共通コマンド」節を、実際の npm script 名（`test:run` / `typecheck` / `lint` / `format` 等）に更新する。

## 完了条件

- `npm run build && npm run test:run && npm run typecheck && npm run lint` が
  **エラー・warning 0 件** で完走する。
- 型エラー・lint 違反を含むコードで `typecheck` / `lint` が非ゼロ終了する。

## リスク

- `astro check` と ESLint が既存 `.astro` / `.ts` に警告を出す可能性がある。
  実装中に既存コードの修正も含めて 0 件化する（変更ファイルだけの部分チェックはしない）。
