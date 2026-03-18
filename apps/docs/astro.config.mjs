import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";

export default defineConfig({
  output: "static",
  integrations: [mdx()],
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
