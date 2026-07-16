# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のAIコーディングエージェント向けガイダンスを提供します。

> **Note**: 開発プロセス、ローカライゼーション、コミットメッセージ、テストケース記述ルール等の共通ルールは `~/.claude/CLAUDE.md`（[claude-shared-config](https://github.com/TakuyaAsaoka/claude-shared-config)）で管理されています。

## プロジェクト概要

<!-- プロジェクトの概要を記載 -->

## ディレクトリ構成

<!-- ディレクトリ構成を記載 -->

## 技術スタック

<!-- 技術スタックを記載 -->

## 共通コマンド

<!-- 開発・テスト・ビルド等のコマンドを記載（共通skillsがここを参照する） -->

```bash
# 開発
npm run dev           # 開発サーバー
npm run build         # ビルド
npm run preview       # ビルド結果のプレビュー

# テスト
npm test              # テスト（ウォッチ）
npm run test:run      # テスト（1回実行・品質ゲート用）

# 型チェック
npm run typecheck     # astro check による型チェック

# lint / format
npm run lint          # lint実行
npm run lint:fix      # lint自動修正
npm run format        # Prettier整形
npm run format:check  # 整形チェック
```

品質ゲート（マージ前検証）は次の4コマンドを warning 0 件で通す:

```bash
npm run build && npm run test:run && npm run typecheck && npm run lint
```

