import { isBlogHtmlContent, resolveBlogContentHtml } from "./blog-ui";

/** Plain text from CMS JSON sections or HTML. */
export function cmsPlainTextFromContent(content?: string | null, limit = 320): string {
  const raw = (content ?? "").trim();
  if (!raw) return "";

  if (raw.startsWith("{")) {
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      const chunks: string[] = [];

      const hero = data.hero as { subtitle?: string } | undefined;
      if (hero?.subtitle?.trim()) chunks.push(hero.subtitle.trim());

      const genesis = data.genesis as { paragraphs?: string[] } | undefined;
      if (Array.isArray(genesis?.paragraphs)) {
        for (const p of genesis.paragraphs) {
          if (typeof p === "string" && p.trim()) chunks.push(p.trim());
        }
      }

      if (typeof data.subtitle === "string" && data.subtitle.trim()) {
        chunks.push(data.subtitle.trim());
      }

      for (const key of ["standard", "fleet", "cta", "workshop", "team", "values"] as const) {
        const sec = data[key] as { subtitle?: string } | undefined;
        if (sec?.subtitle?.trim()) chunks.push(sec.subtitle.trim());
      }

      const text = chunks.join(" ").trim();
      if (text) return cmsPlainText(text, limit);
    } catch {
      /* fall through to HTML/plain */
    }
  }

  return cmsPlainText(raw, limit);
}

/** Plain text excerpt from CMS HTML for legacy fallbacks. */
export function cmsPlainText(content?: string | null, limit = 320): string {
  const t = (content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= limit) return t;
  return `${t.slice(0, limit - 1).trim()}…`;
}

export function resolveCmsHtml(content?: string | null): string {
  return resolveBlogContentHtml(content ?? "");
}

export function isCmsHtml(content?: string | null): boolean {
  return isBlogHtmlContent(resolveCmsHtml(content));
}
