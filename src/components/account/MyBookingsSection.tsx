import { Link } from "wouter";
import { ArrowRight, Calendar, Loader2, MapPin, Pencil, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { useToast } from "@/hooks/use-toast";
import {
  bookingEditHref,
  bookingStatusClass,
  bookingStatusLabel,
  bookingSummaryLine,
  formatBookingMoney,
  isDestinationBooking,
  isVehicleBooking,
} from "@/lib/api/bookings-ui";
import {
  useMyBookings,
  useUpdateMyDestinationBookingMutation,
  useUpdateMyVehicleBookingMutation,
} from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { MyBooking } from "@/lib/api/types";

function BookingRow({ booking }: { booking: MyBooking }) {
  const { toast } = useToast();
  const cancelVehicle = useUpdateMyVehicleBookingMutation();
  const cancelDestination = useUpdateMyDestinationBookingMutation();
  const isPending = cancelVehicle.isPending || cancelDestination.isPending;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  async function handleCancel() {
    if (!canCancel) return;
    try {
      if (isVehicleBooking(booking)) {
        await cancelVehicle.mutateAsync({ id: booking.id, payload: { status: "cancelled" } });
      } else {
        await cancelDestination.mutateAsync({ id: booking.id, payload: { status: "cancelled" } });
      }
      toast({ title: "Booking cancelled", description: "Your request has been updated." });
    } catch (e) {
      toast({
        title: e instanceof ApiError ? e.message : "Could not cancel booking",
        variant: "destructive",
      });
    }
  }

  const amountLabel = isDestinationBooking(booking)
    ? formatBookingMoney(booking.total_amount, booking.price_currency)
    : formatBookingMoney(booking.total_amount, "USD");

  return (
    <article className="border border-theme rounded-lg p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${bookingStatusClass(booking.status)}`}
            >
              {bookingStatusLabel(booking.status)}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              {isDestinationBooking(booking) ? "Destination package" : "Vehicle rental"}
            </span>
          </div>
          <h3 className="font-bold text-white text-base md:text-lg leading-snug">
            {isDestinationBooking(booking)
              ? booking.destination_title ?? "Destination package"
              : booking.vehicle_name ?? "Vehicle rental"}
          </h3>
          <p className="text-sm text-white/50 mt-1">{bookingSummaryLine(booking)}</p>
          {isVehicleBooking(booking) && (booking.pickup_location || booking.return_location) ? (
            <p className="text-xs text-white/40 mt-2 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {[booking.pickup_location, booking.return_location].filter(Boolean).join(" → ")}
              </span>
            </p>
          ) : null}
          {isDestinationBooking(booking) ? (
            <p className="text-xs text-white/40 mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {booking.party_size ?? 1} traveler{(booking.party_size ?? 1) === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-white/35 mb-1">Total</p>
          <p className="font-bold text-primary">{amountLabel}</p>
          {booking.id ? (
            <p className="text-[10px] text-white/30 font-mono mt-1">Ref {booking.id.slice(0, 8)}…</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-theme">
        {booking.editable ? (
          <Link href={bookingEditHref(booking)}>
            <Button
              type="button"
              size="sm"
              className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest text-[10px] h-9"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Modify
            </Button>
          </Link>
        ) : null}
        {canCancel && booking.status !== "cancelled" ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleCancel}
            className="border-white/15 text-white/70 hover:bg-white/5 uppercase font-bold tracking-widest text-[10px] h-9"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
            )}
            Cancel
          </Button>
        ) : null}
        {!booking.editable && booking.status !== "cancelled" ? (
          <Link href="/contact">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-white/50 hover:text-white uppercase font-bold tracking-widest text-[10px] h-9"
            >
              Contact support <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function MyBookingsSection() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMyBookings();

  if (isLoading) {
    return <PageLoading label="Loading your bookings…" />;
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageError message={error instanceof Error ? error.message : undefined} />
        <Button type="button" variant="outline" onClick={() => refetch()} className="border-white/20 text-white">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const bookings = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">My bookings</h2>
          <p className="text-sm text-white/50 mt-1">Vehicle rentals and destination packages linked to your account.</p>
        </div>
        {!isFetching && bookings.length > 0 ? (
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
            {bookings.length} reservation{bookings.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-theme rounded-lg">
          <p className="text-white/50 mb-4">No bookings yet. Reserve a vehicle or book a Rwanda destination package.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/booking">
              <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest text-xs">
                Book a package
              </Button>
            </Link>
            <Link href="/reserve">
              <Button variant="outline" className="border-white/20 text-white uppercase font-bold tracking-widest text-xs">
                Rent a vehicle
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}
