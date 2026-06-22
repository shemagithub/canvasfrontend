import { Compass, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { MESSAGING } from "@/constants/messaging";

export type FeatureCopy = { title: string; desc: string };

export type HomePageSections = {
  version: 1;
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryCta: string;
    primaryLink: string;
    secondaryCta: string;
    secondaryLink: string;
    searchCta: string;
  };
  standard: {
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitle: string;
    features: FeatureCopy[];
  };
  fleet: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    linkText: string;
    detailsButton?: string;
    reserveButton?: string;
  };
  testimonials: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ratingLabel: string;
  };
  cta: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
};

export type FleetPageSections = {
  version: 1;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  filtersLabel: string;
  categoryAllLabel: string;
  emptyMessage: string;
  loadingLabel: string;
  detailsButton: string;
  reserveButton: string;
};

export type SimplePageSections = {
  version: 1;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
};

export type BookingPageSections = {
  version: 1;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  guestSection: string;
  confirmedMessage: string;
};

export type BlogPageSections = {
  version: 1;
  title: string;
  titleAccent: string;
  subtitle: string;
  searchPlaceholder: string;
  emptyMessage: string;
  clearFiltersText: string;
  loadingLabel: string;
  backToBlogText: string;
  continueReadingTitle: string;
  readArticleText: string;
  readMoreText: string;
};

export type ChatPageSections = {
  version: 1;
  greeting: string;
  quickReplies: string[];
  responses: Record<string, string>;
};

export type SiteMetaSections = {
  version: 1;
  title: string;
  description: string;
  keywords?: string;
};

const HOME_FEATURE_ICONS: LucideIcon[] = [Compass, ShieldCheck, Users];

export function homeFeatureIcon(index: number): LucideIcon {
  return HOME_FEATURE_ICONS[index % HOME_FEATURE_ICONS.length] ?? Compass;
}

