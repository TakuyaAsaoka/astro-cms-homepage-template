import Parser from "rss-parser";

// RSSフィードの1記事。pubDate は欠落時 "" とし、フィードが返した文字列を
// そのまま保持する（Date にすると欠落も不正値も Invalid Date に潰れる）。
// 空文字・不正値をどう描画するかは FormattedDate.astro が引き受ける。
export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
}

// RSSフィードを取得して FeedItem[] に変換する。
// テンプレート初期状態（URL未設定）や取得失敗でもビルドを落とさないため、
// 異常系はすべて空配列で表現する（Home 側は空配列 = セクション非描画）。
// 件数制限は持たせない。publishedWorks と同様、呼び出し側の .slice で行う。
export async function fetchFeedItems(url: string): Promise<FeedItem[]> {
  if (url === "") return [];

  try {
    const feed = await new Parser().parseURL(url);
    // title / link を欠く項目は描画すると壊れる（読み上げ名のないリンク・
    // href="" の自己リンク）ため除外する。flatMap で型アサーションなしに絞り込む。
    return (feed.items ?? []).flatMap((item) =>
      item.title && item.link
        ? [{ title: item.title, link: item.link, pubDate: item.pubDate ?? "" }]
        : [],
    );
  } catch (e) {
    console.error("Failed to fetch RSS feed:", e);
    return [];
  }
}
