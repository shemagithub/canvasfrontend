import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import { useDestinations, useDestinationsPage } from "@/lib/api";
import { destinationDetailHref, buildHeroSlideshowUrls, destinationsGridSubtitle, mapDestinations, type DestinationDisplay } from "@/lib/api/destinations-ui";
import { HeroSlideshow } from "@/components/destinations/HeroSlideshow";

import aboutHeroImg from "@/assets/images/about-hero.png";

function DestinationCard({ destination }: { destination: DestinationDisplay }) {
  return (
    <article className="group surface-panel border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-raised)]">
        <CmsImage
          src={destination.cover_image_url ?? undefined}
          fallback={aboutHeroImg}
          alt={destination.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 destination-card-scrim pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 image-overlay-text">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">{destination.location}</p>
          <h3 className="text-lg md:text-xl font-bold uppercase tracking-tight">{destination.title}</h3>
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-1">
        <p className="text-white/55 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{destination.description}</p>
        {destination.duration ? (
          <p className="text-xs uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> {destination.duration}
          </p>
        ) : null}
        {destination.highlights?.length > 0 && (
          <ul className="space-y-1.5 mb-6">
            {destination.highlights.slice(0, 4).map((h) => (
              <li key={h} className="text-xs text-white/50 flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-theme mt-auto gap-3">
          <span className="text-theme font-bold text-sm md:text-base">{destination.priceLabel}</span>
          {destination.bookable ? (
            <Link href={destinationDetailHref(destination.slug || destination.id)}>
              <Button
                type="button"
                className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest text-xs"
              >
                Book package
              </Button>
            </Link>
          ) : (
            <Link href={destinationDetailHref(destination.slug || destination.id)}>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest text-xs"
              >
                View package
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Destinations() {
  const [, setLocation] = useLocation();
  const { data: pageData, isLoading: pageLoading, isError: pageError, error: pageLoadError } = useDestinationsPage();
  const {
    data: destinationsRaw,
    isLoading: packagesLoading,
    isError: packagesError,
    error: packagesLoadError,
    refetch: refetchPackages,
    isFetching: packagesFetching,
  } = useDestinations();

  const editId =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("edit")?.trim() || "" : "";

  useEffect(() => {
    if (editId) {
      setLocation(`/booking?edit=${encodeURIComponent(editId)}`);
    }
  }, [editId, setLocation]);

  const sections = pageData?.sections;
  const destinations = useMemo(() => mapDestinations(destinationsRaw), [destinationsRaw]);
  const fromApi = (destinationsRaw?.length ?? 0) > 0;
  const gridSubtitle = useMemo(
    () => (sections ? destinationsGridSubtitle(sections.grid, destinations.length) : ""),
    [sections, destinations.length],
  );
  const heroSlides = useMemo(
    () => buildHeroSlideshowUrls(sections?.hero, destinationsRaw ?? [], aboutHeroImg),
    [sections?.hero, destinationsRaw],
  );

  if (editId) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Opening booking…" />
      </div>
    );
  }

  if (pageLoading && !sections) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading destinations…" />
      </div>
    );
  }

  if (pageError || !sections) {
    return (
      <div className="min-h-screen surface-page pt-28 px-4">
        <PageError message={pageLoadError instanceof Error ? pageLoadError.message : undefined} />
      </div>
    );
  }

  const { hero, grid, cta } = sections;

  return (
    <div className="w-full surface-page overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        <HeroSlideshow images={heroSlides} intervalSeconds={hero.slideshowSeconds ?? 6} />
        <div className="relative z-20 container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <p className="inline-block mb-4 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-primary text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-sm">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-6">
            {hero.titleLine1}{" "}
            <span className="text-primary">{hero.titleLine2}</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-10">{hero.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={hero.primaryButtonLink}>
              <Button className="bg-white text-black hover:bg-white/90 uppercase font-bold tracking-widest h-12 px-8 rounded-full">
                {hero.primaryButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href={hero.secondaryButtonLink}>
              <Button variant="ghost" className="text-white hover:bg-white/10 uppercase font-bold tracking-widest h-12 px-8 rounded-full">
                {hero.secondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
        <a
          href="#packages"
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm hover:text-white hover:border-white/40 transition-colors"
        >
          Scroll ↓
        </a>
      </section>

      <section id="packages" className="py-20 md:py-28 container mx-auto px-4 md:px-8">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            {grid.headingLine1} <span className="text-primary">{grid.headingLine2}</span>
          </h2>
          <p className="text-white/50">{gridSubtitle}</p>
          {fromApi && !packagesFetching ? (
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
              {destinations.length} package{destinations.length === 1 ? "" : "s"} from admin
            </p>
          ) : null}
        </div>

        {packagesLoading ? (
          <PageLoading label="Loading packages from server…" />
        ) : packagesError ? (
          <div className="max-w-lg mx-auto text-center space-y-4">
            <PageError message={packagesLoadError instanceof Error ? packagesLoadError.message : undefined} />
            <Button
              type="button"
              variant="outline"
              onClick={() => refetchPackages()}
              className="border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        ) : destinations.length === 0 ? (
          <div className="max-w-xl mx-auto text-center surface-panel border rounded-xl p-10 md:p-12">
            <p className="text-white/60 mb-6">{grid.subtitleFallback}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest">
                  Contact us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetchPackages()}
                className="border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh packages
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {destinations.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        )}
      </section>

      <section className="py-20 border-t border-theme">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">{cta.title}</h2>
          <p className="text-white/50 mb-8">{cta.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={cta.primaryButtonLink}>
              <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest h-12 px-10">
                {cta.primaryButtonText} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={cta.secondaryButtonLink}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest h-12 px-10">
                {cta.secondaryButtonText}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
