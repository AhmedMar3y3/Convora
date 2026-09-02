import type { MetadataRoute } from "next";
import { audioTools, otherTools, tools, videoTools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["", "/tools", "/tools/images", "/tools/audio", "/tools/documents", "/tools/pdf", "/tools/video", "/tools/other", ...tools.map((tool) => tool.route), ...audioTools.map((tool) => tool.route), ...videoTools.map((tool) => tool.route), ...otherTools.map((tool) => tool.route)];

  return routes.map((route) => ({
    url: `https://convora.vercel.app${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/tools/images" || route === "/tools/audio" || route === "/tools/video" || route === "/tools/other" ? 0.8 : 0.7,
  }));
}
