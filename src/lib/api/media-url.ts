import { getApiBase, normalizePublicAssetUrl, upgradeToHttpsIfNeeded } from "./config";

/** Storage subfolders that have public asset endpoints on the API. */
export type MediaFolder = "vehicles" | "blogs" | "testimonials" | "team" | "about" | "branding" | "destinations";

const APP_PREFIX = "carrental";
const FILES_MARKER = "/api/files/";

const PUBLIC_ENDPOINT: Record<MediaFolder, string> = {
  vehicles: "vehicle-asset",
  blogs: "blog-asset",
  testimonials: "testimonial-asset",
  team: "team-asset",
  about: "about-asset",
  branding: "branding-asset",
  destinations: "destination-asset",
};

/** Extract a normalized `{app}/{folder}/...` storage key from admin / editor values. */
export function extractStoragePath(raw: string, folder: MediaFolder): string | null {
  let path = (raw ?? "").trim();
  if (!path) return null;

  const endpoint = PUBLIC_ENDPOINT[folder];
  if (path.includes(`/api/public/${endpoint}`)) return null;

  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    /* use path as-is */
  }

  path = path.split("?")[0].split("#")[0];
  const markerIdx = path.indexOf(FILES_MARKER);
  if (markerIdx >= 0) {
    path = path.slice(markerIdx + FILES_MARKER.length);
  }
  path = path.replace(/^\/+/, "").replace(/\\/g, "/");

  if (folder === "vehicles") {
    return /^[a-z0-9_-]+\/vehicles\/.+/i.test(path) ? path : null;
  }

  if (folder === "branding") {
    if (path.startsWith(`${APP_PREFIX}/branding/`)) return path;
    if (path.startsWith("branding/")) return `${APP_PREFIX}/${path}`;
    return null;
  }

  if (folder === "destinations") {
    if (path.startsWith(`${APP_PREFIX}/destinations/`)) return path;
    if (path.startsWith("destinations/")) return `${APP_PREFIX}/${path}`;
    return null;
  }

  const fullPrefix = `${APP_PREFIX}/${folder}/`;
  if (path.startsWith(fullPrefix)) return path;
  if (path.startsWith(`${folder}/`)) return `${APP_PREFIX}/${path}`;

  if (!path.includes("/") && /^[\w.-]+\.(jpe?g|png|webp|gif|mp4|webm|mov|m4v|avi)$/i.test(path)) {
    return `${fullPrefix}${path}`;
  }

  return null;
}

/** Build a no-auth public asset URL for a normalized storage path. */
export function publicAssetUrl(folder: MediaFolder, storagePath: string): string {
  const base = getApiBase();
  if (folder === "branding") {
    return `${base}/api/public/branding-asset`;
  }
  const endpoint = PUBLIC_ENDPOINT[folder];
  return `${base}/api/public/${endpoint}?path=${encodeURIComponent(storagePath)}`;
}

/**
 * Resolve any stored image reference to a browser-safe public URL.
 * Accepts absolute URLs, `/api/files/...`, `carrental/{folder}/...`, or bare filenames.
 */
export function resolvePublicMediaUrl(
  raw?: string | null,
  folder?: MediaFolder,
  fallback?: string | null,
): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return fallback ?? null;

  if (trimmed.includes("/api/public/")) {
    return normalizePublicAssetUrl(trimmed) ?? upgradeToHttpsIfNeeded(trimmed);
  }

  if (/^https?:\/\//i.test(trimmed)) {
    if (folder) {
      const storage = extractStoragePath(trimmed, folder);
      if (storage) return publicAssetUrl(folder, storage);
    }
    return normalizePublicAssetUrl(trimmed) ?? upgradeToHttpsIfNeeded(trimmed);
  }

  if (folder) {
    const storage = extractStoragePath(trimmed, folder);
    if (storage) return publicAssetUrl(folder, storage);
  }

  return fallback ?? null;
}

export function resolveAboutImageUrl(stored?: string | null): string | null {
  return resolvePublicMediaUrl(stored, "about");
}

export function resolveTeamPhotoUrl(stored?: string | null): string | null {
  return resolvePublicMediaUrl(stored, "team");
}

export function resolveTestimonialAvatarUrl(stored?: string | null): string | null {
  return resolvePublicMediaUrl(stored, "testimonials");
}

export function resolveBlogImageUrl(stored?: string | null): string | null {
  return resolvePublicMediaUrl(stored, "blogs");
}

/** @deprecated Use `resolveBrandingLogoUrl` from `branding-ui.ts` (supports cache bust). */
export function resolveBrandingLogoUrl(stored?: string | null): string | null {
  return resolvePublicMediaUrl(stored, "branding");
}

/** Rewrite `/api/files/carrental/blogs/...` img src in HTML to public blog-asset URLs. */
export function rewriteCmsHtmlImages(html: string, folder: MediaFolder = "blogs"): string {
  if (!html?.trim()) return html ?? "";

  const rewriteSrc = (src: string): string => {
    const storage = extractStoragePath(src, folder);
    if (storage) return publicAssetUrl(folder, storage);
    return normalizePublicAssetUrl(src) ?? upgradeToHttpsIfNeeded(src);
  };

  let out = html.replace(
    /(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'])/gi,
    (_m, pre, src, post) => `${pre}${rewriteSrc(src)}${post}`,
  );

  out = out.replace(
    /(<img\b[^>]*\bsrc\s*=\s*)([^\s>"']+)(?=\s|>)/gi,
    (_m, pre, src) => `${pre}${rewriteSrc(src)}`,
  );

  return out;
}
