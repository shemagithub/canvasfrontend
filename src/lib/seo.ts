import { BRAND } from "@/constants/brand";
import type { PublicBlogPost, PublicBranding, PublicDestination, PublicVehicle } from "@/lib/api/types";
import { upgradeToHttpsIfNeeded } from "@/lib/api/config";
import { brandAddress, brandDisplayName, brandEmail, brandPhone, resolveBrandingLogoUrl } from "@/lib/api/branding-ui";
import { vehicleDisplayName, vehicleImage } from "@/lib/api/vehicles";
import { blogCoverImage } from "@/lib/api/blog-ui";

/** Default Open Graph share image (1200×630). */
export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;


export type SeoPayload = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  type?: OgType;
  canonicalPath?: string;
  noindex?: boolean;
  siteName?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Public site origin for canonical and Open Graph URLs. */
export function getSiteOrigin(): string {
  const env = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (env) return env.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  return "http://localhost:5173";
}

export function absoluteUrl(pathOrUrl: string | null | undefined, origin = getSiteOrigin()): string | undefined {
  const raw = (pathOrUrl ?? "").trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return upgradeToHttpsIfNeeded(raw);
  if (raw.startsWith("//")) return `https:${raw}`;
  const base = origin.replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${path}`;
}

export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function formatPageTitle(title: string, brand: string): string {
  const t = title.trim();
  const b = brand.trim();
  if (!t) return b;
  if (t.toLowerCase().includes(b.toLowerCase())) return t;
  return `${t} | ${b}`;
}

function upsertMetaByName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeMetaByName(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

function removeMetaByProperty(property: string) {
  document.querySelector(`meta[property="${property}"]`)?.remove();
}

const JSON_LD_ID = "site-json-ld";

function applyJsonLd(data?: SeoPayload["jsonLd"]) {
  document.getElementById(JSON_LD_ID)?.remove();
  if (!data) return;
  const items = Array.isArray(data) ? data : [data];
  if (!items.length) return;
  const script = document.createElement("script");
  script.id = JSON_LD_ID;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(items.length === 1 ? items[0] : items);
  document.head.appendChild(script);
}

/** Apply title, meta, Open Graph, Twitter, canonical, and JSON-LD to document head. */
export function applySeo(payload: Required<Pick<SeoPayload, "title" | "description">> & SeoPayload) {
  const origin = getSiteOrigin();
  const canonical = absoluteUrl(payload.canonicalPath ?? "/", origin)!;
  const image = absoluteUrl(payload.image, origin);
  const type = payload.type ?? "website";
  const robots = payload.noindex ? "noindex, nofollow" : "index, follow";

  document.title = payload.title;
  upsertMetaByName("description", payload.description);
  upsertMetaByName("robots", robots);
  upsertLink("canonical", canonical);
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const lang of ["en", "x-default"]) {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.href = canonical;
    document.head.appendChild(link);
  }

  if (payload.keywords?.trim()) {
    upsertMetaByName("keywords", payload.keywords.trim());
  } else {
    removeMetaByName("keywords");
  }

  upsertMetaByName("author", payload.siteName?.trim() || BRAND.name);
  upsertMetaByName("geo.region", "RW");
  upsertMetaByName("geo.placename", "Rwanda");

  upsertMetaByProperty("og:title", payload.title);
  upsertMetaByProperty("og:description", payload.description);
  upsertMetaByProperty("og:type", type);
  upsertMetaByProperty("og:url", canonical);
  upsertMetaByProperty("og:site_name", payload.siteName?.trim() || BRAND.name);
  upsertMetaByProperty("og:locale", "en_US");

  upsertMetaByName("twitter:card", image ? "summary_large_image" : "summary");
  upsertMetaByName("twitter:title", payload.title);
  upsertMetaByName("twitter:description", payload.description);

  if (image) {
    upsertMetaByProperty("og:image", image);
    upsertMetaByName("twitter:image", image);
    const alt = payload.imageAlt?.trim() || payload.title;
    upsertMetaByProperty("og:image:alt", alt);
    upsertMetaByName("twitter:image:alt", alt);
    if (image.includes(OG_IMAGE_PATH)) {
      upsertMetaByProperty("og:image:width", String(OG_IMAGE_WIDTH));
      upsertMetaByProperty("og:image:height", String(OG_IMAGE_HEIGHT));
    } else {
      removeMetaByProperty("og:image:width");
      removeMetaByProperty("og:image:height");
    }
  } else {
    removeMetaByProperty("og:image");
    removeMetaByName("twitter:image");
  }

  if (type === "article") {
    upsertMetaByProperty("og:type", "article");
  }

  applyJsonLd(payload.jsonLd);
}

export function defaultOgImage(_branding?: PublicBranding | null): string | undefined {
  return absoluteUrl(OG_IMAGE_PATH);
}

export function organizationLogoUrl(branding?: PublicBranding | null): string | undefined {
  const logo = resolveBrandingLogoUrl(branding?.logo_url, branding?.updated_at);
  return absoluteUrl(logo ?? "/logo_canvas.png");
}

export function buildOrganizationJsonLd(branding?: PublicBranding | null): Record<string, unknown> {
  const name = brandDisplayName(branding);
  const origin = getSiteOrigin();
  const logo = organizationLogoUrl(branding);
  const shareImage = defaultOgImage(branding);
  const sameAs = Object.values(branding?.social_links ?? {}).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name,
    url: origin,
    logo,
    image: shareImage,
    description: branding?.company?.description?.trim() || BRAND.positioning,
    telephone: brandPhone(branding),
    email: brandEmail(branding),
    address: {
      "@type": "PostalAddress",
      streetAddress: brandAddress(branding),
      addressCountry: "RW",
    },
    areaServed: {
      "@type": "Country",
      name: "Rwanda",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildWebsiteJsonLd(branding?: PublicBranding | null): Record<string, unknown> {
  const name = brandDisplayName(branding);
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/fleet?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildVehicleJsonLd(
  vehicle: PublicVehicle,
  branding?: PublicBranding | null,
): Record<string, unknown> {
  const name = vehicleDisplayName(vehicle);
  const origin = getSiteOrigin();
  const url = `${origin}/car-details/${vehicle.id}`;
  const image = absoluteUrl(vehicleImage(vehicle), origin);
  const brand = brandDisplayName(branding);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: `${name} — ${vehicle.category ?? "vehicle"} rental from ${brand}.`,
    url,
    image,
    brand: { "@type": "Brand", name: vehicle.brand ?? brand },
    offers: vehicle.daily_rate
      ? {
          "@type": "Offer",
          price: vehicle.daily_rate,
          priceCurrency: branding?.currency ?? "USD",
          availability: vehicle.status === "available" ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
          url,
        }
      : undefined,
  };
}

export function buildArticleJsonLd(
  post: PublicBlogPost,
  branding?: PublicBranding | null,
): Record<string, unknown> {
  const origin = getSiteOrigin();
  const url = `${origin}/blog/${post.slug}`;
  const image = absoluteUrl(blogCoverImage(post.cover_image_url), origin);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? truncateDescription(post.content ?? "", 160),
    url,
    image,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: brandDisplayName(branding) },
    publisher: {
      "@type": "Organization",
      name: brandDisplayName(branding),
      logo: organizationLogoUrl(branding)
        ? { "@type": "ImageObject", url: organizationLogoUrl(branding) }
        : undefined,
    },
  };
}

export function buildDestinationJsonLd(
  destination: PublicDestination,
  branding?: PublicBranding | null,
): Record<string, unknown> {
  const origin = getSiteOrigin();
  const slug = destination.slug || destination.id;
  const url = `${origin}/destinations/${encodeURIComponent(slug)}`;
  const image = absoluteUrl(destination.cover_image_url, origin);
  const brand = brandDisplayName(branding);
  const highlights = (destination.highlights ?? []).filter(Boolean).slice(0, 8);

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: destination.title,
    description: truncateDescription(destination.description || `${destination.title} — Rwanda tour package`, 300),
    url,
    image,
    touristType: "Leisure",
    provider: { "@type": "Organization", name: brand, url: origin },
    itinerary: highlights.length
      ? {
          "@type": "ItemList",
          itemListElement: highlights.map((name, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name,
          })),
        }
      : undefined,
    offers:
      Number(destination.price_amount) > 0
        ? {
            "@type": "Offer",
            price: destination.price_amount,
            priceCurrency: destination.price_currency || "USD",
            url: `${origin}/booking?package=${encodeURIComponent(slug)}`,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  const origin = getSiteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, origin),
    })),
  };
}
