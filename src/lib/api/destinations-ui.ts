import type { PublicDestination } from "./types";
import { normalizePublicAssetUrl } from "./config";
import { resolvePublicMediaUrl } from "./media-url";
import type { DestinationsPageSections } from "./destinations-cms";

export type DestinationDisplay = PublicDestination & {
  priceLabel: string;
  /** True when the package exists in the admin API and can be booked online. */
  bookable: boolean;
};

/** Resolve CMS hero image storage paths to public URLs. */
export function resolveDestinationHeroImages(sections?: DestinationsPageSections["hero"]): string[] {
  const paths = sections?.images ?? [];
  return paths
    .map((p) => resolvePublicMediaUrl(p, "destinations"))
    .filter((u): u is string => Boolean(u));
}

export function buildHeroSlideshowUrls(
  sections: DestinationsPageSections["hero"] | undefined,
  destinations: PublicDestination[],
  fallbackUrl: string,
): string[] {
  const fromCms = resolveDestinationHeroImages(sections);
  if (fromCms.length) return fromCms;
  const fromPackages = destinations
    .map((d) => normalizeDestinationCoverUrl(d.cover_image_url))
    .filter((u): u is string => Boolean(u?.trim()));
  if (fromPackages.length) return fromPackages;
  return [fallbackUrl];
}

export function normalizeDestinationCoverUrl(url?: string | null): string | null {
  const normalized = normalizePublicAssetUrl(url);
  if (normalized) return normalized;
  const raw = (url ?? "").trim();
  if (!raw) return null;
  return resolvePublicMediaUrl(raw, "destinations");
}

function normalizeDestination(item: PublicDestination): PublicDestination {
  return {
    ...item,
    cover_image_url: normalizeDestinationCoverUrl(item.cover_image_url),
    highlights: Array.isArray(item.highlights)
      ? item.highlights.filter((h) => String(h || "").trim())
      : [],
  };
}

export function destinationHasPriceRange(d: Pick<PublicDestination, "price_amount" | "price_amount_max">): boolean {
  const min = Number(d.price_amount) || 0;
  const max = Number(d.price_amount_max) || 0;
  return max > min;
}

function formatPriceNumber(amount: number): string {
  const n = Number(amount) || 0;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDestinationPrice(d: PublicDestination): string {
  const min = Number(d.price_amount) || 0;
  const max = Number(d.price_amount_max) || 0;
  const suffix = (d.price_suffix || "/person").trim();
  const suffixPart = suffix.startsWith("/") ? suffix : ` ${suffix}`;
  if (min <= 0) return "Contact for price";
  if (destinationHasPriceRange(d)) {
    return `From ${formatPriceNumber(min)}–${formatPriceNumber(max)}${suffixPart}`;
  }
  return `From ${formatPriceNumber(min)}${suffixPart}`;
}

/** Estimated booking total label (uses lower price × party; shows upper bound when range exists). */
export function formatDestinationEstimatedTotal(d: PublicDestination, partySize: number): string | null {
  const min = Number(d.price_amount) || 0;
  if (min <= 0) return null;
  const max = Number(d.price_amount_max) || 0;
  const party = Math.max(1, Number(partySize) || 1);
  const minTotal = min * party;
  if (destinationHasPriceRange(d)) {
    const maxTotal = max * party;
    return `From ${formatPriceNumber(minTotal)}–${formatPriceNumber(maxTotal)}`;
  }
  return formatPriceNumber(minTotal);
}

function isBookablePackage(d: PublicDestination): boolean {
  const id = String(d.id || "").trim();
  const slug = String(d.slug || "").trim();
  const price = Number(d.price_amount) || 0;
  return Boolean(id && slug && price > 0);
}

export function mapDestination(item: PublicDestination): DestinationDisplay {
  const d = normalizeDestination(item);
  return {
    ...d,
    priceLabel: formatDestinationPrice(d),
    bookable: isBookablePackage(d),
  };
}

/** Map published packages from `/api/public/destinations` (sorted by display_order). */
export function mapDestinations(items: PublicDestination[] | undefined): DestinationDisplay[] {
  const list = (items ?? [])
    .map(normalizeDestination)
    .sort(
      (a, b) =>
        (Number(a.display_order) || 0) - (Number(b.display_order) || 0) ||
        a.title.localeCompare(b.title),
    );

  return list.map((d) => mapDestination(d));
}

export function destinationDetailHref(slugOrId: string): string {
  return `/destinations/${encodeURIComponent(slugOrId)}`;
}

export function destinationsGridSubtitle(
  sections: DestinationsPageSections["grid"],
  packageCount: number,
): string {
  if (packageCount > 0 && sections.subtitle?.trim()) {
    return sections.subtitle.trim();
  }
  return sections.subtitleFallback?.trim() || "";
}
