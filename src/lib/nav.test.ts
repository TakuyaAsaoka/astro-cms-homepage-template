import { describe, it, expect } from "vitest";
import { isNavActive } from "./nav";

const BASE = "/your-repo/";

describe("isNavActive", () => {
  it("一覧ページで自身のナビ項目がアクティブになる", () => {
    expect(isNavActive("/your-repo/works/", `${BASE}works/`, BASE)).toBe(true);
  });

  it("子ルートでも親のナビ項目がアクティブになる", () => {
    expect(
      isNavActive("/your-repo/works/sample-work/", `${BASE}works/`, BASE),
    ).toBe(true);
  });

  it("別セクションのページではアクティブにならない", () => {
    expect(isNavActive("/your-repo/blog/", `${BASE}works/`, BASE)).toBe(false);
  });

  it("前方一致でもセグメント境界を跨ぐパスには誤マッチしない", () => {
    expect(isNavActive("/your-repo/works-foo/", `${BASE}works/`, BASE)).toBe(
      false,
    );
  });

  it("HomeはHomeでのみアクティブになる", () => {
    expect(isNavActive("/your-repo/", BASE, BASE)).toBe(true);
  });

  it("Homeは子ルートではアクティブにならない", () => {
    expect(isNavActive("/your-repo/works/", BASE, BASE)).toBe(false);
  });

  it("末尾スラッシュの有無に依存しない", () => {
    expect(isNavActive("/your-repo/works", `${BASE}works/`, BASE)).toBe(true);
  });
});

// 独自ドメイン・ユーザーサイト（base "/"）のデプロイ形態。
// normalizePath("/") は空文字になり Home 比較が "" === "" になる別経路のため、
// プロジェクトサイト（/your-repo/）とは別に固定する
describe("isNavActive（base が / のデプロイ形態）", () => {
  it("HomeはHomeでのみアクティブになる", () => {
    expect(isNavActive("/", "/", "/")).toBe(true);
  });

  it("Homeは他セクションではアクティブにならない", () => {
    expect(isNavActive("/blog/", "/", "/")).toBe(false);
  });

  it("子ルートでも親のナビ項目がアクティブになる", () => {
    expect(isNavActive("/works/sample-work/", "/works/", "/")).toBe(true);
  });
});
