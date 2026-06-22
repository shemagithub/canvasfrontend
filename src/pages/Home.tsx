import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowRight, MapPin, CalendarDays, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialsCarousel, type Testimonial } from "@/components/TestimonialsCarousel";
import { PageLoading } from "@/components/ui/PageStatus";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { FADE_UP } from "@/lib/motion";
import { normalizePublicAssetUrl } from "@/lib/api/config";
import { homeFeatureIcon } from "@/lib/api/site-cms";
import { branchLabel } from "@/lib/api/vehicles";
import { useHomePage, useBranches, useTestimonials, useVehicles } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

import heroCarImg from "@/assets/images/hero-car.png";
import team1Img from "@/assets/images/team-1.png";

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

type LocationOption = { id: string; label: string };

function SearchWidget({ locations, searchCta }: { locations: LocationOption[]; searchCta: string }) {
  const [, setLocation] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (pickupLocation) q.set("pickup", pickupLocation);
    if (returnLocation) q.set("return", returnLocation);
    if (pickupDate) q.set("pickupDate", pickupDate);
    const qs = q.toString();
    setLocation(qs ? `/reserve?${qs}` : "/reserve");
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-10 w-full max-w-4xl mx-auto glass-panel backdrop-blur-md border border-theme rounded-xl p-2 flex flex-col md:flex-row gap-2"
      data-testid="form-search-widget"
    >
      {/* Pick-up Location */}
      <div className="flex-1 relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
        <select
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          data-testid="select-pickup-location"
          className="w-full h-14 surface-input pl-11 pr-4 text-sm uppercase tracking-wider appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="" className="text-white/30">Pick-up Location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id} className="bg-[#111] text-white">{loc.label}</option>
          ))}
        </select>
      </div>

      {/* Return Location */}
      <div className="flex-1 relative group">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <select
          value={returnLocation}
          onChange={(e) => setReturnLocation(e.target.value)}
          data-testid="select-return-location"
          className="w-full h-14 surface-input pl-11 pr-4 text-sm uppercase tracking-wider appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer"
        >
          <option value="">Return Location (same)</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id} className="bg-[#111] text-white">{loc.label}</option>
          ))}
        </select>
      </div>

      {/* Pick-up Date */}
      <div className="flex-1 relative group">
        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          data-testid="input-pickup-date"
          className="w-full h-14 surface-input pl-11 pr-4 text-sm uppercase tracking-wider focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Search Button */}
      <Button
        type="submit"
        data-testid="button-search-vehicles"
        className="h-14 px-8 bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest shrink-0 group"
      >
        {searchCta}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.form>
  );
}

