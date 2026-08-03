// プロジェクトの公開ルール（draft除外・新しい順）を1箇所に集約する。
// Home・一覧・詳細で同じロジックを重複させると、片方だけ draft が漏れる事故が起きる。
//
// 引数は astro:content の型ではなく構造的な型で受ける。これにより Astro の実行環境
// なしで Vitest から直接検証でき、コンポーネントのレンダリングテスト基盤を要しない。
interface ProjectLike {
  data: { pubDate: Date; draft: boolean };
}

export function publishedProjects<T extends ProjectLike>(projects: T[]): T[] {
  return (
    projects
      .filter((p) => !p.data.draft)
      // filter が新しい配列を返すため、この sort は引数の配列を破壊しない
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  );
}
