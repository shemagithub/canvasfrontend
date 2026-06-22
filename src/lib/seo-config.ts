export type StaticRouteSeo = {
  title: string;
  description: string;
  noindex?: boolean;
};

/** SEO defaults for static marketing routes (before CMS overrides). */
export const STATIC_ROUTE_SEO: Record<string, StaticRouteSeo> = {
  "/": {
    title: "Canvas Tours Africa — Car Rental & Rwanda Travel Packages",
    description:
      "Rent vehicles in Rwanda and book curated tour packages — gorilla trekking, Akagera safari, Lake Kivu, and Kigali transfers. Hospitality-grade car rental for tourists and groups.",
  },
  "/fleet": {
    title: "Car Rental Rwanda — Browse Vehicles",
    description:
      "Rent tourism-ready cars in Rwanda — sedans, SUVs, and spacious vehicles for safaris, airport transfers, road trips, and group travel with Canvas Tours Africa.",
  },
  "/about": {
    title: "About Canvas Tours Africa — Rwanda Car Rental & Tours",
    description:
      "Meet the team behind Rwanda-focused car rentals and curated travel packages — hospitality-grade service for tourists, events, and leisure trips.",
  },
  "/destinations": {
    title: "Rwanda Destinations & Tour Packages",
    description:
      "Explore Rwanda with curated packages: gorilla trekking in Volcanoes National Park, Akagera safari, Lake Kivu, Kigali city tours, and rainforest adventures.",
  },
  "/contact": {
    title: "Contact Canvas Tours Africa — Reservations & Support",
    description:
      "Get in touch for Rwanda car rental quotes, destination packages, airport pickups, and group travel. Our team responds quickly to guest inquiries.",
  },
  "/booking": {
    title: "Book a Rwanda Destination Package Online",
    description:
      "Reserve Rwanda tourism packages online — gorilla trekking, safaris, lake retreats, and cultural tours with clear per-person pricing from Canvas Tours Africa.",
  },
  "/reserve": {
    title: "Reserve a Car Rental in Rwanda",
    description:
      "Plan your Rwanda vehicle rental — choose dates, pickup location, and guest details. Sedans, SUVs, and group vehicles for tours and transfers.",
  },
  "/blog": {
    title: "Rwanda Travel Journal — Tips & Road Trip Guides",
    description:
      "Travel stories, Rwanda road trip tips, and practical guides for renting a car and exploring East Africa with Canvas Tours Africa.",
  },
  "/terms": {
    title: "Terms & Conditions",
    description: "Rental terms, policies, and conditions for using our car rental services.",
  },
  "/login": {
    title: "Sign In",
    description: "Sign in to manage your car rental account and reservations.",
    noindex: true,
  },
  "/signup": {
    title: "Create Account",
    description: "Create an account to book vehicles and manage your reservations.",
    noindex: true,
  },
  "/forgot-password": {
    title: "Forgot Password",
    description: "Request a password reset link for your account.",
    noindex: true,
  },
  "/reset-password": {
    title: "Reset Password",
    description: "Set a new password for your account.",
    noindex: true,
  },
  "/account": {
    title: "My Account",
    description: "View and manage your car rental account.",
    noindex: true,
  },
  "/fleet-unsubscribe": {
    title: "Unsubscribe from Fleet Alerts",
    description: "Manage your fleet alert email preferences.",
    noindex: true,
  },
};

export const NOINDEX_PATHS = new Set(
  Object.entries(STATIC_ROUTE_SEO)
    .filter(([, v]) => v.noindex)
    .map(([k]) => k),
);

export function normalizePath(path: string): string {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");
  let p = path.split("?")[0].split("#")[0] || "/";
  if (base && base !== "/" && p.startsWith(base)) {
    p = p.slice(base.length) || "/";
  }
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export function matchStaticRoute(path: string): StaticRouteSeo | undefined {
  const normalized = normalizePath(path);
  return STATIC_ROUTE_SEO[normalized];
}

export function isDynamicRoute(path: string): "vehicle" | "blog" | "destination" | "404" | null {
  const normalized = normalizePath(path);
  if (/^\/car-details\/[^/]+$/.test(normalized)) return "vehicle";
  if (/^\/blog\/[^/]+$/.test(normalized)) return "blog";
  if (/^\/destinations\/[^/]+$/.test(normalized)) return "destination";
  if (normalized !== "/" && !STATIC_ROUTE_SEO[normalized]) return "404";
  return null;
}

export function extractVehicleId(path: string): string | undefined {
  const m = normalizePath(path).match(/^\/car-details\/([^/]+)$/);
  return m?.[1];
}

export function extractBlogSlug(path: string): string | undefined {
  const m = normalizePath(path).match(/^\/blog\/([^/]+)$/);
  return m?.[1];
}

export function extractDestinationSlug(path: string): string | undefined {
  const m = normalizePath(path).match(/^\/destinations\/([^/]+)$/);
  return m?.[1];
}

/** Map marketing paths to CMS page keys for seo_title / seo_description. */
export const CMS_PAGE_KEYS: Record<string, string> = {
  "/": "home",
  "/fleet": "fleet",
  "/about": "about",
  "/destinations": "destinations",
  "/contact": "contact",
  "/booking": "destinations",
  "/reserve": "booking",
  "/blog": "blog",
  "/terms": "terms",
};

/** Default meta keywords for Rwanda tourism + car rental (supplemented by CMS site-meta). */
export const DEFAULT_SEO_KEYWORDS =
  "Canvas Tours Africa, Rwanda car rental, rent a car Rwanda, Kigali car hire, Rwanda safari, gorilla trekking, Akagera, Lake Kivu, Rwanda tour packages, airport transfer Rwanda";
