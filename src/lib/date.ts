import { SITE_LANG, SITE_TIMEZONE } from "../consts";

// 表示用の文字列と <time datetime> 用の ISO 8601 日付。両者は必ず同じ
// タイムゾーンで導出する（片方だけ UTC だと機械可読な日付と表示が食い違う）。
export interface FormattedDate {
  datetime: string;
  text: string;
}

// 日付をサイトの言語・タイムゾーンで整形する。
//
// timeZone を必ず指定するのが要点。省略すると toLocaleDateString は実行環境の
// タイムゾーンで解釈するため、Astro のビルド時にビルドマシンの TZ が出力へ
// 焼き付き、ローカル（JST）と CI（UTC）で1日ずれた静的HTMLが生成される。
//
// locale / timeZone は既定値を持たせつつ引数で受ける。テストから固定値を渡せる
// ようにするためで、呼び出し側は date だけを渡せばよい。
export function formatDate(
  value: Date | string,
  locale: string = SITE_LANG,
  timeZone: string = SITE_TIMEZONE,
): FormattedDate | null {
  const date = value instanceof Date ? value : new Date(value);
  // RSS の pubDate は外部入力で欠落・不正値があり得る。Invalid Date のまま
  // 整形すると "Invalid Date" が描画されるため、ここで落として呼び出し側に委ねる。
  if (Number.isNaN(date.valueOf())) return null;

  return {
    datetime: toISODate(date, timeZone),
    text: date.toLocaleDateString(locale, { timeZone }),
  };
}

// datetime 属性用の YYYY-MM-DD を組み立てる。toISOString() は UTC 基準のため
// 表示と食い違う。表示と同じ timeZone で分解して組み立てる。
function toISODate(date: Date, timeZone: string): string {
  const { year, month, day } = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${year}-${month}-${day}`;
}
