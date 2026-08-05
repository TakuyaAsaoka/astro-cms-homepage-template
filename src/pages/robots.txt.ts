import type { APIContext } from "astro";
import { BASE_PATH } from "../consts";

// robots.txt を site/base 設定に追従して動的生成する。
// 注意: base がサブパス（GitHub Pages プロジェクトサイト等）の場合、この robots.txt は
// /<base>/robots.txt に配置されるが、クローラーはドメインルートの /robots.txt しか
// 読まないため実質機能しない。独自ドメイン・ユーザーサイト（base "/"）では機能する。
export function GET(context: APIContext) {
  // astro.config.mjs で site を設定していないと URL を解決できない。設定漏れを早期に検知する
  if (!context.site) {
    throw new Error("astro.config.mjs に site が設定されていません");
  }

  // context.site は base を含まないため、サイト実体の URL に base を付与する
  const siteUrl = new URL(BASE_PATH, context.site).href;

  const body = [
    "User-agent: *",
    // CMS 管理画面はクロール対象外にする
    `Disallow: ${BASE_PATH}admin/`,
    "",
    `Sitemap: ${siteUrl}sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
