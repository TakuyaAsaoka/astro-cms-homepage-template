import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  // sitemap は site（下記）を基準に全ページのURLを生成し、
  // ビルド時に dist/sitemap-index.xml として出力される
  integrations: [sitemap()],

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
