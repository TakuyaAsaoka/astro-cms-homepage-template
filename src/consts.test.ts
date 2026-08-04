import { describe, it, expect } from "vitest";
import {
  ensureTrailingSlash,
  BASE_PATH,
  DEFAULT_OG_IMAGE,
  COPYRIGHT_HOLDER,
  SITE_LANG,
  SITE_LOCALE,
} from "./consts";

describe("ensureTrailingSlash", () => {
  it("末尾スラッシュが無い場合は付与する", () => {
    expect(ensureTrailingSlash("/your-repo")).toBe("/your-repo/");
  });

  it("末尾スラッシュが既に有る場合はそのまま返す", () => {
    expect(ensureTrailingSlash("/your-repo/")).toBe("/your-repo/");
  });

  it("ルートパス（/）はそのまま返す", () => {
    expect(ensureTrailingSlash("/")).toBe("/");
  });
});

describe("DEFAULT_OG_IMAGE", () => {
  it("BASE_PATH配下のimages/og.pngを指す", () => {
    expect(DEFAULT_OG_IMAGE).toBe(`${BASE_PATH}images/og.png`);
  });

  it("末尾がimages/og.pngで終わる", () => {
    expect(DEFAULT_OG_IMAGE.endsWith("images/og.png")).toBe(true);
  });
});

describe("SITE_LOCALE", () => {
  it("BCP47の言語-地域形式（例: ja-JP）である", () => {
    expect(SITE_LOCALE).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
  });

  it("SITE_LANGと同じ言語で始まる", () => {
    expect(SITE_LOCALE.startsWith(SITE_LANG)).toBe(true);
  });
});

describe("COPYRIGHT_HOLDER", () => {
  it("空でない文字列が定義されている", () => {
    expect(COPYRIGHT_HOLDER.length).toBeGreaterThan(0);
  });
});
