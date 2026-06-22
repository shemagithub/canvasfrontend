import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api/client";
import {
  useBookingMutation,
  useBookingPage,
  useBranches,
  useMyBooking,
  useUpdateMyVehicleBookingMutation,
  useVehicle,
  useVehicles,
} from "@/lib/api";
import { bookingDateInputValue, isDestinationBooking, isVehicleBooking, splitGuestName } from "@/lib/api/bookings-ui";
import type { PublicBookingResult } from "@/lib/api/types";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { branchLabel, vehicleDisplayName } from "@/lib/api/vehicles";
import { getStoredUser } from "@/lib/api/auth";
import { guestDetailsFromUser } from "@/lib/auth-guest-details";

import aboutInteriorImg from "@/assets/images/about-interior.png";

function readSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/** Vehicle rental reservations (fleet). Destination packages use `/booking`. */
export default function VehicleReserve() {
  const { formatRate } = useCurrency();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: bookingPage } = useBookingPage();
  const page = bookingPage?.sections;
  const bookingMutation = useBookingMutation();
  const updateBookingMutation = useUpdateMyVehicleBookingMutation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const initialGuest = guestDetailsFromUser(getStoredUser());
  const { data: vehicles = [] } = useVehicles();
  const { data: branches = [] } = useBranches();

  const editId = readSearchParams().get("edit")?.trim() || "";
  const { data: existingBooking, isLoading: existingLoading } = useMyBooking(
    editId && isAuthenticated ? editId : undefined,
  );
  const isEditMode = Boolean(editId && existingBooking && isVehicleBooking(existingBooking));

  const [step, setStep] = useState(1);
  const [pickupBranchId, setPickupBranchId] = useState("");
  const [returnBranchId, setReturnBranchId] = useState("");
  const [returnSame, setReturnSame] = useState(true);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [firstName, setFirstName] = useState(initialGuest.firstName);
  const [lastName, setLastName] = useState(initialGuest.lastName);
  const [email, setEmail] = useState(initialGuest.email);
  const [phone, setPhone] = useState(initialGuest.phone);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [lastResult, setLastResult] = useState<PublicBookingResult | null>(null);

  const { data: selectedVehicle } = useVehicle(vehicleId || undefined);

  useEffect(() => {
    if (editId && !authLoading && !isAuthenticated) {
      setLocation(`/login?return=${encodeURIComponent(`/reserve?edit=${editId}`)}`);
    }
  }, [editId, authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!existingBooking || !editId) return;
    if (isDestinationBooking(existingBooking)) {
      setLocation(`/booking?edit=${encodeURIComponent(editId)}`);
    }
  }, [existingBooking, editId, setLocation]);

  useEffect(() => {
    const q = readSearchParams();
    if (q.get("edit")) return;
    const car = q.get("car");
    const pickup = q.get("pickup");
    const ret = q.get("return");
    const pDate = q.get("pickupDate");
    if (car) setVehicleId(car);
    if (pickup) setPickupBranchId(pickup);
    if (ret) {
      setReturnBranchId(ret);
      setReturnSame(false);
    }
    if (pDate) setPickupDate(pDate);
  }, []);

  useEffect(() => {
    if (!existingBooking || !isVehicleBooking(existingBooking)) return;
    setVehicleId(existingBooking.vehicle_id ?? "");
    setPickupDate(bookingDateInputValue(existingBooking.pickup_date));
    setReturnDate(bookingDateInputValue(existingBooking.return_date));
    setPickupBranchId(existingBooking.pickup_branch_id ?? "");
    setReturnBranchId(existingBooking.return_branch_id ?? "");
    setReturnSame(existingBooking.return_same !== false);
    const guest = splitGuestName(existingBooking.guest_name);
    setFirstName(guest.firstName);
    setLastName(guest.lastName);
    setEmail(existingBooking.guest_email ?? user?.email ?? "");
    setPhone(existingBooking.guest_phone ?? "");
    setNotes(existingBooking.notes ?? "");
    setTermsAccepted(true);
    setStep(1);
  }, [existingBooking, user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    const fromUser = guestDetailsFromUser(user);
    setFirstName((prev) => prev || fromUser.firstName);
    setLastName((prev) => prev || fromUser.lastName);
    setEmail((prev) => prev || fromUser.email);
    setPhone((prev) => prev || fromUser.phone);
  }, [user, authLoading]);

  const pickupBranches = useMemo(
    () => branches.filter((b) => b.is_pickup !== false),
    [branches],
  );
  const returnBranches = useMemo(
    () => branches.filter((b) => b.is_return !== false),
    [branches],
  );

  async function handleConfirm() {
    if (!termsAccepted) {
      toast({ title: "Terms required", description: "Please accept the terms to continue.", variant: "destructive" });
      return;
    }
    if (!vehicleId || !pickupDate || !returnDate || !pickupBranchId) {
      toast({ title: "Incomplete booking", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }

    try {
      if (isEditMode && existingBooking && isVehicleBooking(existingBooking)) {
        await updateBookingMutation.mutateAsync({
          id: existingBooking.id,
          payload: {
            pickup_date: pickupDate,
            return_date: returnDate,
            pickup_branch_id: pickupBranchId,
            return_branch_id: returnSame ? pickupBranchId : returnBranchId || pickupBranchId,
            return_same: returnSame,
            guest_full_name: `${firstName} ${lastName}`.trim(),
            guest_phone: phone,
            notes: notes || undefined,
          },
        });
        setLastResult({
          id: existingBooking.id,
          status: existingBooking.status,
          rental_days: existingBooking.rental_days ?? 1,
          total_amount: existingBooking.total_amount ?? 0,
          daily_rate: existingBooking.daily_rate ?? 0,
          pickup_date: pickupDate,
          return_date: returnDate,
          vehicle_id: vehicleId,
        });
        toast({
          title: "Reservation Updated",
          description: "Your rental changes have been saved.",
          className: "bg-black border-primary text-white",
        });
      } else {
        const result = await bookingMutation.mutateAsync({
          vehicle_id: vehicleId,
          pickup_date: pickupDate,
          return_date: returnDate,
          pickup_branch_id: pickupBranchId,
          return_branch_id: returnSame ? pickupBranchId : returnBranchId || pickupBranchId,
          return_same: returnSame,
          guest_full_name: `${firstName} ${lastName}`.trim(),
          guest_email: email,
          guest_phone: phone,
          notes: notes || null,
        });
        setLastResult(result);
        toast({
          title: "Reservation Submitted",
          description: "Our team will confirm your vehicle rental shortly.",
          className: "bg-black border-primary text-white",
        });
      }
      setConfirmed(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not submit booking. Please try again.";
      toast({ title: "Booking Failed", description: message, variant: "destructive" });
    }
  }

  if (editId && (authLoading || existingLoading)) {
    return (
      <div className="min-h-screen surface-page pt-28 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (editId && existingBooking && isDestinationBooking(existingBooking)) {
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
            Rental <span className="text-primary">{isEditMode ? "Updated" : "Received"}</span>
          </h1>
          {lastResult?.id ? (
            <p className="text-primary font-mono text-sm mb-4">Reference {lastResult.id.slice(0, 8)}…</p>
          ) : null}
          <p className="text-theme-muted mb-8">
            {isEditMode
              ? "Your vehicle reservation has been updated."
              : page?.confirmedMessage ??
                "Thank you. We have your request and will contact you to confirm pickup details and vehicle availability."}{" "}
            {!isEditMode && email ? `We will reach you at ${email}.` : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/account">
              <Button variant="outline" className="border-white/20 text-white uppercase font-bold tracking-widest">
                My bookings
              </Button>
            </Link>
            <Link href="/fleet">
              <Button className="bg-primary text-black uppercase font-bold tracking-widest">Browse Car Rental</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-24 flex">
      <div className="w-full lg:w-1/2 flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
              {isEditMode ? (
                <>
                  Update <span className="text-primary">Vehicle Rental</span>
                </>
              ) : (
                <>
                  {page?.titleLine1 ?? "Plan Your"}{" "}
                  <span className="text-primary">{page?.titleLine2 ?? "Rental"}</span>
                </>
              )}
            </h1>
            <p className="text-theme-muted">
              {isEditMode
                ? "Change dates, branches, or guest details for your pending vehicle reservation."
                : page?.subtitle ??
                  "Share your travel dates, pickup location, and guest details — our team will confirm your rental shortly."}
            </p>
          </div>

          <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-1 bg-[#222] relative overflow-hidden rounded-full">
                <div
                  className="absolute inset-0 bg-primary transition-all duration-500"
                  style={{ width: step >= i ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-wider border-b border-theme pb-4">Itinerary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Pick-up Location</Label>
                    <Select value={pickupBranchId} onValueChange={setPickupBranchId}>
                      <SelectTrigger className="surface-input border-theme h-12">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="surface-input border-theme">
                        {pickupBranches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {branchLabel(b)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Drop-off Location</Label>
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id="return-same"
                        checked={returnSame}
                        onCheckedChange={(v) => setReturnSame(v === true)}
                      />
                      <Label htmlFor="return-same" className="text-sm text-white/70">
                        Same as pick-up
                      </Label>
                    </div>
                    {!returnSame && (
                      <Select value={returnBranchId} onValueChange={setReturnBranchId}>
                        <SelectTrigger className="surface-input border-theme h-12">
                          <SelectValue placeholder="Select return branch" />
                        </SelectTrigger>
                        <SelectContent className="surface-input border-theme">
                          {returnBranches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {branchLabel(b)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Pick-up Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                      <Input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="pl-10 surface-input border-theme h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Drop-off Date</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split("T")[0]}
                        className="pl-10 surface-input border-theme h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!pickupBranchId || !pickupDate || !returnDate}
                  className="w-full bg-primary text-black hover:bg-primary/90 h-14 uppercase font-bold tracking-widest"
                >
                  Continue to Vehicle
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-wider border-b border-theme pb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" /> Vehicle Selection
                </h3>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Select Vehicle</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger className="surface-input border-theme h-14">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent className="surface-input border-theme max-h-64">
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {vehicleDisplayName(v)}
                          {v.daily_rate != null ? ` — ${formatRate(v.daily_rate, "/day")}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedVehicle && (
                  <p className="text-white/50 text-sm">
                    Selected: <span className="text-white font-medium">{vehicleDisplayName(selectedVehicle)}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-1/3 border-white/20 text-white hover:bg-white/10 h-14 uppercase font-bold tracking-widest"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!vehicleId}
                  className="w-2/3 bg-primary text-black hover:bg-primary/90 h-14 uppercase font-bold tracking-widest"
                >
                  Continue to Details
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold uppercase tracking-wider border-b border-theme pb-4">
                  {page?.guestSection ?? "Guest Details"}
                </h3>
                {user && (
                  <p className="text-sm text-white/50 -mt-2">
                    Signed in as <span className="text-primary font-medium">{user.name || user.email}</span>
                  </p>
                )}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="surface-input border-theme h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="surface-input border-theme h-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Email Address</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="surface-input border-theme h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Phone Number</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="surface-input border-theme h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 uppercase tracking-widest text-xs font-bold">Notes (optional)</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="surface-input border-theme h-12" />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(v === true)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal text-white/70">
                    I agree to the{" "}
                    <Link href="/terms">
                      <span className="text-primary hover:underline">Terms of Service</span>
                    </Link>
                  </Label>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="w-1/3 border-white/20 text-white hover:bg-white/10 h-14 uppercase font-bold tracking-widest"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={bookingMutation.isPending || updateBookingMutation.isPending || !firstName || !lastName || !email || !phone}
                  className="w-2/3 bg-white text-black hover:bg-gray-200 h-14 uppercase font-black tracking-widest"
                >
                  {(bookingMutation.isPending || updateBookingMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Saving…" : "Submitting…"}
                    </>
                  ) : isEditMode ? (
                    "Save Changes"
                  ) : (
                    "Confirm Rental"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="hidden lg:block w-1/2 relative bg-[#050505]">
        <img src={aboutInteriorImg} alt="" className="absolute inset-0 theme-hero-photo" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
      </div>
    </div>
  );
}
