import { motion } from "framer-motion";
import type { PublicVehicle } from "@/lib/api/types";
import { VehicleGridCard } from "@/components/vehicles/VehicleGridCard";

export type VehicleGridProps = {
  vehicles: PublicVehicle[];
  formatRate: (amount: number | undefined, suffix?: string) => string;
  detailsLabel?: string;
  reserveLabel?: string;
  emptyMessage?: string;
  /** Home: animate when scrolled into view. Fleet: animate on page load. */
  animateOnScroll?: boolean;
};

export function VehicleGrid({
  vehicles,
  formatRate,
  detailsLabel = "Details",
  reserveLabel = "Reserve",
  emptyMessage,
  animateOnScroll = false,
}: VehicleGridProps) {
  if (!vehicles.length) {
    if (!emptyMessage) return null;
    return (
      <div className="text-center py-20 text-white/50 col-span-full">{emptyMessage}</div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {vehicles.map((car, i) => (
        <motion.div
          key={car.id}
          layout={!animateOnScroll}
          className="h-full"
          {...(animateOnScroll
            ? {
                initial: "hidden",
                whileInView: "visible",
                viewport: { once: true, margin: "-50px" },
                variants: {
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: { delay: i * 0.1, duration: 0.4 },
                  },
                },
              }
            : {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.9 },
                transition: { duration: 0.4 },
              })}
        >
          <VehicleGridCard
            car={car}
            formatRate={formatRate}
            detailsLabel={detailsLabel}
            reserveLabel={reserveLabel}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
