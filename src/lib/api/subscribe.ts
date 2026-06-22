import { apiUrl } from "./config";
import { ApiError } from "./client";

async function parseError(res: Response, fallback: string): Promise<never> {
  let detail: unknown;
  try {
    detail = await res.json();
  } catch {
    detail = await res.text();
  }
  const msg =
    typeof detail === "object" && detail !== null && "detail" in detail
      ? String((detail as { detail: unknown }).detail)
      : typeof detail === "string"
        ? detail
        : fallback;
  throw new ApiError(msg || fallback, res.status, detail);
}

export async function subscribeFleetAlerts(
  email: string,
  name?: string,
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(apiUrl("/api/public/fleet-subscribe"), {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      ...(name?.trim() ? { name: name.trim() } : {}),
      alerts_vehicles: true,
    }),
  });

  if (!res.ok) {
    await parseError(res, "Could not complete subscription.");
  }

  return (await res.json()) as { ok: boolean; message: string };
}

export async function unsubscribeFleetAlerts(token: string): Promise<{ ok: boolean; message: string }> {
  const params = new URLSearchParams({ token });
  const res = await fetch(apiUrl(`/api/public/fleet-unsubscribe?${params}`), {
    method: "GET",
    headers: { accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    await parseError(res, "Could not unsubscribe.");
  }

  return (await res.json()) as { ok: boolean; message: string };
}
