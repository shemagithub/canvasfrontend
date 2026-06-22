import { Link } from "wouter";
import { DoorOpen, Snowflake, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import type { PublicVehicle } from "@/lib/api/types";
import { statusBadgeClass } from "@/lib/api/vehicle-detail";
import {
  vehicleAcLabel,
  vehicleCategory,
  vehicleDisplayName,
  vehicleDoorsLabel,
  vehicleFallbackImage,
  vehicleImage,
  vehicleSeatsLabel,
  vehicleStatusLabel,
} from "@/lib/api/vehicles";

export type VehicleGridCardProps = {
  car: PublicVehicle;
  formatRate: (amount: number | undefined, suffix?: string) => string;
  detailsLabel?: string;
  reserveLabel?: string;
  className?: string;
};

export function VehicleGridCard({
  car,
  formatRate,
  detailsLabel = "Details",
  reserveLabel = "Reserve",
  className = "",
}: VehicleGridCardProps) {
  const name = vehicleDisplayName(car);
  const img = vehicleImage(car);
  const cat = vehicleCategory(car);
  const price = formatRate(car.daily_rate, " /day");
  const seats = vehicleSeatsLabel(car);
  const doors = vehicleDoorsLabel(car);
  const ac = vehicleAcLabel(car);

  return (
    <article
      className={`surface-panel border rounded-xl overflow-hidden flex flex-col group h-full ${className}`.trim()}
    >
      <Link href={`/car-details/${car.id}`}>
        <div className="aspect-video bg-[#111] overflow-hidden relative cursor-pointer">
          <CmsImage
            src={img}
            fallback={vehicleFallbackImage(car)}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 rounded-md">
            {cat}
          </div>
        </div>
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-3">
          <Link href={`/car-details/${car.id}`} className="min-w-0">
            <h3 className="text-2xl font-bold uppercase tracking-tight hover:text-primary transition-colors truncate">
              {name}
            </h3>
          </Link>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-primary">{price}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {car.fuel_type ? (
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 border border-white/10 px-2 py-1 rounded">
              {car.fuel_type}
            </span>
          ) : null}
          {car.transmission ? (
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 border border-white/10 px-2 py-1 rounded">
              {car.transmission}
            </span>
          ) : null}
          {car.status ? (
            <span
              className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${statusBadgeClass(car.status)}`}
            >
              {vehicleStatusLabel(car.status)}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-theme py-4 mb-6 mt-auto">
          <div className="text-center">
            <span className="flex items-center justify-center gap-1 text-white/50 text-[10px] uppercase tracking-widest mb-1">
              <Users size={12} aria-hidden /> Seats
            </span>
            <span className="font-bold text-sm">{seats}</span>
          </div>
          <div className="text-center border-x border-white/10">
            <span className="flex items-center justify-center gap-1 text-white/50 text-[10px] uppercase tracking-widest mb-1">
              <DoorOpen size={12} aria-hidden /> Doors
            </span>
            <span className="font-bold text-sm">{doors}</span>
          </div>
          <div className="text-center">
            <span className="flex items-center justify-center gap-1 text-white/50 text-[10px] uppercase tracking-widest mb-1">
              <Snowflake size={12} aria-hidden /> A/C
            </span>
            <span
              className={`font-bold text-sm ${
                ac === "Yes" ? "text-emerald-400" : ac === "No" ? "text-white/40" : ""
              }`}
            >
              {ac}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/car-details/${car.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-theme text-white hover:bg-white/10 uppercase font-bold tracking-widest h-12"
            >
              {detailsLabel}
            </Button>
          </Link>
          <Link href={`/reserve?car=${encodeURIComponent(car.id)}`} className="flex-1">
            <Button className="w-full bg-white text-black hover:bg-primary hover:text-black uppercase font-bold tracking-widest h-12 transition-colors">
              {reserveLabel}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
