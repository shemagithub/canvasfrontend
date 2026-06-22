import { normalizeSocialUrl } from "./social-links";

/** `tel:` href from a display phone string. */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/[^\d+]/g, "");
  if (!digits) return "";
  return `tel:${digits}`;
}

/** `mailto:` href from an email address. */
export function mailtoHref(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return "";
  return `mailto:${trimmed}`;
}

function isWhatsAppValue(value: string): boolean {
  const lower = value.toLowerCase();
  return lower.includes("whatsapp") || lower.includes("wa.me") || /^wa[\s:/+-]/i.test(lower);
}

/** Phone display text → `tel:` or WhatsApp URL when the value is WhatsApp-specific. */
export function phoneOrWhatsAppHref(value: string): { href: string; external: boolean } {
  const trimmed = value.trim();
  if (!trimmed) return { href: "", external: false };

  if (/^https?:\/\//i.test(trimmed) || trimmed.includes("wa.me")) {
    return { href: trimmed, external: true };
  }

  if (isWhatsAppValue(trimmed)) {
    const stripped = trimmed.replace(/whatsapp/gi, "").replace(/^wa[\s:/+-]+/i, "").trim();
    const wa = normalizeSocialUrl(stripped || trimmed, "whatsapp");
    if (wa) return { href: wa, external: true };
  }

  const tel = telHref(trimmed);
  return tel ? { href: tel, external: false } : { href: "", external: false };
}
