import type { PublicBranding } from "./types";

export type SocialPlatform = "instagram" | "x" | "tiktok" | "youtube" | "whatsapp";

export type SocialLinkItem = {
  platform: SocialPlatform;
  label: string;
  url: string;
};

const PLATFORM_ORDER: { keys: string[]; platform: SocialPlatform; label: string }[] = [
  { keys: ["instagram"], platform: "instagram", label: "Instagram" },
  { keys: ["x", "twitter"], platform: "x", label: "X" },
  { keys: ["tiktok"], platform: "tiktok", label: "TikTok" },
  { keys: ["youtube"], platform: "youtube", label: "YouTube" },
  { keys: ["whatsapp"], platform: "whatsapp", label: "WhatsApp" },
];

export function normalizeSocialUrl(raw: string, platform: SocialPlatform): string {
  const t = raw.trim();
  if (!t) return "";

  if (platform === "whatsapp") {
    if (/^https?:\/\//i.test(t)) return t;
    const digits = t.replace(/[^\d]/g, "");
    if (!digits) return "";
    return `https://wa.me/${digits}`;
  }

  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("www.")) return `https://${t}`;
  if (t.includes(".") && !t.includes(" ")) return `https://${t}`;
  return t;
}

export function parseSocialLinks(links?: Record<string, string> | null): SocialLinkItem[] {
  if (!links) return [];

  const seen = new Set<SocialPlatform>();
  const out: SocialLinkItem[] = [];

  for (const { keys, platform, label } of PLATFORM_ORDER) {
    if (seen.has(platform)) continue;
    const raw = keys.map((k) => links[k]?.trim()).find(Boolean);
    if (!raw) continue;
    const url = normalizeSocialUrl(raw, platform);
    if (!url) continue;
    seen.add(platform);
    out.push({ platform, label, url });
  }

  return out;
}

export function socialLinksFromBranding(branding?: PublicBranding | null): SocialLinkItem[] {
  return parseSocialLinks(branding?.social_links);
}

/** Direct WhatsApp chat URL from branding social link or company phone. */
export function whatsAppLinkFromBranding(
  branding?: PublicBranding | null,
  options?: { message?: string },
): string | null {
  const fromSocial = socialLinksFromBranding(branding).find((l) => l.platform === "whatsapp");
  let url = fromSocial?.url ?? "";
  if (!url) {
    const phone = branding?.company?.phone?.trim();
    if (phone) url = normalizeSocialUrl(phone, "whatsapp");
  }
  if (!url) return null;

  const msg = options?.message?.trim();
  if (!msg) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("text", msg);
    return parsed.toString();
  } catch {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}text=${encodeURIComponent(msg)}`;
  }
}
