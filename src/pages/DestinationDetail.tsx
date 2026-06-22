import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Calendar, Check, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import { useDestination } from "@/lib/api";
import { destinationBookingNewHref } from "@/lib/api/bookings-ui";
import { destinationVideoEmbed } from "@/lib/api/destination-video";
import { mapDestination } from "@/lib/api/destinations-ui";

import aboutHeroImg from "@/assets/images/about-hero.png";

export default function DestinationDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug?.trim() || "";
  const { data: raw, isLoading, isError, error } = useDestination(slug);
  const destination = raw ? mapDestination(raw) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading destination…" />
      </div>
    );
  }

  if (isError || !destination) {
    return (
      <div className="min-h-screen surface-page flex flex-col items-center justify-center pt-28 gap-6 px-4">
        <PageError message={error instanceof Error ? error.message : "Destination not found"} />
        <Link href="/destinations">
          <Button className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest">
            Back to Destinations
          </Button>
        </Link>
      </div>
    );
  }

  const bookHref = destinationBookingNewHref(destination.slug || destination.id);
  const videoEmbed = destinationVideoEmbed(destination.video_url);

  return (
    <div className="min-h-screen surface-page pt-20 pb-24">
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <Link href="/destinations">
          <Button variant="ghost" className="text-white/70 hover:text-white gap-2">
            <ArrowLeft size={18} />
            Back to Destinations
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative overflow-hidden rounded-2xl surface-raised aspect-[16/10]">
                <CmsImage
                  src={destination.cover_image_url ?? undefined}
                  fallback={aboutHeroImg}
                  alt={destination.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 destination-card-scrim pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 image-overlay-text">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                    {destination.location || "Rwanda"}
                  </p>
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
                    {destination.title}
                  </h1>
                </div>
              </div>

              {videoEmbed ? (
                <section className="surface-panel border rounded-2xl p-4 md:p-6 overflow-hidden">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4 text-white px-2 md:px-0">
                    <span className="text-primary">Package</span> video
                  </h2>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                    {videoEmbed.kind === "iframe" ? (
                      <iframe
                        src={videoEmbed.src}
                        title={`${destination.title} video`}
                        className="absolute inset-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoEmbed.src}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                </section>
              ) : null}

              <section className="surface-panel border rounded-2xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4 text-white">
                  <span className="text-primary">About</span> this package
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {destination.description || "Package details will be shared when you enquire."}
                </p>
              </section>

              {destination.highlights?.length > 0 ? (
                <section className="surface-panel border rounded-2xl p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-6 text-white">
                    <span className="text-primary">Package</span> highlights
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {destination.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 rounded-lg border border-theme px-4 py-3 text-sm text-white/80"
                      >
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="lg:col-span-1">
              <div className="surface-panel border rounded-2xl p-6 md:p-8 sticky top-28 space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                    From
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-primary">{destination.priceLabel}</p>
                </div>

                <dl className="space-y-4">
                  {destination.location ? (
                    <div className="flex items-start gap-3 border-b border-theme pb-4">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Location
                        </dt>
                        <dd className="text-sm font-semibold text-white">{destination.location}</dd>
                      </div>
                    </div>
                  ) : null}
                  {destination.duration ? (
                    <div className="flex items-start gap-3 border-b border-theme pb-4">
                      <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                          Duration
                        </dt>
                        <dd className="text-sm font-semibold text-white">{destination.duration}</dd>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
                        Group size
                      </dt>
                      <dd className="text-sm font-semibold text-white">Flexible — set when you book</dd>
                    </div>
                  </div>
                </dl>

                {destination.bookable ? (
                  <Link href={bookHref}>
                    <Button className="w-full bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest h-12">
                      Book package
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest h-12"
                    >
                      Request quote
                    </Button>
                  </Link>
                )}

                <p className="text-[11px] text-white/40 leading-relaxed">
                  Secure your dates online. Our team confirms availability and sends trip details by email.
                </p>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
