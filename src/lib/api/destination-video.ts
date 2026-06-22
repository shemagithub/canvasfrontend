import { resolvePublicMediaUrl } from "./media-url";

export type DestinationVideoEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "video"; src: string };

/** Resolve admin video_url to an embeddable iframe or HTML5 video source. */
export function destinationVideoEmbed(url?: string | null): DestinationVideoEmbed | null {
  const raw = (url ?? "").trim();
  if (!raw) return null;

  const yt =
    raw.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i) ||
    raw.match(/youtube\.com\/watch\?.*v=([\w-]{6,})/i);
  if (yt?.[1]) {
    return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  }

  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1]) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  const storage = resolvePublicMediaUrl(raw, "destinations");
  if (storage) return { kind: "video", src: storage };

  if (/^https?:\/\//i.test(raw)) return { kind: "video", src: raw };

  return null;
}
