import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
}

type MetaDefaults = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
};

let defaultsCache: MetaDefaults | null = null;

/**
 * Dynamic SEO meta tag manager.
 * Updates document.title and all relevant meta/og/twitter tags
 * whenever the provided options change.
 *
 * Usage:
 *   useSEO({ title: "حذاء رياضي", description: "...", ogImage: "/uploads/shoe.jpg" });
 */
export function useSEO(options: SEOOptions) {
  const { title, description, ogImage, ogType, canonicalPath } = options;
  const defaults = getSeoDefaults();

  useEffect(() => {
    document.title = title || defaults.title;
  }, [defaults.title, title]);

  useEffect(() => {
    const resolvedDescription = description ?? defaults.description;
    setMeta("name", "description", resolvedDescription);
    setMeta("property", "og:description", resolvedDescription);
    setMeta("name", "twitter:description", resolvedDescription);
  }, [defaults.description, description]);

  useEffect(() => {
    const resolvedTitle = title || defaults.title;
    setMeta("property", "og:title", resolvedTitle);
    setMeta("name", "twitter:title", resolvedTitle);
  }, [defaults.title, title]);

  useEffect(() => {
    const resolvedImage = toAbsoluteUrl(ogImage || defaults.ogImage);
    setMeta("property", "og:image", resolvedImage);
    setMeta("name", "twitter:image", resolvedImage);
    setMeta("name", "twitter:card", resolvedImage ? "summary_large_image" : defaults.twitterCard);
  }, [defaults.ogImage, defaults.twitterCard, ogImage]);

  useEffect(() => {
    setMeta("property", "og:type", ogType || defaults.ogType);
  }, [defaults.ogType, ogType]);

  useEffect(() => {
    const url = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : window.location.href;
    setMeta("property", "og:url", url);

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }, [canonicalPath]);
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function getSeoDefaults(): MetaDefaults {
  if (defaultsCache) {
    return defaultsCache;
  }

  defaultsCache = {
    title: document.title || "Ecomax Store - متجر إلكتروني",
    description: readMeta("name", "description") || "منصة تجارة إلكترونية احترافية مخصصة للسوق الجزائري.",
    ogTitle: readMeta("property", "og:title") || document.title || "Ecomax Store - متجر إلكتروني",
    ogDescription: readMeta("property", "og:description") || readMeta("name", "description") || "منصة تجارة إلكترونية احترافية مخصصة للسوق الجزائري.",
    ogImage: readMeta("property", "og:image") || "/images/logo-cart.svg",
    ogType: readMeta("property", "og:type") || "website",
    twitterTitle: readMeta("name", "twitter:title") || document.title || "Ecomax Store - متجر إلكتروني",
    twitterDescription: readMeta("name", "twitter:description") || readMeta("name", "description") || "منصة تجارة إلكترونية احترافية مخصصة للسوق الجزائري.",
    twitterImage: readMeta("name", "twitter:image") || readMeta("property", "og:image") || "/images/logo-cart.svg",
    twitterCard: readMeta("name", "twitter:card") || "summary_large_image",
  };

  return defaultsCache;
}

function readMeta(attr: "name" | "property", key: string) {
  return (document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null)?.getAttribute("content") || "";
}

function toAbsoluteUrl(url: string) {
  if (!url) {
    return "";
  }

  return url.startsWith("http") ? url : `${window.location.origin}${url}`;
}
