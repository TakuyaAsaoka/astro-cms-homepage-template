import { describe, it, expect } from "vitest";
import { publishedProjects } from "./projects";

// テスト用のエントリを組み立てる。publishedProjects が参照するフィールドのみを持つ。
const entry = (id: string, pubDate: string, draft = false) => ({
  id,
  data: { pubDate: new Date(pubDate), draft },
});

describe("publishedProjects", () => {
  it("draftのエントリを除外する", () => {
    const result = publishedProjects([
      entry("published", "2026-01-01"),
      entry("drafted", "2026-02-01", true),
    ]);

    expect(result.map((p) => p.id)).toEqual(["published"]);
  });

  it("pubDateの降順（新しい順）で返す", () => {
    const result = publishedProjects([
      entry("old", "2026-01-01"),
      entry("new", "2026-03-01"),
      entry("middle", "2026-02-01"),
    ]);

    expect(result.map((p) => p.id)).toEqual(["new", "middle", "old"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(publishedProjects([])).toEqual([]);
  });

  it("全てdraftの場合は空配列を返す", () => {
    const result = publishedProjects([
      entry("a", "2026-01-01", true),
      entry("b", "2026-02-01", true),
    ]);

    expect(result).toEqual([]);
  });

  it("引数の配列を破壊しない", () => {
    const input = [entry("old", "2026-01-01"), entry("new", "2026-03-01")];

    publishedProjects(input);

    expect(input.map((p) => p.id)).toEqual(["old", "new"]);
  });
});
