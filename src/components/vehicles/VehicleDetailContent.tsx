import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  CreditCard,
  Fuel,
  Globe,
  IdCard,
  MapPin,
  Settings2,
  Shield,
  Sparkles,
  Tag,
  User,
  Users,
} from "lucide-react";
import type { DetailRow } from "@/lib/api/vehicle-detail";
import { Button } from "@/components/ui/button";
import { CmsImage } from "@/components/ui/CmsImage";
import { cn } from "@/lib/utils";
import type { PublicVehicle } from "@/lib/api/types";
import {
  vehicleAmenities,
  vehicleFeatureGroups,
  vehicleGallery,
  vehiclePaymentMethods,
  vehiclePolicyBlocks,
  vehiclePricingRows,
  vehicleRequirementRows,
  vehicleSpecificationRows,
  statusBadgeClass,
} from "@/lib/api/vehicle-detail";
import {
  vehicleCategory,
  vehicleDisplayName,
  vehicleFallbackImage,
} from "@/lib/api/vehicles";

type VehicleDetailContentProps = {
  car: PublicVehicle;
  formatCurrency: (amount: number) => string;
};

function SectionCard({
  primary,
  secondary,
  children,
  className,
}: {
  primary: string;
  secondary: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-panel border rounded-2xl p-6 md:p-8", className)}>
      <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-6 text-white">
        <span className="text-primary">{primary}</span> {secondary}
      </h2>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rows.map((row) => (
        <div key={row.label} className="border border-theme rounded-lg px-4 py-3">
          <dt className="text-white/50 text-[10px] uppercase tracking-widest mb-1">{row.label}</dt>
          <dd className="font-semibold text-white text-sm md:text-base">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PolicyText({ body }: { body: string }) {
  return (
    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap break-words">{body}</p>
  );
}

const REQUIREMENT_ICONS: Record<string, typeof User> = {
  "Minimum Driver Age": User,
  "License Requirements": IdCard,
  "International License": Globe,
  "ID Requirements": IdCard,
};

function DriverRequirementsCard({ rows }: { rows: DetailRow[] }) {
  return (
    <section className="surface-panel border rounded-2xl p-6 md:p-8 mb-12">
      <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-6 text-white">
        <span className="text-primary">Driver</span> Requirements
      </h2>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 lg:gap-0 rounded-xl border border-theme bg-[var(--surface-raised)]/40 overflow-hidden">
        {rows.map((row, index) => {
          const Icon = REQUIREMENT_ICONS[row.label] ?? Shield;
          const isAge = row.label === "Minimum Driver Age";
          return (
            <div
              key={row.label}
              className={cn(
                "flex flex-1 min-w-0 flex-col gap-3 p-5 md:p-6",
                index > 0 && "lg:border-l border-theme",
                index > 0 && "border-t lg:border-t-0 border-theme",
              )}
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50 leading-tight">
                  {row.label}
                </p>
              </div>
              <p
                className={cn(
                  "text-white leading-relaxed break-words",
                  isAge ? "text-2xl md:text-3xl font-black text-primary" : "text-sm max-h-32 overflow-y-auto",
                )}
              >
                {row.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function VehicleDetailContent({ car, formatCurrency }: VehicleDetailContentProps) {
  const name = vehicleDisplayName(car);
  const cat = vehicleCategory(car);
  const gallery = vehicleGallery(car);
  const [activeImage, setActiveImage] = useState(0);
  const mainImage = gallery[activeImage]?.url ?? gallery[0]?.url;

  const specs = vehicleSpecificationRows(car);
  const pricing = vehiclePricingRows(car);
  const amenities = vehicleAmenities(car);
  const policies = vehiclePolicyBlocks(car);
  const requirements = vehicleRequirementRows(car);
  const featureGroups = vehicleFeatureGroups(car);
  const paymentMethods = vehiclePaymentMethods(car);

  return (
    <>
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <Link href="/fleet">
          <Button variant="ghost" className="text-white/70 hover:text-white gap-2">
            <ArrowLeft size={18} />
            Back to Car Rental
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Hero + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative overflow-hidden rounded-2xl surface-raised aspect-video">
                {mainImage && (
                  <CmsImage
                    src={mainImage}
                    fallback={vehicleFallbackImage(car)}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="bg-black/80 backdrop-blur-md px-3 py-1 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 rounded-md">
                    {cat}
                  </span>
                  {car.verified_vehicle && (
                    <span className="backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-md bg-primary/20 text-primary border-primary/40 inline-flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {car.status && (
                    <span
                      className={cn(
                        "backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-md",
                        statusBadgeClass(car.status),
                      )}
                    >
                      {car.status}
                    </span>
                  )}
                </div>
                {gallery[activeImage]?.label && (
                  <span className="absolute bottom-4 left-4 bg-black/70 text-white/80 text-xs uppercase tracking-widest px-3 py-1 rounded-md">
                    {gallery[activeImage].label}
                  </span>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gallery.map((slot, i) => (
                    <button
                      key={`${slot.url}-${i}`}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "aspect-video rounded-lg overflow-hidden bg-[#111] ring-2 transition-all text-left",
                        activeImage === i ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <CmsImage
                        src={slot.url}
                        fallback={vehicleFallbackImage(car)}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="surface-panel border border-primary/20 rounded-2xl p-8 flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">{name}</h1>
                <p className="text-white/50 text-sm">
                  {[car.brand, car.model_name].filter(Boolean).join(" · ")}
                </p>
                {car.year && (
                  <p className="text-white/40 text-xs uppercase tracking-widest mt-2">{car.year} Model</p>
                )}
                {car.branch_display && (
                  <p className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-widest mt-3">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    {car.branch_display}
                  </p>
                )}
              </div>

              <div className="border-t border-theme pt-6">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-1">From</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(car.daily_rate ?? 0)}
                  <span className="text-sm font-normal text-white/50"> / day</span>
                </p>
                {car.weekly_rate != null && (
                  <p className="text-white/50 text-sm mt-2">
                    {formatCurrency(car.weekly_rate)} / week
                  </p>
                )}
              </div>

              {pricing.length > 1 && (
                <ul className="space-y-2 text-sm border-t border-theme pt-4">
                  {pricing
                    .filter((p) => p.label !== "Daily Rate")
                    .map((p) => (
                      <li key={p.label} className="flex justify-between gap-2 text-white/70">
                        <span>{p.label}</span>
                        <span className="text-white font-medium shrink-0">
                          {p.suffix === "%"
                            ? `${p.amount}%`
                            : formatCurrency(p.amount) + (p.suffix ?? "")}
                        </span>
                      </li>
                    ))}
                </ul>
              )}

              <Link href={`/reserve?car=${encodeURIComponent(car.id)}`} className="mt-auto">
                <Button className="w-full bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest h-12">
                  Book Now
                </Button>
              </Link>
            </aside>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {[
              { icon: Tag, label: "Category", value: cat },
              { icon: Calendar, label: "Year", value: car.year?.toString() },
              { icon: Settings2, label: "Transmission", value: car.transmission },
              { icon: Users, label: "Seats", value: car.seats?.toString() },
              { icon: Fuel, label: "Fuel", value: car.fuel_type },
              { icon: Sparkles, label: "Condition", value: car.condition },
              { icon: Shield, label: "Min. Age", value: car.min_driver_age ? `${car.min_driver_age}+` : undefined },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <div
                  key={f.label}
                  className="surface-card border rounded-xl p-4 flex items-center gap-3"
                >
                  <f.icon className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/50">{f.label}</p>
                    <p className="font-bold text-white text-sm">{f.value}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {specs.length > 0 && (
              <SectionCard primary="Vehicle" secondary="Specifications">
                <DetailGrid rows={specs} />
              </SectionCard>
            )}

            {amenities.length > 0 && (
              <SectionCard primary="Included" secondary="Equipment">
                <ul className="flex flex-wrap gap-2">
                  {amenities.map((label) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-white"
                    >
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>

          {featureGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featureGroups.map((group) => (
                <SectionCard key={`${group.primary}-${group.secondary}`} primary={group.primary} secondary={group.secondary}>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              ))}
            </div>
          )}

          {pricing.length > 0 && (
            <SectionCard primary="Pricing" secondary="Rates & Fees" className="mb-12">
              <DetailGrid
                rows={pricing.map((p) => ({
                  label: p.label,
                  value:
                    p.suffix === "%"
                      ? `${p.amount}%`
                      : `${formatCurrency(p.amount)}${p.suffix ?? ""}`,
                }))}
              />
            </SectionCard>
          )}

          {requirements.length > 0 && <DriverRequirementsCard rows={requirements} />}

          {paymentMethods.length > 0 && (
            <SectionCard primary="Payment" secondary="Methods" className="mb-12">
              <ul className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <li
                    key={method}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-theme text-sm text-white"
                  >
                    <CreditCard className="w-4 h-4 text-primary shrink-0" />
                    {method}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {policies.length > 0 && (
            <SectionCard primary="Rental" secondary="Policies" className="mb-12">
              <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2">
                {policies.map((block) => (
                  <div key={block.title}>
                    <h3 className="text-primary font-bold uppercase text-xs tracking-widest mb-2">
                      {block.title}
                    </h3>
                    <PolicyText body={block.body} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-4 text-white">
              Ready to <span className="text-primary">Experience</span> {name}?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Reserve this vehicle and our concierge team will confirm your itinerary.
            </p>
            <Link href={`/reserve?car=${encodeURIComponent(car.id)}`}>
              <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest h-14 px-12 text-lg">
                Reserve {name}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
