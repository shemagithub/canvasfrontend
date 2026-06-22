import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import { MapPin, Star } from "lucide-react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
  location: string;
};

function ProfileAvatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleError = (_e: SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
  };

  return (
    <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all bg-[var(--surface-raised)]">
      {failed ? (
        <span className="absolute inset-0 flex items-center justify-center text-primary text-xs font-bold uppercase">
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={handleError}
        />
      )}
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <article
      className={cn(
        "group relative surface-card border rounded-2xl transition-all duration-300",
        "p-6 md:p-8 flex flex-col gap-5 h-full min-h-[260px]",
        "hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(227,30,36,0.08)]",
      )}
      data-testid={`card-testimonial-${index}`}
    >
      <span
        className="absolute top-4 right-5 text-5xl font-serif leading-none text-primary/15 select-none pointer-events-none"
        aria-hidden
      >
        &ldquo;
      </span>
      <StarRating count={t.rating} />
      <blockquote className="text-theme text-base md:text-lg leading-relaxed font-light flex-1 relative z-[1]">
        {t.quote}
      </blockquote>
      <div className="flex items-center justify-between pt-4 border-t border-theme gap-4 relative z-[1]">
        <div className="flex items-center gap-3 min-w-0">
          <ProfileAvatar src={t.avatar} name={t.name} />
          <div className="min-w-0">
            <p className="font-bold uppercase tracking-wider text-sm text-theme truncate">{t.name}</p>
            <p className="text-theme-muted text-xs uppercase tracking-widest mt-1 truncate">{t.role}</p>
          </div>
        </div>
        {t.location ? (
          <div className="flex items-center text-theme-muted text-xs uppercase tracking-widest gap-1 shrink-0">
            <MapPin className="w-3 h-3 text-primary" />
            {t.location}
          </div>
        ) : null}
      </div>
    </article>
  );
}

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || snapCount <= 1) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api, snapCount]);

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {testimonials.map((t, i) => (
            <CarouselItem
              key={`${t.name}-${i}`}
              className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <TestimonialCard t={t} index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {snapCount > 1 && (
        <div
          className="flex justify-center gap-2 mt-8"
          role="tablist"
          aria-label="Testimonial slides"
        >
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={activeIndex === i}
              aria-label={`Go to review slide ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === i
                  ? "w-8 bg-primary"
                  : "w-2 bg-[var(--surface-border)] hover:bg-primary/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
