/** Safe internal path for post-login redirect (no open redirects). */
export function authReturnPath(search: string, fallback = "/booking"): string {
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const raw = params.get("return")?.trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
