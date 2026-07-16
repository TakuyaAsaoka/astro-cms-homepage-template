import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://TakuyaAsaoka.github.io",
  // base を変更したら public/admin/config.yml の public_folder も同じ値に揃えること
  // （CMSが挿入する画像パスは自動追従しないため）
  base: "/homepage",
});
