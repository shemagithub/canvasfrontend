import {
  Home,
  Car,
  MapPin,
  BookOpen,
  Phone,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Vehicle browse & rental flow (`/fleet` route). */
export const CAR_RENTAL_PATH = "/fleet";
export const CAR_RENTAL_LABEL = "Car Rental";

export type NavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
  authHref?: string;
};

/** Core MVP navigation — focused on rent a car, destinations, and contact. */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { name: "Home", href: "/", icon: Home },
  { name: CAR_RENTAL_LABEL, href: CAR_RENTAL_PATH, icon: Car },
  { name: "Destinations", href: "/destinations", icon: MapPin },
  { name: "About", href: "/about", icon: Users },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Contact", href: "/contact", icon: Phone },
];

export const MOBILE_NAV_TABS: NavLink[] = [
  ...PRIMARY_NAV_LINKS,
  { name: "Account", href: "/login", authHref: "/account", icon: User },
];

export const FOOTER_INFO_LINKS = [
  { label: CAR_RENTAL_LABEL, href: CAR_RENTAL_PATH },
  { label: "Destinations", href: "/destinations" },
  { label: "Book a Package", href: "/booking" },
  { label: "Reserve a Vehicle", href: "/reserve" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export function isNavActive(href: string, location: string): boolean {
  if (href === "/") return location === "/";
  return location.startsWith(href);
}
