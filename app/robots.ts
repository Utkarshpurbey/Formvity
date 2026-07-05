import type { MetadataRoute } from "next";
import { absoluteUrl } from "../src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/workspaces", "/workspace", "/builder", "/invite", "/r/", "/welcome"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
