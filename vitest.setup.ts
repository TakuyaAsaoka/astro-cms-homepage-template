import { beforeEach } from "vitest";
import { MockIntersectionObserver } from "./src/test/mockIntersectionObserver";

// jsdom に無い IntersectionObserver をモックへ差し替える。
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// 各テストの前に記録済みインスタンスをリセットする。
beforeEach(() => {
  MockIntersectionObserver.instances = [];
});
