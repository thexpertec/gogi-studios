import { useParams, Link } from "wouter";
import { PageTransition } from "@/components/layout/PageTransition";
import { blogPosts } from "@/lib/data";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";
import NotFound from "@/pages/not-found";

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) return <NotFound />;

  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Journal
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-12">
          {post.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-1 bg-primary rounded-full mb-10" />

        {/* Body */}
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-foreground/85 leading-relaxed text-lg mb-6 last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to all articles
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
