import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { VehicleDetailContent } from "@/components/vehicles/VehicleDetailContent";
import { useCurrency } from "@/context/CurrencyContext";
import { useVehicle } from "@/lib/api";

export default function CarDetails() {
  const params = useParams<{ id: string }>();
  const vehicleId = params.id;
  const { formatMoney: formatCurrency } = useCurrency();
  const { data: car, isLoading, isError, error } = useVehicle(vehicleId);

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading vehicle details…" />
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="min-h-screen surface-page flex flex-col items-center justify-center pt-28 gap-6">
        <PageError message={error instanceof Error ? error.message : "Vehicle not found"} />
        <Link href="/fleet">
          <Button className="bg-primary text-black hover:bg-primary/90">Back to Car Rental</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-20 pb-24">
      <VehicleDetailContent car={car} formatCurrency={formatCurrency} />
    </div>
  );
}
