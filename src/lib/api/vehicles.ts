import type { PublicVehicle } from "./types";
import { normalizePublicAssetUrl } from "./config";

import fleetSportsImg from "@/assets/images/sports-car.png";
import fleetSedanImg from "@/assets/images/luxury-sedan.png";
import fleetSuvImg from "@/assets/images/premium-suv.png";
import heroCarImg from "@/assets/images/hero-car.png";

const FALLBACK_IMAGES: Record<string, string> = {
  sport: fleetSportsImg,
  sports: fleetSportsImg,
  executive: fleetSedanImg,
  sedan: fleetSedanImg,
  luxury: fleetSedanImg,
  suv: fleetSuvImg,
  default: heroCarImg,
};

export function vehicleImage(v: PublicVehicle): string {
  if (v.image_url) {
    return normalizePublicAssetUrl(v.image_url) ?? vehicleFallbackImage(v);
  }
  return vehicleFallbackImage(v);
}

/** Static placeholder when API image URLs fail or are missing. */
export function vehicleFallbackImage(v: PublicVehicle): string {
  const cat = (v.category ?? "").toLowerCase();
  for (const [key, img] of Object.entries(FALLBACK_IMAGES)) {
    if (key !== "default" && cat.includes(key)) return img;
  }
  return FALLBACK_IMAGES.default;
}

export function vehicleDisplayName(v: PublicVehicle): string {
  if (v.name?.trim()) return v.name;
  return [v.brand, v.model_name].filter(Boolean).join(" ") || "Vehicle";
}

export function vehicleCategory(v: PublicVehicle): string {
  return v.category?.trim() || "Fleet";
}

export function vehicleSeatsLabel(v: PublicVehicle): string {
  const seats = v.seats;
  if (seats == null || seats === "") return "—";
  return String(seats);
}

export function vehicleDoorsLabel(v: PublicVehicle): string {
  const doors = v.doors;
  if (doors == null || doors === "") return "—";
  return String(doors);
}

export function vehicleAcLabel(v: PublicVehicle): string {
  if (v.air_conditioning === true) return "Yes";
  if (v.air_conditioning === false) return "No";
  return "—";
}

export function vehicleStatusLabel(status?: string): string {
  const s = (status ?? "").trim();
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function branchLabel(b: { name?: string; city?: string; address?: string }): string {
  const parts = [b.name, b.city].filter(Boolean);
  if (parts.length) return parts.join(" — ");
  return b.address ?? "Location";
}
