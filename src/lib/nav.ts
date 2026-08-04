// アクティブ判定は末尾スラッシュの有無に依存しないよう正規化して比較する
function normalizePath(path: string): string {
  return path.replace(/\/$/, "");
}

// ナビ項目のアクティブ判定。
// Home（basePath）はあらゆるパスの先頭に一致するため完全一致で判定する。
// それ以外は子ルート（例: /works/[slug]）でも親ナビをアクティブにするため
// 前方一致で判定する。ただし /works が /works-foo に誤マッチしないよう
// セグメント境界（自身、または "/" 配下）で判定する。
export function isNavActive(
  currentPath: string,
  href: string,
  basePath: string,
): boolean {
  const current = normalizePath(currentPath);
  const target = normalizePath(href);
  if (target === normalizePath(basePath)) return current === target;
  return current === target || current.startsWith(`${target}/`);
}
