import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import {
  aboutValueIcon,
  resolveAboutImageUrl,
  resolveTeamPhotoUrl,
  useAboutPage,
  useTeam,
} from "@/lib/api";

import aboutHeroImg from "@/assets/images/about-hero.png";
import aboutWorkshopImg from "@/assets/images/about-workshop.png";
import team1Img from "@/assets/images/team-1.png";
import team2Img from "@/assets/images/team-2.png";
import team3Img from "@/assets/images/team-3.png";
import team4Img from "@/assets/images/team-4.png";
import { FADE_UP_SLOW as FADE_UP, STAGGER } from "@/lib/motion";

const TEAM_PHOTO_FALLBACKS = [team1Img, team2Img, team3Img, team4Img];

type TeamMemberCard = {
  img: string;
  name: string;
  role: string;
  quote: string;
};

export default function About() {
  const { data: aboutData, isLoading: aboutLoading, isError: aboutError, error } = useAboutPage();
  const {
    data: teamApi,
    isLoading: teamLoading,
    isError: teamError,
    error: teamFetchError,
  } = useTeam();

  const sections = aboutData?.sections;

  const heroImage = resolveAboutImageUrl(sections?.hero.imagePath) ?? aboutHeroImg;
  const workshopImage = resolveAboutImageUrl(sections?.workshop.imagePath) ?? aboutWorkshopImg;

  const team = useMemo<TeamMemberCard[]>(() => {
    return (teamApi ?? []).map((m, i) => ({
      img: resolveTeamPhotoUrl(m.photo_url) ?? TEAM_PHOTO_FALLBACKS[i % TEAM_PHOTO_FALLBACKS.length],
      name: m.full_name,
      role: m.role || "Team",
      quote: m.bio || "",
    }));
  }, [teamApi]);

  if (aboutLoading && !sections) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading about page…" />
      </div>
    );
  }

  if (aboutError || !sections) {
    return (
      <div className="min-h-screen surface-page pt-28 px-4">
        <PageError message={error instanceof Error ? error.message : undefined} />
      </div>
    );
  }

  const { hero, genesis, workshop, timeline, team: teamSection, values, cta } = sections;

  return (
    <div className="w-full surface-page overflow-hidden">
      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0 theme-hero-shell">
          <CmsImage
            src={heroImage}
            fallback={aboutHeroImg}
            alt=""
            className="theme-hero-photo"
          />
          <div className="absolute inset-0 theme-hero-scrim-t" />
          <div className="absolute inset-0 theme-hero-scrim-b" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={STAGGER}>
            <motion.h1
              variants={FADE_UP}
              className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 text-white"
            >
              {hero.titleLine1}{" "}
              <span className="text-primary block mt-2">{hero.titleLine2}</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto font-light">
              {hero.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Genesis */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={FADE_UP}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="w-12 h-1 bg-primary mx-auto mb-10" />
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-8">
              {genesis.heading}{" "}
              <span className="italic">{genesis.headingHighlight}</span>
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-white/60 leading-relaxed font-light">
              {genesis.paragraphs.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workshop */}
      <section className="py-24 surface-section-alt border-y border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              className="order-2 lg:order-1 space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight">
                {workshop.titleLine1}{" "}
                <span className="text-primary">{workshop.titleLine2}</span>
              </h2>
              <div className="space-y-6 text-white/60 text-lg leading-relaxed">
                {workshop.paragraphs.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
              <div className="pt-8 border-t border-theme flex gap-12">
                <div>
                  <p className="text-4xl font-black text-white mb-2">{workshop.stat1Value}</p>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-bold">{workshop.stat1Label}</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white mb-2">{workshop.stat2Value}</p>
                  <p className="text-xs uppercase tracking-widest text-white/50 font-bold">{workshop.stat2Label}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 aspect-[4/3] relative overflow-hidden surface-raised rounded-xl"
            >
              <CmsImage
                src={workshopImage}
                fallback={aboutWorkshopImg}
                alt=""
                className="theme-editorial-photo"
              />
              <div className="absolute inset-0 border border-white/10 rounded-lg m-6 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">
              {timeline.heading}{" "}
              <span className="text-primary italic">{timeline.headingHighlight}</span>
            </h2>
          </motion.div>

          <div className="space-y-16 relative">
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />

            {timeline.items.map((item, i) => (
              <motion.div
                key={`${item.year}-${item.title}-${i}`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={FADE_UP}
                className={`flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center relative ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-0 md:left-1/2 w-14 h-14 bg-black border-2 border-primary rounded-full flex items-center justify-center md:-translate-x-1/2 z-10">
                  <span className="text-primary font-bold text-sm">{item.year.slice(2)}</span>
                </div>
                <div className={`pl-20 md:pl-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <h3 className="text-2xl font-bold uppercase mb-4">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team (members from Team admin; headings from CMS) */}
      <section className="py-24 md:py-32 surface-section">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="text-center mb-20"
          >
            <div className="w-12 h-1 bg-primary mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-bold uppercase italic tracking-tight">
              {teamSection.titleLine1}{" "}
              <span className="text-primary">{teamSection.titleLine2}</span>
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">{teamSection.subtitle}</p>
          </motion.div>

          {teamLoading ? (
            <PageLoading label="Loading team…" />
          ) : teamError ? (
            <PageError
              message={teamFetchError instanceof Error ? teamFetchError.message : "Could not load team members."}
            />
          ) : team.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={`${member.name}-${i}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex flex-col items-center text-center group"
                  data-testid={`card-team-${i}`}
                >
                  <div className="relative w-44 h-52 md:w-48 md:h-56 mb-6 overflow-hidden rounded-[50%]">
                    <CmsImage
                      src={member.img}
                      fallback={TEAM_PHOTO_FALLBACKS[i % TEAM_PHOTO_FALLBACKS.length]}
                      alt={member.name}
                      className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)",
                      }}
                    />
                  </div>

                  <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary text-xs uppercase tracking-widest font-bold mb-3">{member.role}</p>
                  {member.quote && (
                    <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">{member.quote}</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-6">
              {values.heading}{" "}
              <span className="text-primary italic">{values.headingHighlight}</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">{values.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.items.map((value, i) => {
              const Icon = aboutValueIcon(value.icon);
              return (
                <motion.div
                  key={`${value.title}-${i}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.6 } },
                  }}
                  className="surface-panel p-10 border rounded-xl hover:border-primary/30 transition-colors group text-left"
                >
                  <Icon className="w-10 h-10 text-primary mb-8 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-4">{value.title}</h3>
                  <p className="text-white/50 leading-relaxed">{value.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] theme-texture-pattern" />
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-black mb-8">
              {cta.title}
            </h2>
            <Link href={cta.buttonLink || "/fleet"}>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/80 text-lg uppercase font-bold tracking-widest h-16 px-12 group shadow-2xl"
              >
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
