import { Compass, Shield, Users, type LucideIcon } from "lucide-react";
import { MESSAGING } from "@/constants/messaging";

export type AboutTimelineItem = {
  year: string;
  title: string;
  desc: string;
};

export type AboutValueItem = {
  icon: "compass" | "users" | "shield";
  title: string;
  desc: string;
};

export type AboutPageSections = {
  version: 1;
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    imagePath: string;
  };
  genesis: {
    heading: string;
    headingHighlight: string;
    paragraphs: string[];
  };
  workshop: {
    titleLine1: string;
    titleLine2: string;
    paragraphs: string[];
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    imagePath: string;
  };
  timeline: {
    heading: string;
    headingHighlight: string;
    items: AboutTimelineItem[];
  };
  team: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  values: {
    heading: string;
    headingHighlight: string;
    subtitle: string;
    items: AboutValueItem[];
  };
  cta: {
    title: string;
    buttonText: string;
    buttonLink: string;
  };
};

export type PublicCmsPage = {
  key: string;
  published: boolean;
  title?: string | null;
  content?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  updated_at?: string | null;
};

const VALUE_ICONS: Record<AboutValueItem["icon"], LucideIcon> = {
  compass: Compass,
  users: Users,
  shield: Shield,
};

export function aboutValueIcon(icon: AboutValueItem["icon"]): LucideIcon {
  return VALUE_ICONS[icon] ?? Compass;
}

export function defaultAboutSections(): AboutPageSections {
  const m = MESSAGING.about;
  return {
    version: 1,
    hero: {
      titleLine1: m.heroTitle[0],
      titleLine2: m.heroTitle[1],
      subtitle: m.heroSubtitle,
      imagePath: "",
    },
    genesis: {
      heading: "The Genesis of",
      headingHighlight: "Canvas Tours",
      paragraphs: [...m.genesis],
    },
    workshop: {
      titleLine1: m.workshopTitle[0],
      titleLine2: m.workshopTitle[1],
      paragraphs: [...m.workshop],
      stat1Value: "140+",
      stat1Label: "Point Inspection",
      stat2Value: "100%",
      stat2Label: "Guest-Ready Handover",
      imagePath: "",
    },
    timeline: {
      heading: "Our",
      headingHighlight: "Trajectory",
      items: m.timeline.map((t) => ({ ...t })),
    },
    team: {
      titleLine1: m.teamTitle[0],
      titleLine2: m.teamTitle[1],
      subtitle: m.teamSubtitle,
    },
    values: {
      heading: "The",
      headingHighlight: "Code",
      subtitle:
        "The principles that dictate every decision we make, every car we buy, and every client we serve.",
      items: m.values.map((v, i) => ({
        icon: (["compass", "users", "shield"] as const)[i] ?? "compass",
        title: v.title,
        desc: v.desc,
      })),
    },
    cta: {
      title: m.ctaTitle,
      buttonText: m.ctaButton,
      buttonLink: "/fleet",
    },
  };
}

function mergeStrings(fallback: string, value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

function mergeAboutSections(
  base: AboutPageSections,
  patch: Partial<AboutPageSections>,
): AboutPageSections {
  const hero = { ...base.hero, ...(patch.hero ?? {}) };
  const genesis = {
    ...base.genesis,
    ...(patch.genesis ?? {}),
    paragraphs:
      Array.isArray(patch.genesis?.paragraphs) && patch.genesis!.paragraphs.length
        ? patch.genesis!.paragraphs.filter((p) => typeof p === "string" && p.trim())
        : base.genesis.paragraphs,
  };
  const workshop = {
    ...base.workshop,
    ...(patch.workshop ?? {}),
    paragraphs:
      Array.isArray(patch.workshop?.paragraphs) && patch.workshop!.paragraphs.length
        ? patch.workshop!.paragraphs.filter((p) => typeof p === "string" && p.trim())
        : base.workshop.paragraphs,
  };
  const timelineItems =
    Array.isArray(patch.timeline?.items) && patch.timeline!.items.length
      ? patch.timeline!.items
          .filter((t) => t && typeof t === "object")
          .map((t) => ({
            year: mergeStrings("", (t as AboutTimelineItem).year),
            title: mergeStrings("", (t as AboutTimelineItem).title),
            desc: mergeStrings("", (t as AboutTimelineItem).desc),
          }))
          .filter((t) => t.year || t.title || t.desc)
      : base.timeline.items;

  const valueItems =
    Array.isArray(patch.values?.items) && patch.values!.items.length
      ? patch.values!.items
          .filter((v) => v && typeof v === "object")
          .map((v) => {
            const icon = (v as AboutValueItem).icon;
            return {
              icon: icon === "users" || icon === "shield" ? icon : "compass",
              title: mergeStrings("", (v as AboutValueItem).title),
              desc: mergeStrings("", (v as AboutValueItem).desc),
            };
          })
          .filter((v) => v.title || v.desc)
      : base.values.items;

  return {
    version: 1,
    hero,
    genesis,
    workshop,
    timeline: { ...base.timeline, ...(patch.timeline ?? {}), items: timelineItems },
    team: { ...base.team, ...(patch.team ?? {}) },
    values: { ...base.values, ...(patch.values ?? {}), items: valueItems },
    cta: { ...base.cta, ...(patch.cta ?? {}) },
  };
}

/** Parse CMS `content` JSON (or legacy HTML/text) into structured about sections. */
export function parseAboutSections(raw: string | null | undefined): AboutPageSections {
  const base = defaultAboutSections();
  if (!raw?.trim()) return base;

  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<AboutPageSections>;
      if (parsed && typeof parsed === "object") {
        return mergeAboutSections(base, parsed);
      }
    } catch {
      /* legacy fallback below */
    }
  }

  const plain = trimmed.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (plain) {
    return mergeAboutSections(base, {
      genesis: { paragraphs: [plain, ...base.genesis.paragraphs].slice(0, 6) },
    });
  }
  return base;
}

import { resolveAboutImageUrl } from "./media-url";

export { resolveAboutImageUrl };

export function serializeAboutSections(sections: AboutPageSections): string {
  return JSON.stringify(sections, null, 2);
}
