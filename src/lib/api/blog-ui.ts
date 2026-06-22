import blog1Img from "@/assets/images/blog-1.png";
import blog2Img from "@/assets/images/blog-2.png";
import blog3Img from "@/assets/images/blog-3.png";
import blog4Img from "@/assets/images/blog-4.png";
import blog5Img from "@/assets/images/blog-5.png";
import {
  extractStoragePath,
  publicAssetUrl,
  resolveBlogImageUrl,
  rewriteCmsHtmlImages,
} from "./media-url";

const FALLBACK_COVERS = [blog1Img, blog2Img, blog3Img, blog4Img, blog5Img];

export { extractStoragePath as extractBlogImageStoragePath, publicAssetUrl as blogAssetPublicUrl };

/** Public cover URL with static fallback when missing or unresolved. */
export function blogCoverImage(url?: string | null, index = 0): string {
  return resolveBlogImageUrl(url) ?? FALLBACK_COVERS[index % FALLBACK_COVERS.length];
}

export function resolveBlogContentHtml(html: string): string {
  return rewriteCmsHtmlImages(html, "blogs");
}

export function formatBlogDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function isBlogHtmlContent(content?: string): boolean {
  if (!content?.trim()) return false;
  return /<[a-z][\s\S]*>/i.test(content);
}

/** Canonical URL slug for a blog post (handles titles stored as slug). */
export function blogCanonicalSlug(post: { slug?: string | null; title?: string }): string {
  const stored = (post.slug || "").trim();
  if (stored && /^[a-z0-9-]+$/i.test(stored)) {
    return stored.toLowerCase();
  }
  const raw = (stored || post.title || "post").toLowerCase();
  return (
    raw
      .replace(/[^\w\s-]/g, "")
      .replace(/[-\s]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 160) || "post"
  );
}

export function blogPostHref(slug: string): string {
  return `/blog/${encodeURIComponent(slug)}`;
}
