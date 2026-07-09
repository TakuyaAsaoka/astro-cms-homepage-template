// data-reveal を付けた要素を、ビューポート進入時に一度だけ可視化する。
// js / reduced-motion クラスの付与は BaseLayout の head 内 inline script が担う（初回ペイント前）。
// このスクリプトは監視のみを責務とする。

// reduced-motion 時はCSS側で最初から可視になるため、監視自体を張らない。
const reduced = document.documentElement.classList.contains("reduced-motion");

if (!reduced) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // 一度出たら解除しない
        }
      }
    },
    // 少しスクロールしてから発火させ、初期ビューポート内要素の即時発火を和らげる
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of document.querySelectorAll("[data-reveal]")) {
    observer.observe(el);
  }
}
