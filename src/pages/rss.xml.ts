import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { BASE_PATH } from "../consts";
import { publishedWorks } from "../lib/works";
import { getSiteSettings } from "../site-settings";

// 制作コレクションからRSSフィードを生成する（draft除外・公開日の新しい順）
export async function GET(context: APIContext) {
  // astro.config.mjs で site を設定していないと URL を解決できない。設定漏れを早期に検知する
  if (!context.site) {
    throw new Error("astro.config.mjs に site が設定されていません");
  }

  const site = await getSiteSettings();
  const works = publishedWorks(await getCollection("works"));

  // context.site は base を含まないため、サイト実体の URL に base を付与する。
  // これが channel の <link> になり、各 item の相対 link もこの URL を基準に解決される
  const siteUrl = new URL(BASE_PATH, context.site).href;

  return rss({
    title: site.title,
    description: site.description,
    site: siteUrl,
    items: works.map((work) => ({
      title: work.data.title,
      description: work.data.description,
      // pubDate は暦日 "YYYY-MM-DD"。UTC の日付として解釈する（lib/date.ts と同じ約束）
      pubDate: new Date(work.data.pubDate),
      // base は siteUrl 側に含まれるため、ここでは相対パスにして解決を委ねる
      link: `works/${work.id}/`,
    })),
  });
}
