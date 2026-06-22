import type { PublicBranding } from "./types";
import { BRAND } from "@/constants/brand";
import { cmsPlainTextFromContent } from "@/lib/api/cms-html";
import { resolvePublicMediaUrl } from "./media-url";

function withCacheBust(url: string, updatedAt?: string | null): string {
  const bust = (updatedAt ?? "").trim();
  if (!bust) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${encodeURIComponent(bust)}`;
}

/** Public URL for uploaded company logo (`/api/branding` → branding-asset or external URL). */
export function resolveBrandingLogoUrl(
  logoUrl?: string | null,
  updatedAt?: string | null,
): string | null {
  const resolved = resolvePublicMediaUrl(logoUrl, "branding");
  if (!resolved) return null;
  return withCacheBust(resolved, updatedAt);
}

/** Update tab favicon from Settings logo (index.html placeholder until branding loads). */
export function applyBrandingFavicon(
  logoUrl?: string | null,
  updatedAt?: string | null,
  fallback = "/logo_canvas.png",
): void {
  if (typeof document === "undefined") return;
  const src = resolveBrandingLogoUrl(logoUrl, updatedAt) ?? fallback;
  let link = document.querySelector<HTMLLinkElement>("link#site-favicon");
  if (!link) {
    link = document.createElement("link");
    link.id = "site-favicon";
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = src;
  if (/\.svg(\?|$)/i.test(src)) link.type = "image/svg+xml";
  else if (/\.(png|webp|gif|jpe?g)(\?|$)/i.test(src)) link.type = "image/png";
  else link.removeAttribute("type");
}

export function brandDisplayName(branding?: PublicBranding | null): string {
  return branding?.company_name?.trim() || BRAND.name;
}

/** Split company name for navbar wordmark: first two words on line 1, remainder on line 2. */
export function brandWordmarkLines(name: string): { line1: string; line2: string | null } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { line1: name.trim(), line2: null };
  }
  return {
    line1: words.slice(0, 2).join(" "),
    line2: words.slice(2).join(" "),
  };
}

export function brandAddress(branding?: PublicBranding | null): string {
  const c = branding?.company;
  const parts = [c?.address_line1, c?.address_line2, c?.city, c?.state_region, c?.postal_code, c?.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return BRAND.address;
}

export function brandPhone(branding?: PublicBranding | null): string {
  return branding?.company?.phone?.trim() || BRAND.phone;
}

export function brandEmail(branding?: PublicBranding | null): string {
  return branding?.company?.email?.trim() || BRAND.email.concierge;
}

export function footerNewsletterBlurb(branding?: PublicBranding | null): string {
  const fallback =
    "Road-trip tips, picnic packages, hospitality offers, and seasonal travel inspiration — straight to your inbox.";
  const raw = branding?.footer_description?.trim();
  if (!raw) return fallback;
  const text = cmsPlainTextFromContent(raw);
  if (!text || text.startsWith("{")) return fallback;
  return text;
}
