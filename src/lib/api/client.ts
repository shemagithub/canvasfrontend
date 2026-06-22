import { apiUrl } from "./config";
import { getStoredAccessToken } from "./auth";
import type {
  ContactPayload,
  MyBooking,
  MyDestinationBookingUpdatePayload,
  MyVehicleBookingUpdatePayload,
  PublicBlogPost,
  PublicBookingPayload,
  PublicBookingResult,
  PublicBranch,
  PublicBranding,
  PublicDestination,
  PublicDestinationBookingPayload,
  PublicDestinationBookingResult,
  PublicServiceCard,
  PublicTeamMember,
  PublicTestimonial,
  PublicVehicle,
} from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }
  const token = getStoredAccessToken();
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(apiUrl(path), { ...init, headers, credentials: init?.credentials ?? "include" });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    const msg =
      typeof detail === "object" &&
      detail !== null &&
      "detail" in detail &&
      typeof (detail as { detail: unknown }).detail === "string"
        ? String((detail as { detail: string }).detail)
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export const api = {
  getBranding: () => request<PublicBranding>("/api/branding"),

  getVehicles: (params?: { status?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return request<PublicVehicle[]>(`/api/public/vehicles${qs ? `?${qs}` : ""}`);
  },

  getVehicle: (id: string) => request<PublicVehicle>(`/api/public/vehicles/${encodeURIComponent(id)}`),

  getBranches: (limit = 100) =>
    request<PublicBranch[]>(`/api/public/branches?limit=${limit}`),

  getTestimonials: (limit = 100) =>
    request<PublicTestimonial[]>(`/api/public/testimonials?limit=${limit}`),

  getBlogs: (limit = 50) => request<PublicBlogPost[]>(`/api/public/blogs?limit=${limit}`),

  getBlogBySlug: (slug: string) =>
    request<PublicBlogPost>(`/api/public/blogs/${encodeURIComponent(slug)}`),

  getDestinations: (limit = 100) =>
    request<PublicDestination[]>(`/api/public/destinations?limit=${limit}`),

  getDestinationBySlug: (slug: string) =>
    request<PublicDestination>(`/api/public/destinations/${encodeURIComponent(slug)}`),

  submitDestinationBooking: (payload: PublicDestinationBookingPayload) =>
    request<PublicDestinationBookingResult>("/api/public/destination-bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getServiceCards: (limit = 100) =>
    request<PublicServiceCard[]>(`/api/public/service-cards?limit=${limit}`),

  getTeam: (limit = 100) => request<PublicTeamMember[]>(`/api/public/team?limit=${limit}`),

  getCmsPage: (pageKey: string) =>
    request<import("./about-cms").PublicCmsPage>(
      `/api/public/cms-page/${encodeURIComponent(pageKey)}`,
    ),

  submitContact: (payload: ContactPayload) =>
    request<{ ok: boolean; id: string }>("/api/public/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitBooking: (payload: PublicBookingPayload) =>
    request<PublicBookingResult>("/api/public/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyBookings: (limit = 50) =>
    request<MyBooking[]>(`/api/me/bookings?limit=${limit}`),

  getMyBooking: (id: string) =>
    request<MyBooking>(`/api/me/bookings/${encodeURIComponent(id)}`),

  updateMyVehicleBooking: (id: string, payload: MyVehicleBookingUpdatePayload) =>
    request<MyBooking>(`/api/me/bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateMyDestinationBooking: (id: string, payload: MyDestinationBookingUpdatePayload) =>
    request<MyBooking>(`/api/me/destination-bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
