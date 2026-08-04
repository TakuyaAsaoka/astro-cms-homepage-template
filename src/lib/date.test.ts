import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

// 2026-08-01 23:00 GMT = Asia/Tokyo では 2026-08-02 08:00。
// TZ 依存のバグが再発すると、実行環境の TZ によって結果が変わる。
const CROSSING_MIDNIGHT = "Fri, 01 Aug 2026 23:00:00 GMT";

describe("formatDate", () => {
  it("実行環境のTZに関わらず指定したタイムゾーンで日付を決める", () => {
    expect(formatDate(CROSSING_MIDNIGHT, "ja", "Asia/Tokyo")).toEqual({
      datetime: "2026-08-02",
      text: "2026/8/2",
    });
  });

  it("タイムゾーンが変わると同じ日時でも日付が変わる", () => {
    expect(formatDate(CROSSING_MIDNIGHT, "ja", "UTC")).toEqual({
      datetime: "2026-08-01",
      text: "2026/8/1",
    });
  });

  it("ロケールに応じた書式で表示する", () => {
    expect(formatDate(CROSSING_MIDNIGHT, "en", "Asia/Tokyo")?.text).toBe(
      "8/2/2026",
    );
  });

  it("datetime 属性はロケールに依らず ISO 8601 の日付になる", () => {
    expect(formatDate(CROSSING_MIDNIGHT, "en", "Asia/Tokyo")?.datetime).toBe(
      "2026-08-02",
    );
  });

  it("Date オブジェクトを直接受け取れる", () => {
    expect(formatDate(new Date(CROSSING_MIDNIGHT), "ja", "Asia/Tokyo")).toEqual(
      {
        datetime: "2026-08-02",
        text: "2026/8/2",
      },
    );
  });

  it("日付が欠落している場合は null を返す", () => {
    expect(formatDate("", "ja", "Asia/Tokyo")).toBeNull();
  });

  it("解釈できない文字列は null を返す", () => {
    expect(formatDate("not a date", "ja", "Asia/Tokyo")).toBeNull();
  });
});

// Works の pubDate は暦日の "YYYY-MM-DD" で渡ってくる（src/content.config.ts）。
// 暦日は瞬間ではないので、タイムゾーンをどう指定しても日付が動いてはならない。
describe("暦日（YYYY-MM-DD）の整形", () => {
  it.each(["Asia/Tokyo", "UTC", "America/New_York", "Pacific/Kiritimati"])(
    "タイムゾーンが %s でも書いた日付から動かない",
    (timeZone) => {
      expect(formatDate("2026-01-01", "ja", timeZone)).toEqual({
        datetime: "2026-01-01",
        text: "2026/1/1",
      });
    },
  );

  it("ロケールに応じた書式で表示する", () => {
    expect(formatDate("2026-01-01", "en", "Asia/Tokyo")?.text).toBe("1/1/2026");
  });
});
