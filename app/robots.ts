import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "../src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/workspaces",
          "/workspaces/",
          "/workspace",
          "/builder",
          "/invite",
          "/r/",
          "/welcome",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
