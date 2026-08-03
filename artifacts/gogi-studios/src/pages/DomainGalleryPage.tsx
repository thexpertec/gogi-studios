/**
 * Generic CMS-driven gallery page used by Services, Awards, News, Books, and Shop.
 * Fetches sections + gallery items for a given domain and renders them in a masonry grid,
 * grouped by section and sub-category — the same pattern as WorkGalleryPage.
 */
import { useState, useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ImageIcon } from "lucide-react";
import type { WorkSection, SubCategory } from "@/lib/workSections";
import { buildTreeOrder } from "@/lib/workSections";

interface GalleryItem {
  id: string;
  caption: string;
  subCategorySlug?: string | null;
  mediaType?: string | null;
  videoUrl?: string | null;
}

/** Convert YouTube / Vimeo / direct URL to embeddable form */
function toEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { type: "video", src: url };
  return null;
}

interface Props {
  domain: string;
  pageTitle: string;
  pageLabel?: string;
  pageDescription?: string;
  emptyMessage?: string;
}

export default function DomainGalleryPage({
  domain,
  pageTitle,
  pageLabel,
  pageDescription,
  emptyMessage = "Content for this section will appear here once it's been added from the admin panel.",
}: Props) {
  const [sections, setSections] = useState<WorkSection[]>([]);
  const [galleryItems, setGalleryItems] = useState<Record<string, GalleryItem[]>>({});
  const [contentImages, setContentImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setImgErrors({});

    Promise.all([
      fetch(`/api/work-sections?domain=${domain}`).then((r) => r.json()).catch(() => []),
      fetch("/api/content-images").then((r) => r.json()).catch(() => ({})),
    ]).then(async ([secs, imgs]) => {
      const sectionsArr: WorkSection[] = Array.isArray(secs) ? secs : [];
      setSections(sectionsArr);
      setContentImages(imgs ?? {});

      // Load gallery items for each section
      const items: Record<string, GalleryItem[]> = {};
      await Promise.all(sectionsArr.map(async (s) => {
        const r = await fetch(`/api/work-gallery/${s.slug}`).then((res) => res.json()).catch(() => ({ items: [] }));
        items[s.slug] = r.items ?? [];
      }));
      setGalleryItems(items);
      setLoading(false);
    });

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.contentImages) setContentImages(d.contentImages);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, [domain]);

  function getImgUrl(sectionSlug: string, itemId: string): string | null {
    return contentImages[`work-${sectionSlug}/${itemId}`] ?? null;
  }

  const hasContent = sections.some((s) => (galleryItems[s.slug] ?? []).length > 0);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          {pageLabel && (
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">{pageLabel}</p>
          )}
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">{pageTitle}</h1>
          {pageDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed">{pageDescription}</p>
          )}
        </header>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !hasContent && (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-9 h-9 text-primary/40" />
            </div>
            <div>
              <p className="text-xl font-serif font-semibold text-foreground/70 mb-2">Coming Soon</p>
              <p className="text-sm text-muted-foreground max-w-xs">{emptyMessage}</p>
            </div>
          </div>
        )}

        {!loading && hasContent && (
          <div className="flex flex-col gap-20">
            {sections.map((section) => {
              const items = galleryItems[section.slug] ?? [];
              if (items.length === 0) return null;

              const subCategories: SubCategory[] = section.subCategories ?? [];
              const treeOrder = buildTreeOrder(subCategories);

              type Group = { key: string | null; heading: string | null; items: GalleryItem[] };
              const groups: Group[] = [];

              if (treeOrder.length === 0) {
                groups.push({ key: null, heading: null, items });
              } else {
                const grouped = new Map<string, GalleryItem[]>();
                for (const { node } of treeOrder) grouped.set(node.slug, []);
                const uncategorised: GalleryItem[] = [];
                for (const item of items) {
                  if (item.subCategorySlug && grouped.has(item.subCategorySlug)) {
                    grouped.get(item.subCategorySlug)!.push(item);
                  } else {
                    uncategorised.push(item);
                  }
                }
                for (const { node, pathLabel } of treeOrder) {
                  const nodeItems = grouped.get(node.slug) ?? [];
                  if (nodeItems.length > 0) {
                    groups.push({ key: node.slug, heading: pathLabel, items: nodeItems });
                  }
                }
                if (uncategorised.length > 0) {
                  groups.push({ key: null, heading: groups.length > 0 ? "Other" : null, items: uncategorised });
                }
              }

              return (
                <section key={section.slug} id={section.slug}>
                  {/* Section heading */}
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-8 pb-4 border-b border-border">
                    {section.label}
                  </h2>

                  <div className="flex flex-col gap-10">
                    {groups.map((group) => (
                      <div key={group.key ?? "__uncategorised"} id={group.key ?? undefined}>
                        {group.heading && (
                          <h3 className="text-xl font-serif font-semibold text-foreground/80 mb-4 pl-1 border-l-2 border-primary/40 ml-0.5">
                            {group.heading}
                          </h3>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {group.items.map((item) => {
                            const isVideo = item.mediaType === "video";

                            if (isVideo && item.videoUrl) {
                              const embed = toEmbedUrl(item.videoUrl);
                              return (
                                <div key={item.id}
                                  className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                                    {embed?.type === "iframe" ? (
                                      <iframe src={embed.src} className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen title={item.caption} loading="lazy" />
                                    ) : embed?.type === "video" ? (
                                      <video src={embed.src} controls preload="metadata"
                                        className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                      <div className="absolute inset-0 bg-muted/30 flex items-center justify-center p-4">
                                        <a href={item.videoUrl!} target="_blank" rel="noopener noreferrer"
                                          className="text-xs text-primary underline break-all">{item.videoUrl}</a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="px-5 py-4 border-t border-border mt-auto">
                                    <p className="text-sm text-muted-foreground leading-snug">{item.caption}</p>
                                  </div>
                                </div>
                              );
                            }

                            const imgUrl = getImgUrl(section.slug, item.id);
                            const hasError = imgErrors[item.id];
                            return (
                              <div key={item.id}
                                className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                                <div className="relative w-full aspect-[4/3] bg-muted/30 overflow-hidden">
                                  {imgUrl && !hasError ? (
                                    <img src={imgUrl} alt={item.caption}
                                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                      onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))} />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
                                    </div>
                                  )}
                                </div>
                                <div className="px-5 py-4 border-t border-border mt-auto">
                                  <p className="text-sm text-muted-foreground leading-snug">{item.caption}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
