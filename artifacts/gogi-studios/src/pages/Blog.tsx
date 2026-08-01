import { PageTransition } from "@/components/layout/PageTransition";
import { blogPosts } from "@/lib/data";
import { Editable } from "@/components/ui/Editable";
import { Link } from "wouter";

export default function Blog() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="blog-page-title">Journal & News</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="blog-page-desc">
              The latest updates, event recaps, and thoughts from Gogi Studios.
            </Editable>
          </p>
        </header>

        <div className="space-y-12">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-card border border-border p-8 md:p-10 rounded-2xl hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                      <Editable id={`blog-${post.id}-category`}>{post.category}</Editable>
                    </span>
                    <time className="text-sm font-medium text-muted-foreground">
                      <Editable id={`blog-${post.id}-date`}>{post.date}</Editable>
                    </time>
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-4 group-hover:text-primary transition-colors">
                    <Editable id={`blog-${post.id}-title`}>{post.title}</Editable>
                  </h2>
                  <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                    <Editable id={`blog-${post.id}-excerpt`}>{post.excerpt}</Editable>
                  </p>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-primary font-medium hover:underline inline-flex items-center gap-2"
                  >
                    Read Full Article <span className="text-xl leading-none">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
