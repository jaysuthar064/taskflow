import { useEffect, useMemo } from "react";

const SITE_NAME = "TaskFlow";
const DEFAULT_IMAGE_PATH = "/icon-512.png";
const DEFAULT_KEYWORDS = [
  "task management app",
  "notes and reminders",
  "task organizer",
  "productivity app",
  "checklist app"
];

const normalizeSiteUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const getSiteUrl = () => {
  const configuredUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeSiteUrl(window.location.origin);
  }

  return "http://localhost:5173";
};

const toAbsoluteUrl = (siteUrl, pathOrUrl = "/") => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, `${siteUrl}/`).toString();
};

const upsertMetaTag = (selector, attributes, content) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertLinkTag = (selector, attributes, href) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("link");
    Object.entries(attributes).forEach(([key, value]) => {
      tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

const upsertSchemaTag = (schemaValue) => {
  const selector = 'script[data-seo-schema="true"]';
  let tag = document.head.querySelector(selector);

  if (!schemaValue) {
    tag?.remove();
    return;
  }

  if (!tag) {
    tag = document.createElement("script");
    tag.setAttribute("type", "application/ld+json");
    tag.setAttribute("data-seo-schema", "true");
    document.head.appendChild(tag);
  }

  tag.textContent = schemaValue;
};

const Seo = ({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE_PATH,
  robots = "index,follow",
  type = "website",
  schema = null,
  keywords = DEFAULT_KEYWORDS,
  imageAlt = `${SITE_NAME} preview`,
  author = SITE_NAME,
  locale = "en_US"
}) => {
  const serializedSchema = useMemo(() => {
    const schemaItems = Array.isArray(schema) ? schema.filter(Boolean) : schema ? [schema] : [];

    if (schemaItems.length === 0) {
      return "";
    }

    return JSON.stringify(schemaItems.length === 1 ? schemaItems[0] : schemaItems);
  }, [schema]);

  const serializedKeywords = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(", ")
    : String(keywords || "");

  useEffect(() => {
    const siteUrl = getSiteUrl();
    const absoluteUrl = toAbsoluteUrl(siteUrl, path);
    const absoluteImageUrl = toAbsoluteUrl(siteUrl, image);

    document.title = title;

    upsertMetaTag('meta[name="description"]', { name: "description" }, description);
    upsertMetaTag('meta[name="robots"]', { name: "robots" }, robots);
    upsertMetaTag('meta[name="application-name"]', { name: "application-name" }, SITE_NAME);
    upsertMetaTag('meta[name="author"]', { name: "author" }, author);
    upsertMetaTag('meta[name="creator"]', { name: "creator" }, author);
    upsertMetaTag('meta[name="publisher"]', { name: "publisher" }, SITE_NAME);
    upsertMetaTag('meta[name="keywords"]', { name: "keywords" }, serializedKeywords);
    upsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMetaTag('meta[property="og:locale"]', { property: "og:locale" }, locale);
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMetaTag('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, absoluteUrl);
    upsertMetaTag('meta[property="og:image"]', { property: "og:image" }, absoluteImageUrl);
    upsertMetaTag('meta[property="og:image:alt"]', { property: "og:image:alt" }, imageAlt);
    upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    upsertMetaTag('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    upsertMetaTag('meta[name="twitter:url"]', { name: "twitter:url" }, absoluteUrl);
    upsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, absoluteImageUrl);
    upsertMetaTag('meta[name="twitter:image:alt"]', { name: "twitter:image:alt" }, imageAlt);

    upsertLinkTag('link[rel="canonical"]', { rel: "canonical" }, absoluteUrl);
    upsertSchemaTag(serializedSchema || null);
  }, [author, description, image, imageAlt, locale, path, robots, serializedKeywords, serializedSchema, title, type]);

  return null;
};

export default Seo;
