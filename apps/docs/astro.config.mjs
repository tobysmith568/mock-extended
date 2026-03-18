import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";

export default defineConfig({
  site: process.env.ASTRO_SITE ?? "http://localhost:4321",
  output: "static",
  build: {
    format: "file",
  },
  publicDir: "src/public",
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    remarkPlugins: [remarkGfm, remarkSmartypants],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            ariaLabel: "Link to section",
            className: ["heading-anchor"],
          },
          content: {
            type: "text",
            value: " #",
          },
        },
      ],
    ],
  },
});
