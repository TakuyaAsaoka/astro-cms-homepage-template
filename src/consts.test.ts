import { describe, it, expect } from "vitest";
import { ensureTrailingSlash } from "./consts";

describe("ensureTrailingSlash", () => {
  it("末尾スラッシュが無い場合は付与する", () => {
    expect(ensureTrailingSlash("/homepage")).toBe("/homepage/");
  });

  it("末尾スラッシュが既に有る場合はそのまま返す", () => {
    expect(ensureTrailingSlash("/homepage/")).toBe("/homepage/");
  });

  it("ルートパス（/）はそのまま返す", () => {
    expect(ensureTrailingSlash("/")).toBe("/");
  });
});
