import { describe, it, expect, beforeEach } from "vitest";
import { initReveal } from "./reveal";
import { MockIntersectionObserver } from "../test/mockIntersectionObserver";

// 直近に生成された observer を取得する。
function latestObserver(): MockIntersectionObserver {
  const list = MockIntersectionObserver.instances;
  const last = list[list.length - 1];
  if (!last) throw new Error("observer が生成されていない");
  return last;
}

describe("initReveal", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.body.innerHTML = "";
  });

  it("data-reveal 要素だけを監視対象に登録する", () => {
    document.body.innerHTML =
      "<div data-reveal></div><div data-reveal></div><div></div>";
    initReveal();
    expect(latestObserver().observed.size).toBe(2);
  });

  it("交差した要素に is-visible を付与し監視を解除する", () => {
    document.body.innerHTML = '<div data-reveal id="a"></div>';
    initReveal();
    const observer = latestObserver();
    const el = document.getElementById("a");
    if (!el) throw new Error("要素が見つからない");

    observer.trigger(el);

    expect(el.classList.contains("is-visible")).toBe(true);
    expect(observer.observed.has(el)).toBe(false);
  });

  it("reduced-motion クラス時は監視を張らない", () => {
    document.documentElement.classList.add("reduced-motion");
    document.body.innerHTML = "<div data-reveal></div>";
    const before = MockIntersectionObserver.instances.length;

    initReveal();

    expect(MockIntersectionObserver.instances.length).toBe(before);
  });

  it("再初期化で前回の observer を破棄する（冪等性）", () => {
    document.body.innerHTML = "<div data-reveal></div>";
    initReveal();
    const first = latestObserver();

    initReveal();

    expect(first.disconnected).toBe(true);
  });
});
