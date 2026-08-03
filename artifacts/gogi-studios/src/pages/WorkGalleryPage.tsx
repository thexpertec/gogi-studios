import { useState, useEffect } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ImageIcon } from "lucide-react";
import type { WorkSection, SubCategory } from "@/lib/workSections";
import { buildTreeOrder } from "@/lib/workSections";

interface GalleryItem {
  id: string;
  caption: string;
  imageUrl: string;
  subCategorySlug?: string | null;
  mediaType?: string | null;
  videoUrl?: string | null;
}

interface Props {
  slug?: string;
}

/** Convert a YouTube / Vimeo / direct URL to an embeddable URL. Returns null if unrecognised. */
function toEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { type: "video", src: url };
  return null;
}

export default function WorkGalleryPage({ slug = "" }: Props) {
  const [section, setSection] = useState<WorkSection | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [contentImages, setContentImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Flash the target section when navigating to a hash anchor
  function flashSection(hash: string) {
    if (!hash) return;
    const id = hash.replace(/^#/, "");
    // Small delay lets the browser finish the smooth-scroll before animating
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("section-highlight");
      void el.offsetWidth; // force reflow so re-triggering works
      el.classList.add("section-highlight");
      const cleanup = () => el.classList.remove("section-highlight");
      el.addEventListener("animationend", cleanup, { once: true });
    }, 100);
  }

  // Fire flash once data has loaded (sections are now in the DOM)
  useEffect(() => {
    if (!loading) {
      flashSection(window.location.hash);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also fire on in-page hash changes (same section, different sub-cat)
  useEffect(() => {
    function onHashChange() { flashSection(window.location.hash); }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setSection(null);
    setItems([]);
    setImgErrors({});

    Promise.all([
      fetch("/api/work-sections").then((r) => r.json()).catch(() => []),
      fetch(`/api/work-gallery/${slug}`).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch("/api/content-images").then((r) => r.json()).catch(() => ({})),
    ]).then(([sections, gallery, imgs]) => {
      const found = (sections as WorkSection[]).find((s) => s.slug === slug) ?? null;
      if (!found) { setNotFound(true); setLoading(false); return; }
      setSection(found);
      setItems(gallery.items ?? []);
      setContentImages(imgs ?? {});
      setLoading(false);
    });

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (Array.isArray(d?.workSections)) {
        const found = (d.workSections as WorkSection[]).find((s) => s.slug === slug);
        if (found) setSection(found);
        else setNotFound(true);
      }
      if (d?.workGallery?.[slug]) setItems(d.workGallery[slug]);
      if (d?.contentImages) setContentImages(d.contentImages);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, [slug]);

  function getImgUrl(item: GalleryItem): string | null {
    const key = `work-${slug}/${item.id}`;
    return contentImages[key] ?? null;
  }

  // Build grouped display
  const subCategories: SubCategory[] = section?.subCategories ?? [];
  const treeOrder = buildTreeOrder(subCategories);

  type Group = { key: string | null; heading: string | null; items: GalleryItem[] };
  const groups: Group[] = [];

  if (treeOrder.length === 0) {
    if (items.length > 0) groups.push({ key: null, heading: null, items });
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

  if (notFound) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center justify-center py-32 gap-4 text-center">
          <p className="text-6xl font-serif font-bold text-foreground/20">404</p>
          <p className="text-xl font-serif font-semibold text-foreground/60">Section not found</p>
          <p className="text-sm text-muted-foreground">This work category doesn't exist or may have been removed.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Work History</p>
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            {section?.label ?? <span className="invisible">Loading</span>}
          </h1>
        </header>

        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-9 h-9 text-primary/40" />
            </div>
            <div>
              <p className="text-xl font-serif font-semibold text-foreground/70 mb-2">Coming Soon</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Work samples for this category will appear here once they're uploaded.
              </p>
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="flex flex-col gap-14">
            {groups.map((group) => (
              <section key={group.key ?? "__uncategorised"} id={group.key ?? undefined}>
                {group.heading && (
                  <h2 className="text-2xl font-serif font-semibold text-foreground mb-6 pb-3 border-b border-border">
                    {group.heading}
                  </h2>
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
                              <iframe src={embed.src}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen title={item.caption} loading="lazy" />
                            ) : embed?.type === "video" ? (
                              <video src={embed.src} controls preload="metadata"
                                className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 bg-muted/30 flex items-center justify-center p-4">
                                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer"
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

                    // Image item
                    const imgUrl = getImgUrl(item);
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
              </section>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
