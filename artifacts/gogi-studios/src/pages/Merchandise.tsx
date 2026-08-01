import { PageTransition } from "@/components/layout/PageTransition";
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Editable } from "@/components/ui/Editable";

interface MerchItem {
  id: string;
  name: string;
  price?: string;
  tag?: string | null;
  description?: string;
}

const trustSignals = [
  { icon: Truck,       label: "Free shipping",   sub: "On orders over $50" },
  { icon: ShieldCheck, label: "Secure checkout",  sub: "Payments fully encrypted" },
  { icon: RotateCcw,   label: "30-day returns",   sub: "Hassle-free returns" },
];

export default function Merchandise() {
  const [added, setAdded]     = useState<string | null>(null);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [items, setItems]     = useState<MerchItem[]>([]);

  useEffect(() => {
    fetch("/api/content-images").then((r) => r.json()).then((m) => setImageMap(m ?? {})).catch(() => {});
    fetch("/api/catalog").then((r) => r.json()).then((c) => setItems(c.merchandise ?? [])).catch(() => {});

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.contentImages) setImageMap(d.contentImages);
      if (d?.catalog?.merchandise) setItems(d.catalog.merchandise);
      if (d?.catalogUpdated && d?.catalog) setItems(d.catalog.merchandise ?? []);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  function handleAddToCart(id: string) {
    setAdded(id);
    setTimeout(() => setAdded(null), 1800);
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            <Editable id="merch-page-label">Official Store</Editable>
          </p>
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="merch-page-title">Gogi Merchandise</Editable>
          </h1>
          <p className="text-lg text-muted-foreground">
            <Editable id="merch-page-desc">
              Take a piece of Gogi's world home with you. Every purchase directly supports Gogi Studios and the continued work of Ms. Nigar Nazar.
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {items.map((item) => {
            const productUrl = imageMap[`merchandise/${item.id}`];
            return (
              <div key={item.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                data-testid={`card-merch-${item.id}`}>
                {item.tag && (
                  <div className={`text-xs font-bold uppercase tracking-wider text-center py-1.5 ${item.tag === "Best Seller" || item.tag === "Gift Idea" ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"}`}>
                    {item.tag === "Best Seller" && <Star className="w-3 h-3 inline mr-1 mb-0.5" />}
                    {item.tag}
                  </div>
                )}
                <div className="aspect-square bg-muted flex items-center justify-center border-b border-border overflow-hidden">
                  {productUrl ? (
                    <img src={productUrl} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <ShoppingBag className="w-14 h-14 text-muted-foreground/25" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif font-bold text-lg mb-1">
                    <Editable id={`merch-${item.id}-name`}>{item.name}</Editable>
                  </h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
                      <Editable id={`merch-${item.id}-description`}>{item.description}</Editable>
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-border/50">
                    {item.price && (
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-primary" data-testid={`text-merch-price-${item.id}`}>
                          <Editable id={`merch-${item.id}-price`}>{item.price}</Editable>
                        </span>
                        {item.tag === "Gift Idea" && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Bundle</span>
                        )}
                      </div>
                    )}
                    <Button
                      className={`w-full rounded-full font-medium transition-all ${added === item.id ? "bg-green-600 text-white hover:bg-green-600" : "bg-foreground text-background hover:bg-foreground/85"}`}
                      onClick={() => handleAddToCart(item.id)}
                      data-testid={`button-add-to-cart-${item.id}`}>
                      {added === item.id ? "Added!" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Upsell Banner */}
        <div className="rounded-3xl bg-foreground text-background p-12 text-center mb-16">
          <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-serif font-bold mb-3">
            <Editable id="merch-cta-title">Give the Gift of Gogi</Editable>
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto">
            <Editable id="merch-cta-desc">
              The Gogi Gift Bundle includes a tote, mug, sticker pack, and art print — everything a Gogi fan could want in one beautiful box.
            </Editable>
          </p>
          <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 font-semibold" data-testid="button-buy-gift-bundle">
            <Star className="w-4 h-4 mr-2" />
            <Editable id="merch-cta-btn">Order Gift Bundle — $75</Editable>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
