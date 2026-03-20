import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
}

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

  useEffect(() => {
    if (!title) return;
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (description === undefined) return;
    setMeta("name", "description", description);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:description", description);
  }, [description]);

  useEffect(() => {
    if (!title) return;
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);
  }, [title]);

  useEffect(() => {
    if (ogImage === undefined) return;
    const absoluteImage = ogImage && !ogImage.startsWith("http")
      ? `${window.location.origin}${ogImage}`
      : ogImage;
    if (absoluteImage) {
      setMeta("property", "og:image", absoluteImage);
      setMeta("name", "twitter:image", absoluteImage);
      setMeta("name", "twitter:card", "summary_large_image");
    }
  }, [ogImage]);

  useEffect(() => {
    if (!ogType) return;
    setMeta("property", "og:type", ogType);
  }, [ogType]);

  useEffect(() => {
    if (!canonicalPath) return;
    const url = `${window.location.origin}${canonicalPath}`;
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
