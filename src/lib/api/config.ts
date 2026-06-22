/** Production API for Canvas Tours Africa. Override with VITE_API_URL in .env */
export const DEFAULT_API_URL = "https://backend.canvastoursafrica.com";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}

/** On HTTPS pages, never call the API over plain HTTP (avoids mixed-content blocks). */
export function upgradeToHttpsIfNeeded(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http://")) return trimmed;
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return `https://${trimmed.slice(7)}`;
  }
  // Production hosts should always use TLS even for server-side defaults
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    if (host.includes("canvastoursafrica.com") || host.includes("novacarrentals.com")) {
      return `https://${trimmed.slice(7)}`;
    }
  } catch {
    /* ignore */
  }
  return trimmed;
}

/** API base URL without trailing slash. */
export function getApiBase(): string {
  const env = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (env) {
    return upgradeToHttpsIfNeeded(env);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const { hostname, origin } = window.location;
    if (isLocalHostname(hostname)) {
      return origin.replace(/\/+$/, "");
    }
    if (hostname.includes("canvastoursafrica.com")) {
      return DEFAULT_API_URL;
    }
    return origin.replace(/\/+$/, "");
  }

  return DEFAULT_API_URL;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Normalize absolute media/API URLs returned by the backend (http → https when needed). */
export function normalizePublicAssetUrl(url?: string | null): string | null {
  const raw = (url ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("/")) {
    return `${getApiBase()}${raw}`;
  }
  return upgradeToHttpsIfNeeded(raw);
}
