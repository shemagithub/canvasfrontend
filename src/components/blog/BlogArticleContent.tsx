import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { isBlogHtmlContent, resolveBlogContentHtml } from "@/lib/api/blog-ui";

type BlogArticleContentProps = {
  content?: string;
  className?: string;
};

const PROSE =
  "prose prose-lg md:prose-xl max-w-3xl mx-auto dark:prose-invert " +
  "prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight " +
  "prose-headings:text-[var(--text-primary)] " +
  "prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 " +
  "prose-p:text-[var(--text-muted)] prose-p:leading-relaxed prose-p:font-light " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-strong:text-[var(--text-primary)] prose-em:text-[var(--text-muted)] " +
  "prose-li:text-[var(--text-muted)] " +
  "prose-blockquote:border-l-primary prose-blockquote:bg-[var(--surface-card)] prose-blockquote:p-6 " +
  "prose-img:rounded-xl prose-img:border prose-img:border-theme prose-img:my-8 prose-img:w-full prose-img:max-w-full prose-img:h-auto prose-img:opacity-100 prose-img:saturate-100 " +
  "prose-figure:my-8 prose-figcaption:text-[var(--text-muted)] prose-figcaption:text-sm";

export function BlogArticleContent({ content, className }: BlogArticleContentProps) {
  const resolved = useMemo(() => resolveBlogContentHtml(content ?? ""), [content]);
  const isHtml = isBlogHtmlContent(resolved);

  if (!resolved.trim()) {
    return null;
  }

  if (isHtml) {
    return (
      <article
        className={cn("cms-article", PROSE, className)}
        dangerouslySetInnerHTML={{ __html: resolved }}
      />
    );
  }

  return (
    <article className={cn("cms-article", PROSE, className)}>
      {resolved
        .split(/\n\n+/)
        .filter(Boolean)
        .map((para, i) => (
          <p key={i}>{para}</p>
        ))}
    </article>
  );
}
