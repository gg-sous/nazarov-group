import type { MetadataRoute } from "next";

const routes = [
  "",
  "/services",
  "/legal/privacy",
  "/legal/personal-data-consent",
  "/legal/offer",
  "/legal/requisites",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route.startsWith("/legal") ? "yearly" : "weekly",
    priority: route === "" ? 1 : route === "/services" ? 0.8 : 0.3,
  }));
}
