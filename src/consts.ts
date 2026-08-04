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

// サイト名・著者名・SNSリンク等の表示系の設定は CMS 管理
// （src/content/settings/site.yaml、取得は src/site-settings.ts）。
// このファイルにはビルド設定に紐づく技術的な定数だけを置く。

// サイトの言語。サイト本体の全ページの <html lang> に反映される
// （CMS管理画面 public/admin/index.html は Astro を通らないため対象外）。
// BCP47 の言語タグのみを入れる（例: "ja", "en"）。
// og:locale は地域まで必要かつ形式も異なる（ja_JP）ため SITE_LOCALE を使う。
export const SITE_LANG = "ja";

// サイトのロケール（言語-地域）。og:locale の元になる。
// BCP47 形式の言語-地域の2要素のみ（例: "ja-JP", "en-GB"）で書く。
// スクリプト付き（zh-Hant-TW 等）は変換が対応していないため不可。
// og:locale が要求するアンダースコア形式（ja_JP）への変換は BaseHead が行う。
export const SITE_LOCALE = "ja-JP";

// RSSフィードの日付を表示するときの基準タイムゾーン（IANAのタイムゾーン名）。
// Astro はビルド時に日付を確定するため、指定しないとビルドマシンのTZ
// （CIはUTC・ローカルはJST等）で日付が1日ずれる。言語とは別軸なので
// SITE_LANG とは独立して指定する。
//
// Works の pubDate には効かない。あちらは「いつ公開したか」という暦日であり、
// 見る場所によって動いてはならないため、タイムゾーン変換をしない（date.ts 参照）。
export const SITE_TIMEZONE = "Asia/Tokyo";
