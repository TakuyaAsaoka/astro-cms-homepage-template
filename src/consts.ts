// 末尾スラッシュを保証する。既に付いていればそのまま、無ければ付与する。
export function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

// デプロイ先の基準パス。Astro の BASE_URL は本番ビルドで末尾スラッシュを持たない
// （例: "/homepage"）ため、末尾スラッシュを保証した定数に集約する。
// import.meta.env.BASE_URL を直接文字列連結してはならない（本番でリンクが壊れる）
export const BASE_PATH = ensureTrailingSlash(import.meta.env.BASE_URL);

export const SITE_TITLE = "My Homepage";
export const SITE_DESCRIPTION = "A personal homepage template built with Astro";
export const SITE_URL = "https://example.com";
export const SITE_LANG = "ja";

// SNSリンク（使わないものは空文字にする）
export const SOCIAL_LINKS = {
  github: "https://github.com/TakuyaAsaoka",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス
export const EMAIL = "asaoka.biz@gmail.com";

// 著者名（ヒーロー・フッターで参照）
export const SITE_AUTHOR = "アサオカ タクヤ";

// noteのRSS URL
export const NOTE_RSS_URL = "";
