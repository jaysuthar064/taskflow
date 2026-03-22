import { useEffect, useMemo } from "react";

const SITE_NAME = "TaskFlow";
const DEFAULT_IMAGE_PATH = "/icon-512.png";

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
  schema = null
}) => {
  const serializedSchema = useMemo(() => {
    if (!schema) {
      return "";
    }

    return JSON.stringify(schema);
  }, [schema]);

  useEffect(() => {
    const siteUrl = getSiteUrl();
    const absoluteUrl = toAbsoluteUrl(siteUrl, path);
    const absoluteImageUrl = toAbsoluteUrl(siteUrl, image);

    document.title = title;

    upsertMetaTag('meta[name="description"]', { name: "description" }, description);
    upsertMetaTag('meta[name="robots"]', { name: "robots" }, robots);
    upsertMetaTag('meta[name="application-name"]', { name: "application-name" }, SITE_NAME);
    upsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, title);
    upsertMetaTag('meta[property="og:description"]', { property: "og:description" }, description);
    upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, absoluteUrl);
    upsertMetaTag('meta[property="og:image"]', { property: "og:image" }, absoluteImageUrl);
    upsertMetaTag('meta[property="og:image:alt"]', { property: "og:image:alt" }, `${SITE_NAME} preview`);
    upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, title);
    upsertMetaTag('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    upsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, absoluteImageUrl);

    upsertLinkTag('link[rel="canonical"]', { rel: "canonical" }, absoluteUrl);
    upsertSchemaTag(serializedSchema || null);
  }, [description, image, path, robots, serializedSchema, title, type]);

  return null;
};

export default Seo;
