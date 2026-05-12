# Homepage

Astro で構築した個人ホームページです。

## プロジェクト構成

```text
/
├── public/
│   ├── admin/          # Sveltia CMS 管理画面
│   ├── images/         # 画像ファイル
│   └── favicon.svg
├── src/
│   ├── components/     # 再利用可能なコンポーネント
│   ├── content/        # コンテンツコレクション（Markdown）
│   ├── layouts/        # ページレイアウト
│   ├── pages/          # ページ（ファイルベースルーティング）
│   ├── styles/         # グローバルスタイル
│   ├── consts.ts       # サイト定数
│   └── content.config.ts
├── docs/               # ドキュメント
└── package.json
```

Astro は `src/pages/` 配下の `.astro` や `.md` ファイルをファイル名に基づいてルーティングします。

`src/components/` にはAstroコンポーネントを配置します。

画像などの静的ファイルは `public/` に配置します。

## コマンド

すべてのコマンドはプロジェクトルートで実行します：

| コマンド                    | 説明                                              |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | 依存関係のインストール                                |
| `npm run dev`             | 開発サーバーを起動（`localhost:4321`）                 |
| `npm run build`           | プロダクションビルド（`./dist/` に出力）                |
| `npm run preview`         | ビルド結果をローカルでプレビュー                         |
| `npm run astro ...`       | `astro add` や `astro check` などのCLIコマンドを実行   |
| `npm run astro -- --help` | Astro CLIのヘルプを表示                              |

## 参考リンク

- [Astro ドキュメント](https://docs.astro.build)
