// 制作の公開ルール（draft除外・新しい順）を1箇所に集約する。
// Home・一覧・詳細で同じロジックを重複させると、片方だけ draft が漏れる事故が起きる。
//
// 引数は astro:content の型ではなく構造的な型で受ける。これにより Astro の実行環境
// なしで Vitest から直接検証でき、コンポーネントのレンダリングテスト基盤を要しない。
interface WorkLike {
  // pubDate は暦日の "YYYY-MM-DD"（src/content.config.ts 参照）。
  data: { pubDate: string; draft: boolean };
}

export function publishedWorks<T extends WorkLike>(works: T[]): T[] {
  return (
    works
      .filter((w) => !w.data.draft)
      // filter が新しい配列を返すため、この sort は引数の配列を破壊しない。
      // "YYYY-MM-DD" は辞書順が時系列順と一致するため文字列比較でよい。
      .sort((a, b) => b.data.pubDate.localeCompare(a.data.pubDate))
  );
}
