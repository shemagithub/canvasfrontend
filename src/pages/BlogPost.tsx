import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";
import NotFound from "./not-found";
import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { CmsImage } from "@/components/ui/CmsImage";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";
import { useBlog, useBlogPage, useBlogs } from "@/lib/api";
import { blogCoverImage, blogPostHref, formatBlogDate } from "@/lib/api/blog-ui";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: blogPage } = useBlogPage();
  const page = blogPage?.sections;
  const { data: post, isLoading, isError } = useBlog(slug);
  const { data: allPosts } = useBlogs();

  const cover = useMemo(
    () => (post ? blogCoverImage(post.cover_image_url) : ""),
    [post],
  );
  const date = formatBlogDate(post?.created_at ?? post?.updated_at);
  const relatedPosts = (allPosts ?? []).filter((p) => p.slug !== post?.slug).slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label={page?.loadingLabel ?? "Loading article…"} />
      </div>
    );
  }

  if (isError || !post) {
    return isError ? (
      <div className="min-h-screen surface-page pt-28">
        <PageError />
      </div>
    ) : (
      <NotFound />
    );
  }

  return (
    <div className="min-h-screen surface-page pb-24">
      <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <CmsImage
            src={cover}
            fallback={blogCoverImage(null, 0)}
            alt={post.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 h-full flex flex-col justify-end pb-16">
          <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="max-w-4xl mx-auto w-full">
            <Link href="/blog">
              <div className="inline-flex items-center text-white/50 hover:text-white uppercase tracking-widest text-xs font-bold mb-8 cursor-pointer transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> {page?.backToBlogText ?? "Back to Journal"}
              </div>
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-primary font-bold uppercase tracking-widest text-sm">{post.category}</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-white/50 text-sm uppercase tracking-wider font-bold">
              {date && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> {date}
                </div>
              )}
              {post.author && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> {post.author}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <BlogArticleContent content={post.content} />
        </motion.div>

        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-24 pt-16 border-t border-white/10">
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-8">
              {page?.continueReadingTitle ?? "Continue Reading"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={blogPostHref(related.slug)}>
                  <div className="group surface-panel border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
                    <div className="aspect-[16/9] bg-[#111] overflow-hidden">
                      <CmsImage
                        src={blogCoverImage(related.cover_image_url)}
                        fallback={blogCoverImage(null, 1)}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest">
                        {related.category}
                      </span>
                      <h4 className="text-xl font-bold uppercase mt-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-white/50 text-sm mt-2 line-clamp-2">{related.excerpt}</p>
                      <div className="flex items-center text-sm font-bold uppercase tracking-widest text-white group-hover:text-primary transition-colors mt-4">
                        {page?.readMoreText ?? "Read More"} <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
