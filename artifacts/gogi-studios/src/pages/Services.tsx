import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Star } from "lucide-react";
import DomainGalleryPage from "@/pages/DomainGalleryPage";
import { services as fallbackServices } from "@/lib/data";

interface DynamicService {
  id: string;
  title: string;
  description: string;
  topService: boolean;
  sortOrder: number;
  linkUrl?: string | null;
}

const FALLBACK: DynamicService[] = fallbackServices.map((s, i) => ({
  id: s.id, title: s.title, description: s.description, topService: !!s.topRevenue, sortOrder: i,
}));

export default function Services() {
  const [, navigate] = useLocation();
  const [servicesList, setServicesList] = useState<DynamicService[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json())
      .then((d) => { if (Array.isArray(d.items)) setServicesList(d.items); })
      .catch(() => {});

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (Array.isArray(d?.services)) setServicesList(d.services);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  const servicesGrid = servicesList.length > 0 ? (
    <div className="mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {servicesList.map((service, i) => (
          <div
            key={service.id}
            onClick={service.linkUrl ? () => navigate(service.linkUrl!) : undefined}
            role={service.linkUrl ? "link" : undefined}
            className={`rounded-3xl p-8 flex flex-col gap-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${service.linkUrl ? "cursor-pointer" : ""}
              ${service.topService
                ? "bg-primary text-white border-primary"
                : "bg-card border-border hover:border-primary/30"
              }`}
            data-testid={`card-service-${service.id}`}
          >
            <div className="flex items-start justify-between">
              <span className={`text-5xl font-serif font-bold ${service.topService ? "text-white/20" : "text-black/10"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {service.topService && (
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Top Service
                </span>
              )}
            </div>
            <h3 className="text-xl font-serif font-bold leading-snug">{service.title}</h3>
            <p className={`text-sm leading-relaxed flex-1 ${service.topService ? "text-white/80" : "text-muted-foreground"}`}>
              {service.description}
            </p>
            <Link href="/hire" data-testid={`link-inquire-${service.id}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <span className={`inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all cursor-pointer ${service.topService ? "text-white" : "text-primary"}`}>
                Inquire <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <DomainGalleryPage
      domain="services"
      pageTitle="Services"
      pageLabel="What We Do"
      pageDescription="Gogi Studios delivers illustrated communication, animation, and training services to NGOs, UN agencies, government departments, and CSR programmes."
      emptyMessage="Service categories and samples will appear here once they've been added from the admin panel."
      topContent={servicesGrid}
      hasTopContent={servicesList.length > 0}
    />
  );
}
