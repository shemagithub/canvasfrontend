import { motion } from "framer-motion";
import { PageError, PageLoading } from "@/components/ui/PageStatus";
import { BlogArticleContent } from "@/components/blog/BlogArticleContent";
import { useTermsPage } from "@/lib/api";
import { FADE_UP_SM as FADE_UP } from "@/lib/motion";

export default function Terms() {
  const { data, isLoading, isError, error } = useTermsPage();
  const page = data?.page;
  const html = data?.html;

  if (isLoading) {
    return (
      <div className="min-h-screen surface-page pt-28">
        <PageLoading label="Loading terms…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen surface-page pt-28 px-4">
        <PageError message={error instanceof Error ? error.message : undefined} />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-page pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="mb-12">
          <div className="w-12 h-1 bg-primary mb-8" />
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 text-theme">
            {page?.title || "Terms & Conditions"}
          </h1>
        </motion.div>
        {html ? (
          <BlogArticleContent content={html} />
        ) : (
          <p className="text-theme-muted">Terms content has not been published yet.</p>
        )}
      </div>
    </div>
  );
}
