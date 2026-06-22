import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { useServiceCards, useServicesPage } from "@/lib/api";
import {
  mapServiceCards,
  serviceTickerItems,
  type ServiceDisplay,
} from "@/lib/api/services-ui";
import { serviceFeatureIcon, type ServiceProcessStep } from "@/lib/api/services-cms";
import { useCurrency } from "@/context/CurrencyContext";

function InfiniteMarquee({ items, direction = 1, speed = 30 }: { items: string[]; direction?: number; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-12 items-center"
        animate={{ x: direction > 0 ? [0, "-50%"] : ["-50%", 0] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.25em]">
            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ServiceCard({ service, index }: { service: ServiceDisplay; index: number }) {
  const { formatRate } = useCurrency();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isEven = index % 2 === 0;

  const priceLabel =
    service.priceAmountRwf != null
      ? `From ${formatRate(service.priceAmountRwf, service.priceSuffix)}`
      : service.price;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -60 : 60, scale: 0.96 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="group relative surface-panel border rounded-xl hover:border-primary/40 transition-all duration-500 p-8 md:p-10 overflow-hidden"
      data-testid={`card-service-${index}`}
    >
      {/* Flowing gradient background on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(227,28,28,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Animated corner accent */}
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[3px] border-r-[3px] border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-12 group-hover:h-12" />
      <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[3px] border-l-[3px] border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-12 group-hover:h-12" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 surface-input border rounded-lg flex items-center justify-center group-hover:border-primary/50 transition-colors duration-300">
            <service.icon className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary/80 border border-primary/20 px-3 py-1 bg-primary/5">
            {service.tag}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-white/55 leading-relaxed mb-6 text-sm md:text-base">
          {service.desc}
        </p>

        {service.features.length > 0 && (
          <ul className="space-y-2 mb-8">
            {service.features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/50">
                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-theme">
          <span className="text-theme font-bold">{priceLabel}</span>
          <Link href="/reserve">
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40 group-hover:text-primary transition-colors duration-300">
              Reserve <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

type ProcessStepItem = ServiceProcessStep;

function ProcessStep({ step, index, total }: { step: ProcessStepItem; index: number; total: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* Number */}
      <div className="relative mb-6">
        <div className="w-20 h-20 border border-white/10 rounded-xl group-hover:border-primary/60 transition-colors duration-500 flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500"
          />
          <span className="text-2xl font-black text-primary relative z-10">{step.num}</span>
        </div>
        {/* Connector line */}
        {index < total - 1 && (
          <div className="hidden md:block absolute top-1/2 left-[calc(100%+1px)] w-[calc(100vw/4-5rem)] h-px bg-white/10">
            <motion.div
              className="h-full bg-primary origin-left"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.18 + 0.4 }}
            />
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold uppercase tracking-wider mb-3">{step.title}</h3>
      <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">{step.desc}</p>
    </motion.div>
  );
}

export default function Services() {
  const { data: pageData, isLoading: pageLoading, isError: pageError, error: pageLoadError } = useServicesPage();
  const { data: serviceCards, isLoading, isError, error } = useServiceCards();
  const sections = pageData?.sections;
  const services = useMemo(() => mapServiceCards(serviceCards ?? []), [serviceCards]);
  const tickerItems = useMemo(() => serviceTickerItems(services), [services]);
  const fromApi = (serviceCards?.length ?? 0) > 0;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const springY = useSpring(heroY, { stiffness: 60, damping: 20 });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  if (pageLoading && !sections) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading services page…" />
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

  const { hero, grid, stats, process, features, cta } = sections;

  return (
    <div className="w-full surface-page overflow-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: springY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div
            className="w-full h-full"
            style={{
              background: "radial-gradient(ellipse at 30% 60%, rgba(227,28,28,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(227,28,28,0.08) 0%, transparent 45%), #0a0a0a",
            }}
          />
        </motion.div>

        {/* Floating lines decoration */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-white/[0.03]"
            style={{ top: `${15 + i * 18}%` }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 12 + i * 3, ease: "linear", repeat: Infinity, delay: i * 1.5 }}
          />
        ))}

        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-6 block">
              {hero.eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 leading-none"
          >
            {hero.titleLine1} <span className="text-primary">{hero.titleLine2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto mb-10 font-light"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link href={hero.primaryButtonLink || "/fleet"}>
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90 uppercase font-bold tracking-widest h-14 px-10 group">
                {hero.primaryButtonText} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={hero.secondaryButtonLink || "/contact"}>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 uppercase font-bold tracking-widest h-14 px-10">
                {hero.secondaryButtonText}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── TICKER STRIP 1 ──────────────────────────────────────── */}
      <div className="py-5 bg-primary overflow-hidden">
        <InfiniteMarquee items={tickerItems} direction={1} speed={25} />
      </div>

      {/* ─── STATS ───────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 surface-section-alt border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={`${stat.label}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-xs uppercase tracking-widest text-primary font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES GRID ───────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-1 bg-primary mx-auto mb-8" />
              <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight mb-4">
                {grid.headingLine1} <span className="text-primary">{grid.headingLine2}</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                {fromApi
                  ? `${services.length} service${services.length === 1 ? "" : "s"} from our live catalog — each tailored for a different kind of journey.`
                  : grid.subtitleFallback}
              </p>
            </motion.div>
          </div>

          {isLoading && <PageLoading label="Loading services…" />}
          {isError && (
            <PageError message={error instanceof Error ? error.message : undefined} />
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── TICKER STRIP 2 (reverse) ────────────────────────────── */}
      <div className="py-4 bg-[#111] border-y border-white/5 overflow-hidden">
        <InfiniteMarquee items={tickerItems} direction={-1} speed={35} />
      </div>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 surface-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="w-12 h-1 bg-primary mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight">
              {process.headingLine1} <span className="text-primary">{process.headingLine2}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
            {process.steps.map((step, i) => (
              <ProcessStep key={`${step.num}-${step.title}`} step={step} index={i} total={process.steps.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FULL-WIDTH FEATURE BAND ─────────────────────────────── */}
      <section className="py-20 surface-section-alt border-y border-white/5 overflow-hidden relative">
        {/* Parallax flowing glow */}
        <motion.div
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"
        />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.items.map((item, i) => {
              const Icon = serviceFeatureIcon(item.icon);
              return (
              <motion.div
                key={`${item.title}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="flex gap-5 items-start group"
              >
                <motion.div className="w-12 h-12 shrink-0 border border-white/10 rounded-lg group-hover:border-primary/50 transition-colors flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] theme-texture-pattern" />
        {/* Flowing animated lines */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-black/10"
            style={{ top: `${20 + i * 22}%` }}
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 6 + i * 2, ease: "linear", repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black mb-6">
              {cta.title}
            </h2>
            <p className="text-black/70 text-lg md:text-xl max-w-xl mx-auto mb-10">
              {cta.subtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href={cta.primaryButtonLink || "/reserve"}>
                <Button size="lg" className="bg-black text-white hover:bg-black/80 uppercase font-bold tracking-widest h-16 px-12 group shadow-2xl">
                  {cta.primaryButtonText} <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href={cta.secondaryButtonLink || "/contact"}>
                <Button size="lg" className="bg-transparent border-2 border-black text-black hover:bg-black/10 uppercase font-bold tracking-widest h-16 px-12">
                  {cta.secondaryButtonText}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
