import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    url: z.url().optional(),
    // 公開日は暦日（どこで見ても動かない日付）であって瞬間ではないため、
    // Date ではなく "YYYY-MM-DD" で保持する。YAML はフロントマターの日付を
    // 問答無用で UTC の Date に変換するので、UTC の日付部分を取り出して戻す。
    pubDate: z.coerce.date().transform((d) => d.toISOString().slice(0, 10)),
    draft: z.boolean().default(false),
  }),
});

// SNSリンク等は空文字で「使わない＝非表示」を表すため、URL形式か空文字のみ許可する。
// CMS が空欄フィールドのキーを省略して保存してもビルドが壊れないよう空文字に既定する
const emptyableUrl = z.union([z.url(), z.literal("")]).default("");

// サイト全体の設定（CMS管理）。ビルド設定に紐づく技術的な定数
// （言語・タイムゾーン・base 等）は src/consts.ts に残す
const settings = defineCollection({
  loader: glob({ pattern: "site.yaml", base: "./src/content/settings" }),
  schema: z.object({
    // 表示必須の項目は空文字を許さない（空のままだとヘッダー・©表記が空欄で描画される）
    title: z.string().min(1),
    description: z.string().min(1),
    author: z.string().min(1),
    copyrightHolder: z.string().min(1),
    // 空文字で「連絡先にメールを表示しない」を表す（既定の理由は emptyableUrl と同じ）
    email: z.union([z.email(), z.literal("")]).default(""),
    social: z
      .object({
        github: emptyableUrl,
        twitter: emptyableUrl,
        youtube: emptyableUrl,
      })
      .default({ github: "", twitter: "", youtube: "" }),
    noteRssUrl: emptyableUrl,
  }),
});

// Homeページの文言（CMS管理）。ヒーローの表示名はサイト設定の author を使うためここには持たない
const home = defineCollection({
  loader: glob({ pattern: "home.yaml", base: "./src/content/pages" }),
  schema: z.object({
    hero: z.object({
      // ヒーローの必須文言。空のまま描画しない（settings と同じ方針で早期検知）
      role: z.string().min(1),
      tagline: z.string().min(1),
    }),
    // 空配列で「技術セクションを表示しない」を表す。
    // CMS が空リストのキーを省略して保存してもビルドが壊れないよう既定する
    skills: z.array(z.string()).default([]),
  }),
});

// Aboutページの文言（CMS管理）。セクションは追加・削除・並び替え可能
const about = defineCollection({
  loader: glob({ pattern: "about.yaml", base: "./src/content/pages" }),
  schema: z.object({
    // 表示必須の文言は空文字を許さない（settings と同じ方針で早期検知）
    lead: z.string().min(1),
    sections: z
      .array(
        z.object({
          title: z.string().min(1),
          label: z.string().min(1),
          body: z.string().min(1),
        }),
      )
      // 空配列＝セクション無し（lead のみのページ）。既定の理由は skills と同じ
      .default([]),
  }),
});

export const collections = { works, settings, home, about };
