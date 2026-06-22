export type DestinationsPageSections = {
  version: number;
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    images: string[];
    slideshowSeconds: number;
  };
  grid: {
    headingLine1: string;
    headingLine2: string;
    /** Shown when packages are loaded from the API. */
    subtitle?: string;
    /** Shown when no packages are available yet. */
    subtitleFallback: string;
  };
  cta: {
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
};

export function defaultDestinationsSections(): DestinationsPageSections {
  return {
    version: 1,
    hero: {
      eyebrow: "Visit Rwanda",
      titleLine1: "Explore",
      titleLine2: "Destinations",
      subtitle:
        "Curated tourism packages across Rwanda — gorilla trekking, lake retreats, safaris, city culture, and rainforest adventures.",
      primaryButtonText: "View Packages",
      primaryButtonLink: "#packages",
      secondaryButtonText: "Plan with Us",
      secondaryButtonLink: "/contact",
      images: [],
      slideshowSeconds: 6,
    },
    grid: {
      headingLine1: "Rwanda",
      headingLine2: "Packages",
      subtitle:
        "Curated Rwanda packages from our team — transport, guides, and clear per-person pricing. Book online or contact us to customize.",
      subtitleFallback:
        "Packages are being updated. Contact us to plan your Rwanda trip — gorilla trekking, safaris, lake retreats, and more.",
    },
    cta: {
      title: "Need a Custom Itinerary?",
      subtitle: "Tell us your dates, group size, and interests — we will build a Rwanda trip around you.",
      primaryButtonText: "Contact Us",
      primaryButtonLink: "/contact",
      secondaryButtonText: "Rent a Vehicle",
      secondaryButtonLink: "/fleet",
    },
  };
}

export function parseDestinationsSections(raw: string | null | undefined): DestinationsPageSections {
  const base = defaultDestinationsSections();
  if (!raw?.trim()) return base;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return base;
  try {
    const parsed = JSON.parse(trimmed) as Partial<DestinationsPageSections>;
    const rawImages = parsed.hero?.images;
    const images = Array.isArray(rawImages)
      ? rawImages.map((p) => String(p || "").trim()).filter(Boolean)
      : base.hero.images;
    const slideshowSeconds =
      typeof parsed.hero?.slideshowSeconds === "number" && parsed.hero.slideshowSeconds >= 3
        ? parsed.hero.slideshowSeconds
        : base.hero.slideshowSeconds;
    return {
      version: 1,
      hero: { ...base.hero, ...(parsed.hero || {}), images, slideshowSeconds },
      grid: { ...base.grid, ...(parsed.grid || {}) },
      cta: { ...base.cta, ...(parsed.cta || {}) },
    };
  } catch {
    return base;
  }
}

export function serializeDestinationsSections(sections: DestinationsPageSections): string {
  return JSON.stringify(sections, null, 2);
}
