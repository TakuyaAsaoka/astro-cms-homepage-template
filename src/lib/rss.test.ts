import { afterEach, describe, expect, it, vi } from "vitest";
import Parser from "rss-parser";
import { fetchFeedItems } from "./rss";

// parseURL をモックし、ネットワークに一切触れずにフィード応答を再現する。
// 型上 items は必須だが実行時には欠け得るため、その状況を再現できるよう
// 戻り値型へのキャストで受ける（このズレの検証自体がテストの目的）。
const mockParseURL = (feed: unknown) =>
  vi
    .spyOn(Parser.prototype, "parseURL")
    .mockResolvedValue(feed as Awaited<ReturnType<Parser["parseURL"]>>);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchFeedItems", () => {
  it("URLが空文字なら parseURL を呼ばずに空配列を返す", async () => {
    const spy = mockParseURL({ items: [] });

    const result = await fetchFeedItems("");

    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("正常なフィードを FeedItem[] に変換する", async () => {
    mockParseURL({
      items: [
        {
          title: "記事1",
          link: "https://note.com/a/n/1",
          pubDate: "Mon, 01 Jun 2026 00:00:00 GMT",
        },
        {
          title: "記事2",
          link: "https://note.com/a/n/2",
          pubDate: "Tue, 02 Jun 2026 00:00:00 GMT",
        },
      ],
    });

    const result = await fetchFeedItems("https://note.com/a/rss");

    expect(result).toEqual([
      {
        title: "記事1",
        link: "https://note.com/a/n/1",
        pubDate: "Mon, 01 Jun 2026 00:00:00 GMT",
      },
      {
        title: "記事2",
        link: "https://note.com/a/n/2",
        pubDate: "Tue, 02 Jun 2026 00:00:00 GMT",
      },
    ]);
  });

  it("title または link を欠く項目を除外する", async () => {
    mockParseURL({
      items: [
        { link: "https://note.com/a/n/1", pubDate: "" },
        { title: "linkなし", pubDate: "" },
        { title: "正常", link: "https://note.com/a/n/3", pubDate: "" },
      ],
    });

    const result = await fetchFeedItems("https://note.com/a/rss");

    expect(result.map((item) => item.title)).toEqual(["正常"]);
  });

  it("pubDate 欠落時は空文字になる", async () => {
    mockParseURL({
      items: [{ title: "日付なし", link: "https://note.com/a/n/1" }],
    });

    const result = await fetchFeedItems("https://note.com/a/rss");

    expect(result).toEqual([
      { title: "日付なし", link: "https://note.com/a/n/1", pubDate: "" },
    ]);
  });

  it("parseURLが例外を投げたら空配列を返す", async () => {
    vi.spyOn(Parser.prototype, "parseURL").mockRejectedValue(
      new Error("network error"),
    );
    // テスト出力を汚さないよう console.error を抑止しつつ、呼び出しは検証する
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await fetchFeedItems("https://note.com/a/rss");

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("feed.itemsがundefinedでも空配列を返す", async () => {
    mockParseURL({});

    const result = await fetchFeedItems("https://note.com/a/rss");

    expect(result).toEqual([]);
  });
});
