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

export const collections = { works };
