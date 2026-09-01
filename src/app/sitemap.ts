import type { MetadataRoute } from "next";
import { tools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/tools", "/tools/images", "/tools/audio", "/tools/documents", "/tools/pdf", "/tools/video", ...tools.map((tool) => tool.route)];

  return routes.map((route) => ({
    url: `https://convora.vercel.app${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/tools/images" ? 0.8 : 0.7,
  }));
}
