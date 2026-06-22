import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { useFleetPage, useVehicles } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { vehicleCategory } from "@/lib/api/vehicles";

export default function Fleet() {
  const { formatRate } = useCurrency();
  const { data: fleetPage } = useFleetPage();
  const page = fleetPage?.sections;
  const { data: vehicles, isLoading, isError, error } = useVehicles();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    (vehicles ?? []).forEach((v) => {
      const c = vehicleCategory(v);
      if (c) cats.add(c);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [vehicles]);

  const allLabel = page?.categoryAllLabel ?? "All";
  const categoryLabel = (cat: string) => (cat === "All" ? allLabel : cat);

  const filteredCars = useMemo(() => {
    const list = vehicles ?? [];
    if (activeCategory === "All") return list;
    return list.filter((car) => vehicleCategory(car) === activeCategory);
  }, [vehicles, activeCategory]);

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center md:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
            {page?.titleLine1 ?? "Car"}{" "}
            <span className="text-primary">{page?.titleLine2 ?? "Rental"}</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            {page?.subtitle ??
              "Choose a vehicle for your trip — family SUVs, comfortable sedans, and options for group travel, tours, and event hospitality."}
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mb-16">
        <div className="flex flex-wrap items-center gap-4 border-b border-theme pb-6">
          <div className="flex items-center gap-2 text-white/50 uppercase font-bold text-sm tracking-widest mr-4">
            <Filter size={16} /> {page?.filtersLabel ?? "Filters"}
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 uppercase font-bold tracking-wider text-sm transition-all duration-300 border rounded-lg ${
                activeCategory === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8">
        {isLoading && <PageLoading label={page?.loadingLabel ?? "Loading vehicles…"} />}
        {isError && (
          <PageError message={error instanceof Error ? error.message : undefined} />
        )}

        {!isLoading && !isError && (
          <VehicleGrid
            vehicles={filteredCars}
            formatRate={formatRate}
            detailsLabel={page?.detailsButton ?? "Details"}
            reserveLabel={page?.reserveButton ?? "Reserve"}
            emptyMessage={page?.emptyMessage ?? "No vehicles found in this category."}
          />
        )}
      </div>
    </div>
  );
}
