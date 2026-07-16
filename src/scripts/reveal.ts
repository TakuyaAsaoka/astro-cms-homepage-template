// data-reveal を付けた要素を、ビューポート進入時に一度だけ可視化する。
// ClientRouter 遷移に対応するため初期化を関数化し、初回実行 + astro:page-load で再実行する。
// init は冪等（冒頭で前回の observer を破棄）で、遷移での多重監視を防ぐ。
// js / reduced-motion クラスの付与は BaseLayout の head 内 is:inline が担う。

let observer: IntersectionObserver | null = null;

export function initReveal() {
  // 冪等化: 前回の監視を破棄する（遷移での多重監視を防ぐ）。
  observer?.disconnect();
  observer = null;

  // reduced-motion 時はCSS側で最初から可視になるため、監視自体を張らない。
  if (document.documentElement.classList.contains("reduced-motion")) return;

  const obs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // 一度出たら解除する
        }
      }
    },
    // 少しスクロールしてから発火させ、初期ビューポート内要素の即時発火を和らげる
    { rootMargin: "0px 0px -10% 0px" },
  );

  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    obs.observe(el);
  }
  observer = obs;
}

// 初回は即実行する（astro:page-load の初回発火は window.load 時で遅いため）。
initReveal();
// 遷移後は astro:page-load で再初期化する。
document.addEventListener("astro:page-load", initReveal);
