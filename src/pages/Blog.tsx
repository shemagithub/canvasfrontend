import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useBlogPage, useBlogs } from "@/lib/api";
import { blogCoverImage, blogPostHref, formatBlogDate } from "@/lib/api/blog-ui";
import type { PublicBlogPost } from "@/lib/api/types";

type BlogCard = PublicBlogPost & { image: string; date: string };

export default function Blog() {
  const { data: blogPage } = useBlogPage();
  const page = blogPage?.sections;
  const { data: posts, isLoading, isError, error } = useBlogs();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const cards = useMemo<BlogCard[]>(
    () =>
      (posts ?? []).map((p, i) => ({
        ...p,
        image: blogCoverImage(p.cover_image_url, i),
        date: formatBlogDate(p.created_at ?? p.updated_at),
      })),
    [posts],
  );

  const categories = useMemo(() => {
    const cats = new Set(cards.map((p) => p.category ?? "General"));
    return ["All", ...Array.from(cats).sort()];
  }, [cards]);

  const filtered = cards.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      (post.excerpt ?? "").toLowerCase().includes(q) ||
      (post.category ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={FADE_UP}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
            {page?.title ?? "The"}{" "}
            <span className="text-primary">{page?.titleAccent ?? "Apex Journal"}</span>
          </h1>
          <p className="text-xl text-white/60 font-light max-w-2xl">
            {page?.subtitle ?? "Thoughts, stories, and travel inspiration from the road."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12 flex flex-col md:flex-row gap-4 items-start md:items-center"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={page?.searchPlaceholder ?? "Search articles…"}
              data-testid="input-blog-search"
              className="w-full h-12 surface-input border rounded-lg pl-11 pr-10 text-white placeholder:text-white/30 text-sm uppercase tracking-wider focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                data-testid="button-clear-search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-filter-${cat.toLowerCase()}`}
                className={`h-12 px-5 text-xs font-bold uppercase tracking-widest border transition-colors rounded-lg ${
                  activeCategory === cat
                    ? "bg-primary text-black border-primary"
                    : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {isLoading && <PageLoading label={page?.loadingLabel ?? "Loading articles…"} />}
        {isError && <PageError message={error instanceof Error ? error.message : undefined} />}

        {!isLoading && !isError && (
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-24 text-center border border-white/5 rounded-xl"
              >
                <p className="text-white/30 text-xl uppercase tracking-widest font-bold">
                  {page?.emptyMessage ?? "No articles found"}
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 text-primary text-sm uppercase tracking-widest font-bold hover:underline"
                >
                  {page?.clearFiltersText ?? "Clear filters"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {featured && (
                  <div className="mb-16 md:mb-24">
                    <Link href={blogPostHref(featured.slug)}>
                      <div className="group cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-0 surface-panel border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                        <div className="aspect-[4/3] lg:aspect-auto relative overflow-hidden bg-[var(--surface-raised)]">
                          <CmsImage
                            src={featured.image}
                            fallback={blogCoverImage(null, 0)}
                            alt={featured.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none rounded-full" />
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-primary font-bold uppercase tracking-widest text-xs">
                              {featured.category}
                            </span>
                            {featured.date && (
                              <>
                                <span className="w-1 h-1 bg-white/30 rounded-full" />
                                <div className="flex items-center text-white/50 text-xs uppercase tracking-wider">
                                  <Clock className="w-3 h-3 mr-2" />
                                  {featured.date}
                                </div>
                              </>
                            )}
                          </div>
                          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-6 group-hover:text-primary transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-white/60 text-lg leading-relaxed mb-8">{featured.excerpt}</p>
                          <div className="flex items-center text-sm font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors mt-auto">
                            {page?.readArticleText ?? "Read Article"}{" "}
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {rest.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {rest.map((post, i) => (
                      <motion.div
                        key={post.slug}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } },
                        }}
                      >
                        <Link href={blogPostHref(post.slug)}>
                          <div className="group cursor-pointer surface-panel border rounded-xl overflow-hidden hover:border-primary/30 transition-colors h-full flex flex-col">
                            <div className="aspect-[16/9] relative overflow-hidden bg-[var(--surface-raised)]">
                              <CmsImage
                                src={post.image}
                                fallback={blogCoverImage(null, i + 1)}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                              <div className="flex items-center gap-4 mb-4">
                                <span className="text-primary font-bold uppercase tracking-widest text-xs">
                                  {post.category}
                                </span>
                                {post.date && (
                                  <>
                                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                                    <div className="flex items-center text-white/50 text-xs uppercase tracking-wider">
                                      <Clock className="w-3 h-3 mr-2" />
                                      {post.date}
                                    </div>
                                  </>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-white/60 leading-relaxed mb-8 flex-grow">{post.excerpt}</p>
                              <div className="flex items-center text-sm font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors mt-auto">
                                {page?.readArticleText ?? "Read Article"}{" "}
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