function mergeStrings(fallback: string, value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function parseJsonSections<T>(
  raw: string | null | undefined,
  defaults: () => T,
  merge: (base: T, patch: Partial<T>) => T,
): T {
  const base = defaults();
  if (!raw?.trim()) return base;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return base;
  try {
    const parsed = JSON.parse(trimmed) as Partial<T>;
    if (parsed && typeof parsed === "object") return merge(base, parsed);
  } catch {
    /* use defaults */
  }
  return base;
}

export function defaultHomeSections(): HomePageSections {
  const h = MESSAGING.home;
  return {
    version: 1,
    hero: {
      titleLine1: h.heroTitle[0],
      titleLine2: h.heroTitle[1],
      subtitle: h.heroSubtitle,
      primaryCta: h.reserveCta,
      primaryLink: "/booking",
      secondaryCta: h.fleetCta,
      secondaryLink: "/fleet",
      searchCta: h.searchCta,
    },
    standard: {
      titleLine1: h.standardTitle[0],
      titleLine2: h.standardTitle[1],
      titleLine3: h.standardTitle[2],
      subtitle: h.standardSubtitle,
      features: h.features.map((f) => ({ ...f })),
    },
    fleet: {
      titleLine1: h.fleetTitle[0],
      titleLine2: h.fleetTitle[1],
      subtitle: h.fleetSubtitle,
      linkText: h.fleetLink,
      detailsButton: "Details",
      reserveButton: "Reserve",
    },
    testimonials: {
      titleLine1: h.testimonialsTitle[0],
      titleLine2: h.testimonialsTitle[1],
      subtitle: h.testimonialsSubtitle,
      ratingLabel: "4.9 / 2,400+ trips",
    },
    cta: {
      title: h.ctaTitle,
      subtitle: h.ctaSubtitle,
      buttonText: h.ctaButton,
      buttonLink: "/booking",
    },
  };
}

function mergeHome(base: HomePageSections, patch: Partial<HomePageSections>): HomePageSections {
  const features =
    Array.isArray(patch.standard?.features) && patch.standard.features.length
      ? patch.standard.features.filter((f) => f?.title || f?.desc)
      : base.standard.features;
  return {
    version: 1,
    hero: { ...base.hero, ...(patch.hero ?? {}) },
    standard: { ...base.standard, ...(patch.standard ?? {}), features },
    fleet: { ...base.fleet, ...(patch.fleet ?? {}) },
    testimonials: { ...base.testimonials, ...(patch.testimonials ?? {}) },
    cta: { ...base.cta, ...(patch.cta ?? {}) },
  };
}

export function parseHomeSections(raw: string | null | undefined): HomePageSections {
  return parseJsonSections(raw, defaultHomeSections, mergeHome);
}

export function defaultFleetSections(): FleetPageSections {
  const f = MESSAGING.fleet;
  return {
    version: 1,
    titleLine1: f.title[0],
    titleLine2: f.title[1],
    subtitle: f.subtitle,
    filtersLabel: "Filters",
    categoryAllLabel: "All",
    emptyMessage: "No vehicles found in this category.",
    loadingLabel: "Loading vehicles…",
    detailsButton: "Details",
    reserveButton: "Reserve",
  };
}

export function parseFleetSections(raw: string | null | undefined): FleetPageSections {
  return parseJsonSections(raw, defaultFleetSections, (base, patch) => ({
    version: 1,
    titleLine1: mergeStrings(base.titleLine1, patch.titleLine1),
    titleLine2: mergeStrings(base.titleLine2, patch.titleLine2),
    subtitle: mergeStrings(base.subtitle, patch.subtitle),
    filtersLabel: mergeStrings(base.filtersLabel, patch.filtersLabel),
    categoryAllLabel: mergeStrings(base.categoryAllLabel, patch.categoryAllLabel),
    emptyMessage: mergeStrings(base.emptyMessage, patch.emptyMessage),
    loadingLabel: mergeStrings(base.loadingLabel, patch.loadingLabel),
    detailsButton: mergeStrings(base.detailsButton, patch.detailsButton),
    reserveButton: mergeStrings(base.reserveButton, patch.reserveButton),
  }));
}

export function defaultContactSections(): SimplePageSections {
  return {
    version: 1,
    titleLine1: "Get in",
    titleLine2: "Touch",
    subtitle: MESSAGING.contact.subtitle,
  };
}

export function parseContactSections(raw: string | null | undefined): SimplePageSections {
  return parseJsonSections(raw, defaultContactSections, (base, patch) => ({
    version: 1,
    titleLine1: mergeStrings(base.titleLine1, patch.titleLine1),
    titleLine2: mergeStrings(base.titleLine2, patch.titleLine2),
    subtitle: mergeStrings(base.subtitle, patch.subtitle),
  }));
}

export function defaultBookingSections(): BookingPageSections {
  const b = MESSAGING.booking;
  return {
    version: 1,
    titleLine1: b.title[0],
    titleLine2: b.title[1],
    subtitle: b.subtitle,
    guestSection: b.guestSection,
    confirmedMessage: b.confirmed,
  };
}

export function parseBookingSections(raw: string | null | undefined): BookingPageSections {
  return parseJsonSections(raw, defaultBookingSections, (base, patch) => ({
    version: 1,
    titleLine1: mergeStrings(base.titleLine1, patch.titleLine1),
    titleLine2: mergeStrings(base.titleLine2, patch.titleLine2),
    subtitle: mergeStrings(base.subtitle, patch.subtitle),
    guestSection: mergeStrings(base.guestSection, patch.guestSection),
    confirmedMessage: mergeStrings(base.confirmedMessage, patch.confirmedMessage),
  }));
}

export function defaultBlogSections(): BlogPageSections {
  return {
    version: 1,
    title: "The",
    titleAccent: "Apex Journal",
    subtitle: "Thoughts, stories, and travel inspiration from the road.",
    searchPlaceholder: "Search articles…",
    emptyMessage: "No articles found",
    clearFiltersText: "Clear filters",
    loadingLabel: "Loading articles…",
    backToBlogText: "Back to Journal",
    continueReadingTitle: "Continue Reading",
    readArticleText: "Read Article",
    readMoreText: "Read More",
  };
}

export function parseBlogSections(raw: string | null | undefined): BlogPageSections {
  return parseJsonSections(raw, defaultBlogSections, (base, patch) => ({
    version: 1,
    title: mergeStrings(base.title, patch.title),
    titleAccent: mergeStrings(base.titleAccent, patch.titleAccent),
    subtitle: mergeStrings(base.subtitle, patch.subtitle),
    searchPlaceholder: mergeStrings(base.searchPlaceholder, patch.searchPlaceholder),
    emptyMessage: mergeStrings(base.emptyMessage, patch.emptyMessage),
    clearFiltersText: mergeStrings(base.clearFiltersText, patch.clearFiltersText),
    loadingLabel: mergeStrings(base.loadingLabel, patch.loadingLabel),
    backToBlogText: mergeStrings(base.backToBlogText, patch.backToBlogText),
    continueReadingTitle: mergeStrings(base.continueReadingTitle, patch.continueReadingTitle),
    readArticleText: mergeStrings(base.readArticleText, patch.readArticleText),
    readMoreText: mergeStrings(base.readMoreText, patch.readMoreText),
  }));
}

export function defaultChatSections(): ChatPageSections {
  const c = MESSAGING.chat;
  return {
    version: 1,
    greeting: c.greeting,
    quickReplies: [...c.quickReplies],
    responses: { ...c.responses },
  };
}

export function parseChatSections(raw: string | null | undefined): ChatPageSections {
  return parseJsonSections(raw, defaultChatSections, (base, patch) => ({
    version: 1,
    greeting: mergeStrings(base.greeting, patch.greeting),
    quickReplies:
      Array.isArray(patch.quickReplies) && patch.quickReplies.length
        ? patch.quickReplies.filter((s) => typeof s === "string" && s.trim())
        : base.quickReplies,
    responses: { ...base.responses, ...(patch.responses ?? {}) },
  }));
}

export function defaultSiteMeta(): SiteMetaSections {
  return {
    version: 1,
    title: MESSAGING.meta.title,
    description: MESSAGING.meta.description,
    keywords: MESSAGING.meta.keywords,
  };
}

export function parseSiteMeta(raw: string | null | undefined): SiteMetaSections {
  return parseJsonSections(raw, defaultSiteMeta, (base, patch) => ({
    version: 1,
    title: mergeStrings(base.title, patch.title),
    description: mergeStrings(base.description, patch.description),
    keywords: mergeStrings(base.keywords ?? "", patch.keywords) || undefined,
  }));
}
