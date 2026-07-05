import type { MetadataRoute } from "next";
import { siteConfig } from "../src/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortTitle,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#4f46e5",
    lang: "en-IN",
    categories: ["business", "productivity"],
  };
}
