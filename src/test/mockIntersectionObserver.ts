// jsdom は IntersectionObserver を実装しないため、テスト用のモックを提供する。
// observe / unobserve / disconnect の呼び出しを記録し、trigger で交差を再現できる。

type IOCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

export class MockIntersectionObserver implements IntersectionObserver {
  // 生成されたインスタンスを記録する（テストから最新の observer を参照するため）。
  static instances: MockIntersectionObserver[] = [];

  readonly root: Element | Document | null = null;
  readonly rootMargin: string;
  readonly scrollMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  readonly observed = new Set<Element>();
  disconnected = false;
  private readonly callback: IOCallback;

  constructor(callback: IOCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "";
    MockIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.add(target);
  }

  unobserve(target: Element): void {
    this.observed.delete(target);
  }

  disconnect(): void {
    this.observed.clear();
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // テスト補助: 指定要素が交差したとして callback を発火する。
  trigger(target: Element): void {
    const entry = {
      target,
      isIntersecting: true,
    } as IntersectionObserverEntry;
    this.callback([entry], this);
  }
}