export default function Home() {
  const { formatRate } = useCurrency();
  const { data: homeData } = useHomePage();
  const sections = homeData?.sections;
  const { data: vehicles } = useVehicles();
  const { data: branches } = useBranches();
  const { data: testimonialsRaw, isLoading: testimonialsLoading } = useTestimonials();

  const locationOptions = useMemo<LocationOption[]>(() => {
    const pickupBranches = (branches ?? []).filter((b) => b.is_pickup !== false);
    if (pickupBranches.length === 0) return [];
    return pickupBranches.map((b) => ({
      id: b.id,
      label: branchLabel(b),
    }));
  }, [branches]);

  const featured = useMemo(() => (vehicles ?? []).slice(0, 3), [vehicles]);

  const testimonials = useMemo<Testimonial[]>(
    () =>
      (testimonialsRaw ?? []).map((t) => ({
        name: t.name,
        role: "Verified Guest",
        avatar: normalizePublicAssetUrl(t.profile_image_url) || team1Img,
        quote: t.testimonial,
        rating: t.rating,
        location: "",
      })),
    [testimonialsRaw],
  );

  if (!sections) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading…" />
      </div>
    );
  }

  const { hero, standard, fleet: fleetSection, testimonials: testimonialsSection, cta } = sections;

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 theme-hero-shell z-0">
          <img src={heroCarImg} alt="Vehicle ready for a scenic road trip" className="theme-hero-photo" />
          <div className="absolute inset-0 theme-hero-scrim-t" />
          <div className="absolute inset-0 theme-hero-scrim-x" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.h1
              variants={FADE_UP}
              className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 text-white leading-none"
            >
              {hero.titleLine1} <br /><span className="text-primary">{hero.titleLine2}</span>
            </motion.h1>
            <motion.p
              variants={FADE_UP}
              className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto mb-6 font-light"
            >
              {hero.subtitle}
            </motion.p>
            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={hero.primaryLink || "/booking"}>
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 text-lg uppercase font-bold tracking-widest h-14 px-10 w-full sm:w-auto group">
                  {hero.primaryCta}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={hero.secondaryLink || "/fleet"}>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white text-lg uppercase font-bold tracking-widest h-14 px-10 w-full sm:w-auto">
                  {hero.secondaryCta}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <SearchWidget locations={locationOptions} searchCta={hero.searchCta} />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 surface-section-alt">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={FADE_UP} className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight mb-4">
              {standard.titleLine1}{" "}
              <span className="text-primary">{standard.titleLine2}</span>{" "}
              {standard.titleLine3}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">{standard.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {standard.features.map((feature, i) => {
              const Icon = homeFeatureIcon(i);
              return (
              <motion.div
                key={feature.title}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.5 } } }}
                className="surface-card p-8 border rounded-xl hover:border-primary/50 transition-colors group"
              >
                <Icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold uppercase tracking-wider mb-4">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED FLEET */}
      <section className="py-24 surface-section border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
              <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight mb-4">
                {fleetSection.titleLine1} <span className="text-primary">{fleetSection.titleLine2}</span>
              </h2>
              <p className="text-white/50 max-w-xl">{fleetSection.subtitle}</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="hidden md:block">
              <Link href="/fleet">
                <Button variant="link" className="text-primary hover:text-white uppercase font-bold tracking-widest px-0">
                  {fleetSection.linkText} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <VehicleGrid
            vehicles={featured}
            formatRate={formatRate}
            detailsLabel={fleetSection.detailsButton ?? "Details"}
            reserveLabel={fleetSection.reserveButton ?? "Reserve"}
            emptyMessage="Featured vehicles will appear here once loaded."
            animateOnScroll
          />

          <div className="mt-8 md:hidden text-center">
            <Link href="/fleet">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black uppercase font-bold tracking-widest w-full">
                {fleetSection.linkText}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 surface-section-alt relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={FADE_UP} className="text-center mb-16"
          >
            <div className="flex justify-center mb-4">
              <StarRating count={5} />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight mb-4">
              {testimonialsSection.titleLine1} <span className="text-primary">{testimonialsSection.titleLine2}</span>
            </h2>
            <p className="text-theme-muted max-w-xl mx-auto">
              {testimonialsSection.subtitle}
            </p>
          </motion.div>

          {testimonialsLoading ? (
            <PageLoading label="Loading reviews…" />
          ) : testimonials.length > 0 ? (
            <TestimonialsCarousel testimonials={testimonials} />
          ) : (
            <p className="text-center text-theme-muted py-8">Reviews will appear here once published.</p>
          )}

          {/* Aggregate rating badge */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={FADE_UP}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-theme">4.9</span>
              <span className="text-theme-muted text-sm uppercase tracking-widest">/ 5.0</span>
            </div>
            <div className="text-left">
              <StarRating count={5} />
              <p className="text-theme-muted text-xs uppercase tracking-widest mt-1">{testimonialsSection.ratingLabel}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 bg-[#e31c1c] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] theme-texture-pattern pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black mb-6">
              {cta.title}
            </h2>
            <p className="text-black/80 text-lg md:text-2xl max-w-2xl mx-auto mb-10 font-medium">
              {cta.subtitle}
            </p>
            <Link href={cta.buttonLink || "/booking"}>
              <Button size="lg" className="bg-black text-white hover:bg-black/80 text-lg uppercase font-bold tracking-widest h-16 px-12 group shadow-2xl">
                {cta.buttonText}
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
