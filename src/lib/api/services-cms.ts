import { HeadphonesIcon, Shield, Wrench, type LucideIcon } from "lucide-react";
import { MESSAGING } from "@/constants/messaging";

export type ServiceStatItem = {
  value: string;
  label: string;
};

export type ServiceProcessStep = {
  num: string;
  title: string;
  desc: string;
};

export type ServiceFeatureItem = {
  icon: "shield" | "headphones" | "wrench";
  title: string;
  desc: string;
};

export type ServicesPageSections = {
  version: 1;
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  grid: {
    headingLine1: string;
    headingLine2: string;
    subtitleFallback: string;
  };
  stats: ServiceStatItem[];
  process: {
    headingLine1: string;
    headingLine2: string;
    steps: ServiceProcessStep[];
  };
  features: {
    items: ServiceFeatureItem[];
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

const FEATURE_ICONS: Record<ServiceFeatureItem["icon"], LucideIcon> = {
  shield: Shield,
  headphones: HeadphonesIcon,
  wrench: Wrench,
};

export function serviceFeatureIcon(icon: ServiceFeatureItem["icon"]): LucideIcon {
  return FEATURE_ICONS[icon] ?? Shield;
}

export function defaultServicesSections(): ServicesPageSections {
  const m = MESSAGING.services;
  return {
    version: 1,
    hero: {
      eyebrow: "Full Spectrum Coverage",
      titleLine1: "Our",
      titleLine2: "Services",
      subtitle:
        "Tourism rentals, picnic day trips, airport transfers, group hospitality, and long-stay travel — tailored to how you actually move.",
      primaryButtonText: "Browse Fleet",
      primaryButtonLink: "/fleet",
      secondaryButtonText: "Talk to Concierge",
      secondaryButtonLink: "/contact",
    },
    grid: {
      headingLine1: "What We",
      headingLine2: "Deliver",
      subtitleFallback: m.gridSubtitleFallback,
    },
    stats: m.stats.map((s) => ({ ...s })),
    process: {
      headingLine1: "How It",
      headingLine2: "Works",
      steps: m.process.map((s) => ({ ...s })),
    },
    features: {
      items: [
        {
          icon: "shield",
          title: "Travel Insurance Options",
          desc: "Coverage choices for leisure trips, events, and hospitality bookings — explained clearly before you pay.",
        },
        {
          icon: "headphones",
          title: "24/7 Guest Desk",
          desc: "Real people for pickup changes, route questions, and on-trip support — any hour, any timezone we serve.",
        },
        {
          icon: "wrench",
          title: "Roadside Assistance",
          desc: "If something happens on a picnic run or long tour, we coordinate help or a replacement quickly.",
        },
      ],
    },
    cta: {
      title: "Plan Your Next Trip?",
      subtitle:
        "Tell us about your tour, picnic, or hospitality needs — we will recommend the right vehicle and service.",
      primaryButtonText: "Book Now",
      primaryButtonLink: "/booking",
      secondaryButtonText: "Contact Concierge",
      secondaryButtonLink: "/contact",
    },
  };
}

function mergeStrings(fallback: string, value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

export function parseServicesSections(raw: string | null | undefined): ServicesPageSections {
  const base = defaultServicesSections();
  if (!raw?.trim()) return base;

  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<ServicesPageSections>;
      if (parsed && typeof parsed === "object") {
        return mergeServicesSections(base, parsed);
      }
    } catch {
      /* legacy HTML fallback */
    }
  }

  return base;
}

function mergeServicesSections(
  base: ServicesPageSections,
  patch: Partial<ServicesPageSections>,
): ServicesPageSections {
  const stats =
    Array.isArray(patch.stats) && patch.stats.length
      ? patch.stats
          .map((s) => ({
            value: mergeStrings("", s?.value),
            label: mergeStrings("", s?.label),
          }))
          .filter((s) => s.value || s.label)
      : base.stats;

  const steps =
    Array.isArray(patch.process?.steps) && patch.process!.steps.length
      ? patch.process!.steps
          .map((s) => ({
            num: mergeStrings("", s?.num),
            title: mergeStrings("", s?.title),
            desc: mergeStrings("", s?.desc),
          }))
          .filter((s) => s.title || s.desc)
      : base.process.steps;

  const featureItems =
    Array.isArray(patch.features?.items) && patch.features!.items.length
      ? patch.features!.items
          .map((f) => {
            const icon = f?.icon;
            return {
              icon: icon === "headphones" || icon === "wrench" ? icon : "shield",
              title: mergeStrings("", f?.title),
              desc: mergeStrings("", f?.desc),
            };
          })
          .filter((f) => f.title || f.desc)
      : base.features.items;

  return {
    version: 1,
    hero: { ...base.hero, ...(patch.hero ?? {}) },
    grid: { ...base.grid, ...(patch.grid ?? {}) },
    stats,
    process: {
      ...base.process,
      ...(patch.process ?? {}),
      steps,
    },
    features: { items: featureItems },
    cta: { ...base.cta, ...(patch.cta ?? {}) },
  };
}

export function serializeServicesSections(sections: ServicesPageSections): string {
  return JSON.stringify(sections, null, 2);
}
