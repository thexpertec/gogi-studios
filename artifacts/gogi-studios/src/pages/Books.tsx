import { PageTransition } from "@/components/layout/PageTransition";
import { BookOpen, Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Editable } from "@/components/ui/Editable";
import { useState, useEffect } from "react";

interface Book {
  id: string;
  name: string;
  description?: string;
  price?: string;
  priceUsd?: string;
  featured?: boolean;
}

const trustSignals = [
  { icon: Truck,       label: "Free shipping",      sub: "On orders over $50" },
  { icon: ShieldCheck, label: "Authentic editions",  sub: "Published by Gogi Studios" },
  { icon: RotateCcw,   label: "Easy returns",        sub: "Within 30 days" },
];

export default function Books() {
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [books, setBooks]       = useState<Book[]>([]);

  useEffect(() => {
    fetch("/api/content-images").then((r) => r.json()).then((m) => setImageMap(m ?? {})).catch(() => {});
    fetch("/api/catalog").then((r) => r.json()).then((c) => setBooks(c.books ?? [])).catch(() => {});

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.contentImages) setImageMap(d.contentImages);
      if (d?.catalog?.books) setBooks(d.catalog.books);
      if (d?.catalogUpdated && d?.catalog) setBooks(d.catalog.books ?? []);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            <Editable id="books-page-label">Publications</Editable>
          </p>
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="books-page-title">Gogi Books</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="books-page-desc">
              Educational, entertaining, and always insightful. Discover the world of Gogi through
              beautifully illustrated books loved by children and adults alike.
            </Editable>
          </p>
        </header>

        {/* Trust Signals */}
        <div className="grid grid-cols-3 gap-4 mb-16 bg-muted/30 rounded-2xl p-6">
          {trustSignals.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2"
              data-testid={`trust-signal-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              <Icon className="w-5 h-5 text-primary" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {books.map((book) => {
            const coverUrl = imageMap[`books/${book.id}`];
            return (
              <div key={book.id}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                data-testid={`card-book-${book.id}`}>
                {book.featured && (
                  <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-2">
                    <Star className="w-3 h-3 inline mr-1 mb-0.5" /> Best Value — Complete Set
                  </div>
                )}
                <div className="aspect-[3/4] bg-muted relative flex items-center justify-center border-b border-border overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt={book.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full p-8 flex items-center justify-center">
                      <div className="w-full h-full bg-white shadow-md rounded-r-lg border-l-4 border-primary/20 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                        <BookOpen className="w-12 h-12 text-primary/40 mb-4" />
                        <h3 className="font-serif font-bold text-xl text-foreground">{book.name}</h3>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-serif font-bold mb-2">{book.name}</h3>
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1">
                      <Editable id={`book-${book.id}-description`}>{book.description}</Editable>
                    </p>
                  )}
                  {(book.priceUsd || book.price) && (
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div>
                        {book.priceUsd && (
                          <span className="text-xl font-bold text-primary" data-testid={`text-book-price-${book.id}`}>
                            <Editable id={`book-${book.id}-price-usd`}>{book.priceUsd}</Editable>
                          </span>
                        )}
                        {book.price && (
                          <span className="text-xs text-muted-foreground ml-2">
                            / <Editable id={`book-${book.id}-price-pkr`}>{book.price}</Editable>
                          </span>
                        )}
                      </div>
                      <Button className="rounded-full bg-primary text-white hover:bg-primary/90 font-medium" data-testid={`button-buy-book-${book.id}`}>Buy Now</Button>
                    </div>
                  )}
                  {!book.priceUsd && !book.price && (
                    <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/50">
                      <Button className="rounded-full bg-primary text-white hover:bg-primary/90 font-medium" data-testid={`button-buy-book-${book.id}`}>Buy Now</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-foreground text-background p-12 text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-3">
            <Editable id="books-cta-title">Looking for a gift?</Editable>
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto">
            <Editable id="books-cta-desc">
              The Complete Gogi Collection makes the perfect gift for curious minds of all ages. Free gift wrapping on request.
            </Editable>
          </p>
          <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 font-semibold" data-testid="button-buy-gift-set">
            <Star className="w-4 h-4 mr-2" />
            <Editable id="books-cta-btn">Order the Complete Set — $72</Editable>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
