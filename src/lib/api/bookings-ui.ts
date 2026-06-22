import type { MyBooking, MyDestinationBooking, MyVehicleBooking } from "./types";

export function isVehicleBooking(b: MyBooking): b is MyVehicleBooking {
  return b.kind === "vehicle";
}

export function isDestinationBooking(b: MyBooking): b is MyDestinationBooking {
  return b.kind === "destination";
}

/** Normalize API date strings to `YYYY-MM-DD` for `<input type="date">`. */
export function bookingDateInputValue(raw?: string | null): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  return t.includes("T") ? t.split("T")[0]!.slice(0, 10) : t.slice(0, 10);
}

export function splitGuestName(full?: string | null): { firstName: string; lastName: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function bookingStatusLabel(status?: string): string {
  const s = (status ?? "pending").replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function bookingStatusClass(status?: string): string {
  switch ((status ?? "pending").toLowerCase()) {
    case "confirmed":
      return "text-blue-400 border-blue-400/30 bg-blue-400/10";
    case "ongoing":
      return "text-violet-400 border-violet-400/30 bg-violet-400/10";
    case "completed":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    case "cancelled":
      return "text-red-400 border-red-400/30 bg-red-400/10";
    default:
      return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  }
}

export function formatBookingMoney(amount?: number, _currency = "USD"): string {
  const n = Number(amount) || 0;
  if (n <= 0) return "—";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function vehicleBookingEditHref(id: string): string {
  return `/reserve?edit=${encodeURIComponent(id)}`;
}

export function destinationBookingEditHref(id: string): string {
  return `/booking?edit=${encodeURIComponent(id)}`;
}

export function destinationBookingNewHref(slugOrId: string): string {
  return `/booking?package=${encodeURIComponent(slugOrId)}`;
}

export function bookingEditHref(b: MyBooking): string {
  return isDestinationBooking(b) ? destinationBookingEditHref(b.id) : vehicleBookingEditHref(b.id);
}

export function bookingSummaryLine(b: MyBooking): string {
  if (isDestinationBooking(b)) {
    const date = bookingDateInputValue(b.travel_date);
    const party = b.party_size ?? 1;
    return [b.destination_title, date && `Travel ${date}`, `${party} guest${party === 1 ? "" : "s"}`]
      .filter(Boolean)
      .join(" · ");
  }
  const pickup = bookingDateInputValue(b.pickup_date);
  const ret = bookingDateInputValue(b.return_date);
  return [b.vehicle_name, pickup && ret && `${pickup} → ${ret}`].filter(Boolean).join(" · ");
}
