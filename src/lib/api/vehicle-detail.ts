import type { PublicVehicle, VehicleImageSlot } from "./types";
import { normalizePublicAssetUrl } from "./config";

export type DetailRow = { label: string; value: string };
export type PricingRow = { label: string; amount: number; suffix?: string };
export type PolicyBlock = { title: string; body: string };

const AMENITY_FLAGS: { key: keyof PublicVehicle; label: string }[] = [
  { key: "air_conditioning", label: "Air Conditioning" },
  { key: "gps_enabled", label: "GPS Navigation" },
  { key: "bluetooth_usb", label: "Bluetooth / USB" },
  { key: "android_auto_carplay", label: "Android Auto / CarPlay" },
  { key: "backup_camera", label: "Backup Camera" },
  { key: "parking_sensors", label: "Parking Sensors" },
  { key: "cruise_control", label: "Cruise Control" },
  { key: "heated_seats", label: "Heated Seats" },
  { key: "leather_seats", label: "Leather Seats" },
  { key: "sunroof", label: "Sunroof" },
  { key: "child_seat_support", label: "Child Seat Support" },
  { key: "wifi_available", label: "In-Car WiFi" },
  { key: "tracking_system", label: "GPS Tracking" },
  { key: "abs_brakes", label: "ABS Brakes" },
  { key: "airbags", label: "Airbags" },
  { key: "stability_control", label: "Stability Control" },
  { key: "lane_assist", label: "Lane Assist" },
  { key: "emergency_braking", label: "Emergency Braking" },
  { key: "tire_pressure_monitoring", label: "Tire Pressure Monitoring" },
  { key: "security_alarm", label: "Security Alarm" },
];

function str(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  return String(v).trim() || undefined;
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function vehicleGallery(car: PublicVehicle): VehicleImageSlot[] {
  if (car.image_slots?.length) {
    return car.image_slots.map((slot) => ({
      ...slot,
      url: normalizePublicAssetUrl(slot.url) ?? slot.url,
    }));
  }
  const urls = car.gallery_images?.length ? car.gallery_images : car.image_url ? [car.image_url] : [];
  return urls.map((url, i) => ({
    label: i === 0 ? "Hero" : `Photo ${i + 1}`,
    url: normalizePublicAssetUrl(url) ?? url,
  }));
}

export function vehicleSpecificationRows(car: PublicVehicle): DetailRow[] {
  const rows: DetailRow[] = [];
  const add = (label: string, value: unknown) => {
    const s = str(value);
    if (s) rows.push({ label, value: s });
  };

  add("Brand", car.brand);
  add("Model", car.model_name);
  add("Category", car.category);
  add("Year", car.year);
  add("Engine", car.engine_size);
  add("Horsepower", car.horsepower != null ? `${car.horsepower} HP` : undefined);
  add("Fuel Type", car.fuel_type);
  add("Fuel Consumption", car.fuel_consumption);
  add("Transmission", car.transmission);
  add("Seats", car.seats);
  add("Doors", car.doors);
  add("Luggage Capacity", car.luggage_capacity);
  add("Mileage", car.mileage != null ? `${car.mileage}` : undefined);
  add("Mileage Limit / Day", car.mileage_limit_per_day);
  add("Condition", car.condition);
  add("Status", car.status);
  add("Pickup Location", car.branch_display);

  return rows;
}

export function vehiclePricingRows(car: PublicVehicle): PricingRow[] {
  const rows: PricingRow[] = [];
  const push = (label: string, amount: unknown, suffix?: string) => {
    const n = num(amount);
    if (n != null) rows.push({ label, amount: n, suffix });
  };

  push("Daily Rate", car.daily_rate, "/ day");
  push("Weekly Rate", car.weekly_rate, "/ week");
  push("Monthly Rate", car.monthly_rate, "/ month");
  push("Hourly Rate", car.hourly_rate, "/ hour");
  push("Security Deposit", car.deposit_amount);
  push("Insurance", car.insurance_cost);
  push("Driver Fee", car.driver_fee);
  push("Late Return Fee", car.late_return_fee);
  push("Airport Pickup", car.airport_pickup_fee);
  push("Extra Charges", car.extra_charges);
  if (car.discount_rate != null) {
    const d = num(car.discount_rate);
    if (d != null) rows.push({ label: "Discount", amount: d, suffix: "%" });
  }

  return rows;
}

export function vehicleAmenities(car: PublicVehicle): string[] {
  return AMENITY_FLAGS.filter(({ key }) => car[key] === true).map(({ label }) => label);
}

export function vehiclePolicyBlocks(car: PublicVehicle): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  const add = (title: string, body?: string) => {
    const b = str(body);
    if (b) blocks.push({ title, body: b });
  };

  add("Fuel Policy", car.fuel_policy);
  add("Cancellation", car.cancellation_policy);
  add("Smoking", car.smoking_policy);
  add("Pets", car.pets_policy);
  add("Cross-Border", car.cross_border_policy);

  return blocks;
}

export function vehicleRequirementRows(car: PublicVehicle): DetailRow[] {
  const rows: DetailRow[] = [];
  if (car.min_driver_age != null) {
    rows.push({ label: "Minimum Driver Age", value: `${car.min_driver_age}+` });
  }
  const add = (label: string, value?: string) => {
    const s = str(value);
    if (s) rows.push({ label, value: s });
  };
  add("License Requirements", car.license_requirements);
  add("International License", car.international_license_policy);
  add("ID Requirements", car.id_requirements);
  return rows;
}

export function vehiclePaymentMethods(car: PublicVehicle): string[] {
  const raw = car.payment_methods;
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => String(m).trim()).filter(Boolean);
}

export function vehicleFeatureGroups(car: PublicVehicle) {
  return [
    { primary: "Listed", secondary: "Features", items: car.features ?? [] },
    { primary: "Comfort", secondary: "Options", items: car.comfort_features ?? [] },
    { primary: "Safety", secondary: "Options", items: car.safety_features ?? [] },
  ].filter((g) => g.items.length > 0);
}

export function statusBadgeClass(status?: string): string {
  const s = (status ?? "").toLowerCase();
  if (s === "available") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (s === "reserved") return "bg-violet-500/20 text-violet-400 border-violet-500/30";
  if (s === "rented" || s === "booked") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (s === "maintenance") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-white/10 text-white/70 border-white/20";
}
