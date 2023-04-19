import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./remark-reading-time";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    site: "https://example.com",
    markdown: {
        syntaxHighlight: "prism",
        remarkPlugins: [remarkReadingTime]
    },
    vite: {
        ssr: {
            external: ["svgo"]
        }
    },
    integrations: [mdx(), sitemap(), tailwind()]
});
