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
// サイトの言語。サイト本体の全ページの <html lang> に反映される
// （CMS管理画面 public/admin/index.html は Astro を通らないため対象外）。
// BCP47 の言語タグのみを入れる（例: "ja", "en"）。
// og:locale は地域まで必要かつ形式も異なる（ja_JP）ため SITE_LOCALE を使う。
export const SITE_LANG = "ja";

// サイトのロケール（言語-地域）。og:locale の元になる。
// BCP47 形式（例: "ja-JP", "en-GB"）で書く。og:locale が要求する
// アンダースコア形式（ja_JP）への変換は BaseHead が行う。
export const SITE_LOCALE = "ja-JP";

// RSSフィードの日付を表示するときの基準タイムゾーン（IANAのタイムゾーン名）。
// Astro はビルド時に日付を確定するため、指定しないとビルドマシンのTZ
// （CIはUTC・ローカルはJST等）で日付が1日ずれる。言語とは別軸なので
// SITE_LANG とは独立して指定する。
//
// Works の pubDate には効かない。あちらは「いつ公開したか」という暦日であり、
// 見る場所によって動いてはならないため、タイムゾーン変換をしない（date.ts 参照）。
export const SITE_TIMEZONE = "Asia/Tokyo";

// SNSリンク（使わないものは空文字にする）
export const SOCIAL_LINKS = {
  github: "https://github.com/your-username",
  twitter: "",
  youtube: "",
};

// 公開用メールアドレス（使わない場合は空文字にする＝連絡先セクションに表示しない）
export const EMAIL = "you@example.com";

// 著者表示名（ヒーロー等の見せる場所で参照）
export const SITE_AUTHOR = "Your Name";

// 著作権表記名（Footer の © 表記で参照）。表示名と著作権者が異なる場合に
// 個別に変更できるよう SITE_AUTHOR と分離している
export const COPYRIGHT_HOLDER = "Your Name";

// noteのRSS URL
export const NOTE_RSS_URL = "";
