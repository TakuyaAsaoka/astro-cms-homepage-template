import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // reveal.ts など DOM 依存ロジックを検証するため jsdom を使う。
    environment: "jsdom",
    // describe / it / expect をグローバルに使えるようにする。
    globals: true,
    // jsdom に無い API（IntersectionObserver）のモックを登録する。
    setupFiles: ["./vitest.setup.ts"],
  },
});
