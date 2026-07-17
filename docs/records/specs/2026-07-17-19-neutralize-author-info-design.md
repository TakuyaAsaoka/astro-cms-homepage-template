# 作者固有の個人情報を中立化して汎用スターターにする（#19）

## 背景と目的

テンプレートリポジトリに作者（TakuyaAsaoka）の個人情報・固有値がハードコードされたまま残っている。README の手順で置き換える前提だが、置き換え漏れると他人の連絡先・ドメインをそのまま公開してしまう。

このタスクの最終形は「中立・最小の汎用スターター」。個人情報を空文字ではなく **要編集と分かるプレースホルダ** に置き換え、利用者が置き換え漏れに気づける状態にする。

## 設計判断（確定事項）

| 論点 | 決定 | 理由 |
|------|------|------|
| プレースホルダの表記 | `your-username` 系に統一 | コードと README の対応を取り、表記ゆれをなくす |
| `index.astro` の GitHub リンク表示 | `SOCIAL_LINKS.github` から動的生成 | 隣の EMAIL と対称。`consts.ts` の1行変更でリンク先と表示テキストの両方が反映され、置き換え漏れが構造的に起きない |
| `base` | `/your-repo` プレースホルダ | 「要編集」が明白でサイレント破損を避けやすい。clone 直後のローカルが `localhost:4321/your-repo/` になるのは許容するトレードオフ |
| 例示コンテンツ（肩書き・コピー・skills） | 中立化する（スコープに含める） | 特定個人を強く示唆するため、中立スターターとして汎用プレースホルダに置き換える |
| `SITE_URL`（デッドコード） | 削除 | 未使用。「サイトの絶対URL」が実質2箇所にあり利用者が混乱するため `site` に一元化 |

### あるべき姿

- プレースホルダは可能な限り `src/consts.ts` に集約し、置き換え漏れが構造的に起きにくくする。
- 「サイトの絶対URL」は `astro.config.mjs` の `site` に一元化する。`consts.ts:13` の `SITE_URL` はどこからも参照されていないデッドコードで、canonical / OGP（`BaseHead.astro`）は `Astro.site`（= `site`）を使っている。二重定義は「どちらを設定すればよいか」の混乱を生むため削除する。
- `base` と `public_folder` は連動する（CMS が本文に挿入する画像パスが `base` に追従しないため）。プレースホルダを両者で揃え、同期の必要性はコメントで明示する（既存コメントを維持・補強）。

## 表記の統一

| 用途 | プレースホルダ |
|------|--------------|
| GitHub ユーザー名 | `your-username` |
| リポジトリ名 | `your-repo` |
| メールアドレス | `you@example.com` |
| 著者名 | `Your Name` |

山括弧 `<>` は URL に使えずビルドを壊すため、コード内は必ず有効な文字列を使う。README 既存の `<ユーザー名>` / `<リポジトリ名>` 山括弧表記もこの語彙に統一する。

## デプロイ形態の扱い（README で案内）

`base` はデプロイ形態に依存する。テンプレートはプレースホルダ `/your-repo` をデフォルトにしつつ、README で形態別に何を設定すべきかを案内する。

| 形態 | URL例 | `site` | `base` |
|------|-------|--------|--------|
| プロジェクトサイト | `your-username.github.io/your-repo/` | `…github.io` | `/your-repo` |
| ユーザー/組織サイト | `your-username.github.io/` | `…github.io` | `/` |
| カスタムドメイン | `example.com/` | `example.com` | `/` |

`astro.config.mjs` の `base` 行に、形態別の設定と「変更しないと CSS・画像・リンクのパスが壊れる」という実害をコメントで明記する。README のトラブルシュートにも「CSS・画像が読み込まれない → `base` 設定を確認」を1行加える。

## 変更一覧

| ファイル | 現状 | 変更後 |
|---------|------|--------|
| `src/consts.ts:13` | `SITE_URL = "https://example.com"`（未使用） | **削除**（`site` に一元化） |
| `src/consts.ts:18` | `github: "https://github.com/TakuyaAsaoka"` | `github: "https://github.com/your-username"` |
| `src/consts.ts:24` | `EMAIL = "asaoka.biz@gmail.com"` | `EMAIL = "you@example.com"` |
| `src/consts.ts:27` | `SITE_AUTHOR = "アサオカ タクヤ"` | `SITE_AUTHOR = "Your Name"` |
| `src/pages/index.astro:21` | `SOFTWARE ENGINEER / SRE`（肩書き） | `YOUR ROLE`（中立プレースホルダ） |
| `src/pages/index.astro:24` | `つくることと、動かし続けること。`（コピー） | `ここにキャッチコピーを入れます。`（中立プレースホルダ） |
| `src/pages/index.astro:6-15` | 特定個人の技術スタック（TypeScript, React, AWS, K8s, Terraform, Grafana, Prometheus） | 中立な例示（`Skill 1`〜`Skill 4` の汎用プレースホルダ） |
| `src/pages/index.astro:49` | `>github.com/TakuyaAsaoka</a` | `{SOCIAL_LINKS.github.replace(/^https?:\/\//, "")}` で動的表示 |
| `astro.config.mjs:4` | `site: "https://TakuyaAsaoka.github.io"` | `site: "https://example.com"`（形態別の例をコメント） |
| `astro.config.mjs:7` | `base: "/homepage"` | `base: "/your-repo"`（形態別ガイド＋実害＋`public_folder` 同期をコメント） |
| `public/admin/config.yml:10` | `public_folder: "/homepage/images"` | `public_folder: "/your-repo/images"`（`base` と同期。同期コメントは維持） |
| `README.md` | `consts.ts` の SOCIAL_LINKS/EMAIL/AUTHOR 手順なし、`<ユーザー名>` 表記、形態別手順なし | 手順に SOCIAL_LINKS/EMAIL/SITE_AUTHOR を追加、表記を統一、デプロイ形態別の手順とトラブルシュートを追加 |

> 例示コンテンツ（肩書き・コピー・skills）の具体的な中立値は上記を提案とする。spec レビュー・ユーザーレビューで調整可能。

## スコープ外（やらないこと）

- `site` / `SITE_URL` 以外の設定重複の是正
- デプロイ形態の自動判定・実行時警告（誤検知とノイズを生むため。発見可能性はコメントと README で担保）
- `SOCIAL_LINKS` の空文字ハンドリング（github 未使用時の非表示など）

## 受け入れ条件

- [ ] `src/consts.ts` の `SOCIAL_LINKS.github` / `EMAIL` / `SITE_AUTHOR` が中立なプレースホルダ
- [ ] `SITE_URL`（デッドコード）を削除
- [ ] `src/pages/index.astro` の肩書き・コピー・skills が中立なプレースホルダ
- [ ] `src/pages/index.astro` の GitHub リンク表示が `SOCIAL_LINKS` 由来の動的表示
- [ ] `astro.config.mjs` の `site` / `base` がプレースホルダ化され、形態別ガイド・実害・`public_folder` 同期がコメントされている
- [ ] `public/admin/config.yml` の `public_folder` が `base` と同期し、同期の必要性がコメントされている
- [ ] README の初期セットアップ手順・デプロイ手順とプレースホルダの対応が一致し、表記が統一されている
- [ ] `grep -rn -E "TakuyaAsaoka|asaoka|アサオカ" src public astro.config.mjs README.md` が 0 件
- [ ] 品質ゲート `npm run build && npm run test:run && npm run typecheck && npm run lint` が warning 0 件で通る
