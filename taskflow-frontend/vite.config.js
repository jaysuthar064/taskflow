import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

const seoRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/privacy", changefreq: "yearly", priority: "0.4" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" }
];

const normalizeSiteUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const buildRobotsTxt = (siteUrl) => `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /login
Disallow: /register
Disallow: /auth/

Sitemap: ${siteUrl}/sitemap.xml
`;

const buildSitemapXml = (siteUrl) => {
  const urls = seoRoutes
    .map(
      ({ path: routePath, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${routePath}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const seoFilesPlugin = (siteUrl) => ({
  name: "taskflow-seo-files",
  closeBundle() {
    const outputDirectory = path.resolve(rootDirectory, "dist");

    if (!fs.existsSync(outputDirectory)) {
      return;
    }

    fs.writeFileSync(path.join(outputDirectory, "robots.txt"), buildRobotsTxt(siteUrl), "utf8");
    fs.writeFileSync(path.join(outputDirectory, "sitemap.xml"), buildSitemapXml(siteUrl), "utf8");
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDirectory, "");
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || env.FRONTEND_URL || "http://localhost:5173");

  return {
    plugins: [react(), seoFilesPlugin(siteUrl)],
    server: {
      allowedHosts: ["tonetically-nonmetric-kirstie.ngrok-free.dev"]
    }
  };
});
