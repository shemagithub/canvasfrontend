import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  useDestinationBookingMutation,
  useDestinations,
  useDestinationsPage,
  useMyBooking,
  useUpdateMyDestinationBookingMutation,
} from "@/lib/api";
import {
  bookingDateInputValue,
  isDestinationBooking,
  isVehicleBooking,
  splitGuestName,
} from "@/lib/api/bookings-ui";
import { mapDestinations, formatDestinationEstimatedTotal, destinationHasPriceRange } from "@/lib/api/destinations-ui";
import type { PublicDestinationBookingResult } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/lib/api/auth";
import { guestDetailsFromUser } from "@/lib/auth-guest-details";

import aboutHeroImg from "@/assets/images/about-hero.png";

function readSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/** Destination package bookings (Rwanda tours). Vehicle rentals use `/reserve`. */
export default function Booking() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: pageData } = useDestinationsPage();
  const page = pageData?.sections;
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: destinationsRaw, isLoading: packagesLoading } = useDestinations();
  const destinations = useMemo(() => mapDestinations(destinationsRaw), [destinationsRaw]);
  const bookable = useMemo(() => destinations.filter((d) => d.bookable), [destinations]);

  const bookingMutation = useDestinationBookingMutation();
  const updateMutation = useUpdateMyDestinationBookingMutation();

  const params = readSearchParams();
  const editId = params.get("edit")?.trim() || "";
  const packageRef = params.get("package")?.trim() || params.get("slug")?.trim() || "";

  const { data: existingBooking, isLoading: existingLoading } = useMyBooking(
    editId && isAuthenticated ? editId : undefined,
  );
  const isEditMode = Boolean(editId && existingBooking && isDestinationBooking(existingBooking));

  const initialGuest = guestDetailsFromUser(user ?? getStoredUser());
  const [packageId, setPackageId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [firstName, setFirstName] = useState(initialGuest.firstName);
  const [lastName, setLastName] = useState(initialGuest.lastName);
  const [email, setEmail] = useState(initialGuest.email);
  const [phone, setPhone] = useState(initialGuest.phone);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [lastResult, setLastResult] = useState<PublicDestinationBookingResult | null>(null);

  const selected = useMemo(
    () => bookable.find((d) => d.id === packageId || d.slug === packageId) ?? null,
    [bookable, packageId],
  );

  const estimatedTotal = useMemo(() => {
    if (!selected) return 0;
    const unit = Number(selected.price_amount) || 0;
    const party = Math.max(1, Number(partySize) || 1);
    return unit > 0 ? unit * party : 0;
  }, [selected, partySize]);

  const estimatedTotalLabel = useMemo(() => {
    if (!selected) return null;
    return formatDestinationEstimatedTotal(selected, partySize);
  }, [selected, partySize]);

  useEffect(() => {
    const car = params.get("car");
    if (car) {
      setLocation(`/reserve?car=${encodeURIComponent(car)}`);
    }
  }, [setLocation]);

  useEffect(() => {
    if (editId && !authLoading && !isAuthenticated) {
      setLocation(`/login?return=${encodeURIComponent(`/booking?edit=${editId}`)}`);
    }
  }, [editId, authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!existingBooking || !editId) return;
    if (isVehicleBooking(existingBooking)) {
      setLocation(`/reserve?edit=${encodeURIComponent(editId)}`);
    }
  }, [existingBooking, editId, setLocation]);

  useEffect(() => {
    if (packageRef && bookable.length) {
      const match = bookable.find((d) => d.slug === packageRef || d.id === packageRef);
      if (match) setPackageId(match.id);
    }
  }, [packageRef, bookable]);

  useEffect(() => {
    if (!existingBooking || !isDestinationBooking(existingBooking)) return;
    setPackageId(existingBooking.destination_id ?? existingBooking.destination_slug ?? "");
    setTravelDate(bookingDateInputValue(existingBooking.travel_date));
    setPartySize(String(existingBooking.party_size ?? 2));
    const guest = splitGuestName(existingBooking.guest_name);
    setFirstName(guest.firstName);
    setLastName(guest.lastName);
    setEmail(existingBooking.guest_email ?? user?.email ?? "");
    setPhone(existingBooking.guest_phone ?? "");
    setNotes(existingBooking.notes ?? "");
    setTermsAccepted(true);
  }, [existingBooking, user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    const fromUser = guestDetailsFromUser(user);
    setFirstName((prev) => prev || fromUser.firstName);
    setLastName((prev) => prev || fromUser.lastName);
    setEmail((prev) => prev || fromUser.email);
    setPhone((prev) => prev || fromUser.phone);
  }, [user, authLoading]);

  async function handleConfirm() {
    if (!termsAccepted) {
      toast({ title: "Terms required", description: "Please accept the terms to continue.", variant: "destructive" });
      return;
    }
    if (!selected?.bookable) {
      toast({ title: "Select a package", description: "Choose a destination package to book.", variant: "destructive" });
      return;
    }
    if (!travelDate || !firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Incomplete booking", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const payload = {
      destination_id: selected.slug?.trim() || selected.id,
      travel_date: travelDate,
      party_size: Math.max(1, Number(partySize) || 1),
      guest_full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      guest_email: email.trim(),
      guest_phone: phone.trim(),
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditMode && existingBooking && isDestinationBooking(existingBooking)) {
        await updateMutation.mutateAsync({
          id: existingBooking.id,
          payload: {
            travel_date: payload.travel_date,
            party_size: payload.party_size,
            guest_full_name: payload.guest_full_name,
            guest_phone: payload.guest_phone,
            notes: payload.notes,
          },
        });
        setLastResult({
          id: existingBooking.id,
          status: existingBooking.status,
          total_amount: estimatedTotal || existingBooking.total_amount || 0,
          travel_date: travelDate,
          party_size: payload.party_size,
          destination_id: selected.id,
          destination_title: selected.title,
        });
        toast({ title: "Package booking updated", description: "Your changes have been saved." });
      } else {
        const result = await bookingMutation.mutateAsync(payload);
        setLastResult(result);
        toast({
          title: "Package booking received",
          description: "Our team will confirm your Rwanda trip shortly.",
        });
      }
      setConfirmed(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not submit booking. Please try again.";
      toast({ title: "Booking failed", description: message, variant: "destructive" });
    }
  }

  if (editId && (authLoading || existingLoading)) {
    return (
      <div className="min-h-screen surface-page pt-28 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (editId && existingBooking && isVehicleBooking(existingBooking)) {
    return (
      <div className="min-h-screen surface-page pt-28 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen surface-page pt-28 flex items-center justify-center px-4">
        <div className="text-center max-w-lg surface-panel border rounded-xl p-12">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
            Package <span className="text-primary">{isEditMode ? "Updated" : "Booked"}</span>
          </h1>
          {lastResult?.id ? (
            <p className="text-primary font-mono text-sm mb-4">Reference {lastResult.id.slice(0, 8)}…</p>
          ) : null}
          <p className="text-theme-muted mb-8">
            {isEditMode
              ? "Your destination package has been updated. View it anytime from your account."
              : `Thank you. We received your request for ${selected?.title ?? "your package"}.`}{" "}
            {email ? `We will reach you at ${email}.` : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account">
              <Button variant="outline" className="border-white/20 text-white uppercase font-bold tracking-widest">
                My bookings
              </Button>
            </Link>
            <Link href="/destinations">
              <Button className="bg-primary text-black uppercase font-bold tracking-widest">More packages</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (packagesLoading && !bookable.length) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading destination packages…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-24 flex">
      <div className="w-full lg:w-1/2 flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
              {isEditMode ? (
                <>
                  Update <span className="text-primary">Package</span>
                </>
              ) : (
                <>
                  Book a <span className="text-primary">Destination</span>
                </>
              )}
            </h1>
            <p className="text-theme-muted">
              {isEditMode
                ? "Change travel date, party size, or guest details for your pending package."
                : page?.hero?.subtitle ??
                  "Choose a Rwanda tourism package, pick your travel date, and submit — our team confirms every booking."}
            </p>
          </div>

          <div className="space-y-8">
            {!isEditMode && (
                  <div className="space-y-2">
                <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Destination package</Label>
                <Select value={packageId} onValueChange={setPackageId}>
                    <SelectTrigger className="surface-input border-theme h-14">
                    <SelectValue placeholder={bookable.length ? "Select a package" : "No packages available"} />
                    </SelectTrigger>
                  <SelectContent className="surface-input border-theme max-h-72">
                    {bookable.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title} — {d.priceLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                {!bookable.length ? (
                  <p className="text-sm text-white/50">
                    Packages are loading from the server.{" "}
                    <Link href="/destinations" className="text-primary hover:underline">
                      Browse destinations
                    </Link>
                  </p>
                ) : null}
              </div>
            )}

            {selected && (
              <div className="surface-panel border border-theme rounded-xl p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Selected package</p>
                <h2 className="font-bold text-lg">{selected.title}</h2>
                {selected.location ? (
                  <p className="text-sm text-white/50 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {selected.location}
                  </p>
                ) : null}
                {selected.duration ? (
                  <p className="text-xs text-white/40 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {selected.duration}
                  </p>
                ) : null}
                <p className="text-sm font-bold text-primary">{selected.priceLabel}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Travel date</Label>
                    <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                      className="surface-input border-theme h-12"
                    />
                  </div>
                  <div className="space-y-2">
                <Label className="text-white/70 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Party size
                </Label>
                    <Input
                  type="number"
                  min={1}
                  max={50}
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                      className="surface-input border-theme h-12"
                    />
                  </div>
                </div>

            {estimatedTotalLabel && selected && (
              <p className="text-sm text-white/60">
                Estimated total:{" "}
                <span className="text-white font-bold">{estimatedTotalLabel}</span>
                {destinationHasPriceRange(selected) ? (
                  <span className="block text-xs text-white/40 mt-1">
                    Final price depends on package options — we confirm after booking.
                  </span>
                ) : null}
              </p>
            )}

            <div className="space-y-4 border-t border-theme pt-8">
              <h3 className="text-xl font-bold uppercase tracking-wider">Guest details</h3>
              {user && (
                <p className="text-sm text-white/50">
                  Signed in as <span className="text-primary font-medium">{user.name || user.email}</span>
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">First name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="surface-input border-theme h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Last name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="surface-input border-theme h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="surface-input border-theme h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="surface-input border-theme h-12" />
              </div>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Notes (optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dietary needs, pickup preferences…"
                    className="surface-input border-theme h-12"
                  />
                </div>
              <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(v === true)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                <Label htmlFor="terms" className="text-sm text-white/70">
                    I agree to the{" "}
                    <Link href="/terms">
                      <span className="text-primary hover:underline">Terms of Service</span>
                  </Link>
                  </Label>
                </div>
              </div>

                <Button
                  onClick={handleConfirm}
              disabled={
                bookingMutation.isPending ||
                updateMutation.isPending ||
                !selected?.bookable ||
                !travelDate ||
                !firstName ||
                !lastName ||
                !email ||
                !phone
              }
              className="w-full bg-primary text-black hover:bg-primary/90 h-14 uppercase font-black tracking-widest"
            >
              {bookingMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Saving…" : "Submitting…"}
                    </>
                  ) : isEditMode ? (
                "Save package changes"
                  ) : (
                "Confirm package booking"
                  )}
                </Button>
              </div>
        </motion.div>
      </div>

      <div className="hidden lg:block w-1/2 relative bg-[#050505]">
        <CmsImage
          src={selected?.cover_image_url ?? undefined}
          fallback={aboutHeroImg}
          alt={selected?.title ?? "Rwanda destination"}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
        <div className="absolute bottom-20 left-20 right-20">
          <div className="glass-panel backdrop-blur-xl border border-theme rounded-xl p-8">
            <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Visit Rwanda</h4>
            <p className="text-white text-lg font-light leading-relaxed">
              {selected?.description ||
                "Curated gorilla treks, safaris, lake retreats, and cultural tours with transport and expert local guides."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
