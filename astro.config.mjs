import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  // sitemap は site（下記）を基準に全ページのURLを生成し、
  // ビルド時に dist/sitemap-index.xml として出力される
  integrations: [sitemap()],

  // Astro のキャッシュ（フォントのダウンロードキャッシュ等）を node_modules の外に置く。
  // 既定の node_modules/.astro だと CI の npm ci で消えるため、
  // actions/cache で復元してもビルド前に失われる（.github/workflows/deploy.yml 参照）。
  cacheDir: "./.astro-cache",

  // Google Fonts をビルド時に取得してセルフホスト化する。
  // @font-face と CSS 変数（--font-serif / --font-sans）は BaseHead.astro の
  // <Font> コンポーネントが :root に注入する。
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Shippori Mincho",
      cssVariable: "--font-serif",
      weights: [500, 600],
      styles: ["normal"],
      // "japanese" 単独だとウェイト 600 の取得が欠落する既知の問題があるため latin を併記する
      subsets: ["latin", "japanese"],
      fallbacks: ["Hiragino Mincho ProN", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Zen Kaku Gothic New",
      cssVariable: "--font-sans",
      weights: [400, 500, 700],
      styles: ["normal"],
      subsets: ["latin", "japanese"],
      fallbacks: ["system-ui", "-apple-system", "sans-serif"],
    },
  ],

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
