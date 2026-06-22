import type { LucideIcon } from "lucide-react";
import {
  Car,
  CreditCard,
  Globe,
  HeadphonesIcon,
  Key,
  Shield,
  Star,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { PublicServiceCard } from "./types";

export type ServiceDisplay = {
  id: string;
  icon: LucideIcon;
  title: string;
  tag: string;
  desc: string;
  features: string[];
  /** Display fallback when API body has no parseable amount (RWF). */
  priceAmountRwf?: number;
  priceSuffix?: string;
  price: string;
};

const ICONS: LucideIcon[] = [Car, Globe, Users, CreditCard, Key, Star, Shield, Wrench, Zap, HeadphonesIcon];

const DEFAULT_TAGS = ["Tourism", "Transfers", "Groups", "Hospitality", "Extended", "Guest Care"];

/** Parse admin `body` text into description, bullets, and price line. */
export function parseServiceBody(body: string) {
  const lines = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let tag = "";
  const features: string[] = [];
  const descParts: string[] = [];
  let price = "";

  for (const line of lines) {
    const tagMatch = line.match(/^\[(.+)\]$/);
    if (tagMatch && !tag) {
      tag = tagMatch[1];
      continue;
    }
    if (/^[-•*]\s+/.test(line) || line.startsWith("– ")) {
      features.push(line.replace(/^[-•*–]\s+/, ""));
      continue;
    }
    if (/^(from\s+)?\$|custom\s+pricing|\/\s*(day|hr|mo|trip)/i.test(line)) {
      price = line;
      continue;
    }
    descParts.push(line);
  }

  return {
    tag,
    desc: descParts.join(" ").trim() || body.replace(/<[^>]+>/g, "").trim(),
    features,
    price: price || "Contact for pricing",
  };
}

export function mapServiceCard(card: PublicServiceCard, index: number): ServiceDisplay {
  const parsed = parseServiceBody(card.body || "");
  return {
    id: card.id ?? `service-${index}`,
    icon: ICONS[index % ICONS.length],
    title: card.title,
    tag: parsed.tag || DEFAULT_TAGS[index % DEFAULT_TAGS.length],
    desc: parsed.desc,
    features: parsed.features,
    price: parsed.price,
  };
}

export const FALLBACK_SERVICES: ServiceDisplay[] = [
  {
    id: "fallback-1",
    icon: Car,
    title: "Daily & Weekly Rentals",
    tag: "Road Trips",
    desc: "Perfect for weekend getaways, scenic tours, and multi-day travel. Flexible pickup times and vehicles sized for passengers and luggage.",
    features: ["Same-day availability on select models", "Tour-friendly mileage options", "Hotel & branch pickup"],
    priceAmountRwf: 390_000,
    priceSuffix: "/day",
    price: "From 390,000 RWF/day",
  },
  {
    id: "fallback-2",
    icon: Globe,
    title: "Airport & Hotel Transfers",
    tag: "Hospitality",
    desc: "Meet guests at the terminal or resort with a clean, comfortable vehicle — ideal for tourism partners and visiting families.",
    features: ["Flight tracking", "Meet & greet", "Major airports & hotels"],
    priceAmountRwf: 195_000,
    priceSuffix: "/trip",
    price: "From 195,000 RWF/trip",
  },
  {
    id: "fallback-3",
    icon: Users,
    title: "Picnic & Day-Trip Packages",
    tag: "Leisure",
    desc: "SUVs and spacious vehicles for park outings, coastal picnics, and group day trips — with optional cooler space and child-seat add-ons.",
    features: ["Group seating options", "Early-morning pickup", "Return same evening"],
    priceAmountRwf: 260_000,
    priceSuffix: "/day",
    price: "From 260,000 RWF/day",
  },
  {
    id: "fallback-4",
    icon: CreditCard,
    title: "Event & Group Transport",
    tag: "Celebrations",
    desc: "Weddings, reunions, corporate hospitality, and festival shuttles — coordinate multiple vehicles or chauffeur support.",
    features: ["Multi-vehicle planning", "Guest manifest support", "On-site coordinator option"],
    price: "Custom pricing",
  },
  {
    id: "fallback-5",
    icon: Key,
    title: "Long-Stay & Relocation",
    tag: "Extended",
    desc: "Weekly and monthly rates for extended tourism stays, seasonal workers, and hospitality staff relocations.",
    features: ["Discounted weekly rates", "Scheduled maintenance included", "Dedicated account contact"],
    priceAmountRwf: 2_490_000,
    priceSuffix: "/mo",
    price: "From 2,490,000 RWF/mo",
  },
  {
    id: "fallback-6",
    icon: Star,
    title: "Guest Membership",
    tag: "Frequent Travel",
    desc: "Priority booking, preferred vehicles, and a concierge line for repeat guests, hosts, and hospitality partners.",
    features: ["Priority fleet access", "Faster confirmations", "Flexible date changes"],
    priceAmountRwf: 785_000,
    priceSuffix: "/mo",
    price: "From 785,000 RWF/mo",
  },
];

export function mapServiceCards(cards: PublicServiceCard[]): ServiceDisplay[] {
  if (!cards.length) return FALLBACK_SERVICES;
  return cards.map(mapServiceCard);
}

export function serviceTickerItems(services: ServiceDisplay[]): string[] {
  if (services.length === 0) {
    return [
      "ROAD TRIP RENTALS",
      "PICNIC & DAY TRIPS",
      "AIRPORT TRANSFERS",
      "GROUP & EVENTS",
      "HOSPITALITY TRANSPORT",
      "24/7 GUEST SUPPORT",
    ];
  }
  return services.map((s) => s.title.toUpperCase());
}
