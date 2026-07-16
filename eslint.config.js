import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // ビルド成果物と生成物は対象外にする。
  { ignores: ["dist/", ".astro/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // 整形系ルールは Prettier に委ねるため最後に無効化する。
  prettier,
];
