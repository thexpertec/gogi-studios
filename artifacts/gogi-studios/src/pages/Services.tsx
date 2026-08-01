import { PageTransition } from "@/components/layout/PageTransition";
import { services, clientSegments } from "@/lib/data";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { Editable } from "@/components/ui/Editable";
import { useState, useEffect } from "react";

const DEFAULT_EMAIL = "info@gogistudios.com";

export default function Services() {
  const [contactEmail, setContactEmail] = useState(DEFAULT_EMAIL);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.email) setContactEmail(d.email); }).catch(() => {});
    const handler = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.email) setContactEmail(d.email); };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            <Editable id="services-page-label">What We Do</Editable>
          </p>
          <h1 className="text-5xl font-serif font-bold mb-6 text-foreground">
            <Editable id="services-page-title">Services</Editable>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            <Editable id="services-page-desc">
              Gogi Studios delivers illustrated communication, animation, and training services to
              NGOs, UN agencies, government departments, and CSR programmes. Every engagement is led
              by Ms. Nigar Nazar — Pakistan's most trusted visual storyteller.
            </Editable>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/hire" data-testid="link-services-header-hire">
              <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 font-semibold">
                Commission a Project
              </Button>
            </Link>
            <a href={`mailto:${contactEmail}`} data-testid="link-services-email">
              <Button variant="outline" className="rounded-full px-8">
                Email Us Directly
              </Button>
            </a>
          </div>
        </header>

        {/* Top 5 Highlight */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-serif font-bold">
              <Editable id="services-top-heading">Highest-Impact Services</Editable>
            </h2>
            <span className="text-xs bg-primary text-white font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Top Revenue
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services
              .filter((s) => s.topRevenue)
              .map((service, i) => (
                <div
                  key={service.id}
                  className="bg-card border border-primary/25 rounded-2xl p-7 flex flex-col gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  data-testid={`card-top-service-${service.id}`}
                >
                  <span className="text-4xl font-serif font-bold text-primary/15">0{i + 1}</span>
                  <h3 className="text-lg font-serif font-bold leading-snug">
                    <Editable id={`service-${service.id}-title`}>{service.title}</Editable>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    <Editable id={`service-${service.id}-description`}>
                      {service.description}
                    </Editable>
                  </p>
                  <Link href="/hire" data-testid={`link-top-service-hire-${service.id}`}>
                    <Button
                      size="sm"
                      className="rounded-full bg-primary text-white hover:bg-primary/90 w-full mt-2"
                    >
                      Request a Proposal <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </section>

        {/* All Services */}
        <section className="mb-20">
          <h2 className="text-2xl font-serif font-bold mb-8">
            <Editable id="services-all-heading">All Services</Editable>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services
              .filter((s) => !s.topRevenue)
              .map((service) => (
                <div
                  key={service.id}
                  className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md hover:border-primary/20 transition-all duration-200"
                  data-testid={`card-service-${service.id}`}
                >
                  <h3 className="font-serif font-bold leading-snug">
                    <Editable id={`service-${service.id}-title`}>{service.title}</Editable>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    <Editable id={`service-${service.id}-description`}>
                      {service.description}
                    </Editable>
                  </p>
                  <Link href="/hire" data-testid={`link-service-inquire-${service.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 -ml-2 rounded-full text-xs font-medium"
                    >
                      Inquire <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        </section>

        {/* Client Sectors */}
        <section className="mb-20">
          <h2 className="text-2xl font-serif font-bold mb-8">
            <Editable id="services-sectors-heading">Who We Serve</Editable>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clientSegments.map((seg) => (
              <div
                key={seg.id}
                className="bg-muted/40 border border-border/40 rounded-2xl p-6 flex flex-col gap-4"
                data-testid={`card-segment-${seg.id}`}
              >
                <div className="text-2xl">{seg.icon}</div>
                <h3 className="font-serif font-bold">
                  <Editable id={`segment-${seg.id}-name`}>{seg.name}</Editable>
                </h3>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Typical clients
                  </p>
                  <ul className="space-y-1">
                    {seg.audience.map((a) => (
                      <li key={a} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Common services
                  </p>
                  <ul className="space-y-1">
                    {seg.services.map((s) => (
                      <li
                        key={s}
                        className="text-xs text-foreground/70 flex items-start gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-secondary-foreground/40 shrink-0 mt-1.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-foreground text-background p-14 text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4">
            <Editable id="services-cta-title">Not sure which service fits?</Editable>
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto text-base leading-relaxed">
            <Editable id="services-cta-desc">
              Tell us about your programme objective and target audience. We'll recommend the right
              mix of services and send a tailored proposal.
            </Editable>
          </p>
          <Link href="/hire" data-testid="link-services-bottom-hire">
            <Button
              size="lg"
              className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 font-semibold"
            >
              Get a Free Proposal
            </Button>
          </Link>
        </section>
      </div>
    </PageTransition>
  );
}
