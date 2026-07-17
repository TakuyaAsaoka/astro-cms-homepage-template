// 末尾スラッシュを保証する。既に付いていればそのまま、無ければ付与する。
export function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

// デプロイ先の基準パス。Astro の BASE_URL は本番ビルドで末尾スラッシュを持たない
// （例: "/your-repo"）ため、末尾スラッシュを保証した定数に集約する。
// import.meta.env.BASE_URL を直接文字列連結してはならない（本番でリンクが壊れる）
export const BASE_PATH = ensureTrailingSlash(import.meta.env.BASE_URL);

// OGP画像のフォールバック。ページで image を個別指定しない場合に og:image として
// 出力される。BaseHead で絶対URL化される。
export const DEFAULT_OG_IMAGE = `${BASE_PATH}images/og.png`;

export const SITE_TITLE = "My Homepage";
export const SITE_DESCRIPTION = "A personal homepage template built with Astro";
export const SITE_LANG = "ja";

// SNSリンク（使わないものは空文字にする）
export const SOCIAL_LINKS = {
  github: "https://github.com/your-username",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス
export const EMAIL = "you@example.com";

// 著者名（ヒーロー・フッターで参照）
export const SITE_AUTHOR = "Your Name";

// noteのRSS URL
export const NOTE_RSS_URL = "";
