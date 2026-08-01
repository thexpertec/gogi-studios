import { PageTransition } from "@/components/layout/PageTransition";
import { blogPosts, services, clientSegments } from "@/lib/data";
import gogiBanner from "@assets/gogi-banner.jpg";
import nigarAward from "@assets/nigar-event-6.jpg";
import nigarSelfie from "@assets/image_1785184592255.png";
import nigarHome from "@assets/nigar-event-2.jpg";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { Editable } from "@/components/ui/Editable";
import { EditableImage } from "@/components/ui/EditableImage";
import { useState, useEffect } from "react";

const topFive = services.filter((s) => s.topRevenue);

const clientLogos = [
  "UN Agencies",
  "UNICEF-type Projects",
  "INGOs",
  "Government Departments",
  "CSR Programs",
  "Educational Publishers",
];

const FALLBACK_TESTIMONIALS = [
  { id: "t1", quote: "Gogi Studios translated our complex climate data into visual stories that reached communities we had never been able to engage before.", author: "Program Manager, Environmental NGO" },
  { id: "t2", quote: "The illustrated training manuals Nigar Nazar's team produced cut our field-worker onboarding time in half. Exceptional work.", author: "Project Director, Health Development Program" },
  { id: "t3", quote: "We commissioned a child protection awareness campaign and received materials that were culturally sensitive, visually compelling, and immediately deployable.", author: "Communication Specialist, Child Rights Organisation" },
];

interface DynamicTestimonial { id: string; caption: string; imageUrl: string; }

export default function Home() {
  const [dynamicTestimonials, setDynamicTestimonials] = useState<DynamicTestimonial[]>([]);
  const [testimonialImages, setTestimonialImages] = useState<Record<string, string>>({});
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/testimonials").then((r) => r.json())
      .then((d) => setDynamicTestimonials(d.items ?? []))
      .catch(() => {});
    fetch("/api/content-images").then((r) => r.json())
      .then((m) => setTestimonialImages(m ?? {}))
      .catch(() => {});

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.testimonials) setDynamicTestimonials(d.testimonials);
      if (d?.contentImages) setTestimonialImages(d.contentImages);
    };
    window.addEventListener("settings-updated", handler);
    return () => window.removeEventListener("settings-updated", handler);
  }, []);

  function getTestimonialImg(id: string) {
    return testimonialImages[`testimonials/${id}`] ?? null;
  }
  return (
    <PageTransition className="pt-20 pb-0 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={gogiBanner}
            alt="Gogi Characters"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-background/55 to-background" />
        </div>

        <svg
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full text-background"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>

        <div className="container relative z-10 mx-auto px-4 text-center py-32">
          <span className="inline-block bg-primary text-white text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full mb-8 shadow-md">
            <Editable id="home-hero-badge">Social Impact Communication — Since 1975</Editable>
          </span>

          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold mb-6 text-foreground max-w-5xl mx-auto leading-[0.92] tracking-tight"
            data-testid="text-hero-title"
          >
            <Editable id="home-hero-line1">Art That</Editable>
            <br />
            <span className="text-primary italic relative inline-block">
              <Editable id="home-hero-line2">Moves</Editable>
              <svg aria-hidden="true" className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M4,8 Q75,2 150,8 Q225,14 296,6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" className="text-secondary" />
              </svg>
            </span>
            <br />
            <Editable id="home-hero-line3">Communities</Editable>
          </h1>

          <p
            className="text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto mb-12 leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            <Editable id="home-hero-subtitle">
              Illustrated campaigns, animated content, and training programs that drive behaviour change for NGOs, UN agencies, governments, and CSR programs — backed by 50 years of cultural authority.
            </Editable>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hire" data-testid="link-hero-hire">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-12 rounded-full text-base shadow-lg shadow-primary/30 transition-all hover:scale-105">
                <Editable id="home-hero-cta-primary">Commission a Project</Editable>
              </Button>
            </Link>
            <Link href="/services" data-testid="link-hero-services">
              <Button variant="outline" size="lg" className="rounded-full px-10 text-base bg-white/60 backdrop-blur-sm border-foreground/20 hover:bg-white/90 font-semibold">
                <Editable id="home-hero-cta-secondary">View All Services</Editable>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY STRIP ─────────────────────────────────────────────── */}
      <section className="bg-foreground py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-background/50 mr-2">
              <Editable id="home-trusted-label">Trusted by</Editable>
            </span>
            {clientLogos.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-background/80 px-4 py-1 border border-white/15 rounded-full hover:border-secondary/60 hover:text-secondary transition-colors"
                data-testid={`text-client-type-${name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET MS. NIGAR NAZAR ─────────────────────────────────────────── */}
      <section className="relative py-28 bg-background">
        <div className="absolute left-0 top-0 w-1/2 h-full bg-secondary/15 hidden lg:block" />

        <div className="container relative mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Photos column */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl -rotate-1 relative z-10">
                <EditableImage
                  id="home-photo-award"
                  src={nigarAward}
                  alt="Ms. Nigar Nazar receiving the UN Sustainable Development Award 2026"
                  className="w-full h-full object-cover object-top"
                  data-testid="img-nigar-award"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-2xl overflow-hidden aspect-square shadow-lg rotate-1 relative z-10">
                  <EditableImage
                    id="home-photo-selfie"
                    src={nigarSelfie}
                    alt="Ms. Nigar Nazar"
                    className="w-full h-full object-cover object-center"
                    data-testid="img-nigar-selfie"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-square shadow-lg -rotate-1 relative z-10">
                  <EditableImage
                    id="home-photo-home"
                    src={nigarHome}
                    alt="Ms. Nigar Nazar with guests at Gogi Studios"
                    className="w-full h-full object-cover object-center"
                    data-testid="img-nigar-home"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-secondary rounded-3xl -z-10 hidden lg:block" />
            </div>

            {/* Text column */}
            <div className="lg:pl-6">
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-5">
                <Editable id="home-nigar-label">The Artist</Editable>
              </p>

              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">
                <Editable id="home-nigar-title-1">Pakistan's first female</Editable>
                <br />
                <span className="italic text-primary">
                  <Editable id="home-nigar-title-2">political cartoonist</Editable>
                </span>
              </h2>

              <div className="relative mb-8">
                <span className="absolute -top-6 -left-4 text-8xl font-serif text-secondary leading-none select-none" aria-hidden="true">"</span>
                <blockquote className="pl-6 border-l-4 border-primary">
                  <p className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed">
                    <Editable id="home-nigar-quote">
                      Art is not decoration. It is how we tell the truth.
                    </Editable>
                  </p>
                  <cite className="block mt-3 text-sm font-semibold not-italic text-muted-foreground">
                    <Editable id="home-nigar-cite">— Ms. Nigar Nazar, Creator of Gogi</Editable>
                  </cite>
                </blockquote>
              </div>

              <p className="text-muted-foreground mb-5 leading-relaxed">
                <Editable id="home-nigar-bio-1">
                  Ms. Nigar Nazar has been drawing Gogi — Pakistan's most beloved comic character — since 1975. What began as a newspaper strip became a cultural institution: a voice for women's rights, health, and education that cuts across class and literacy.
                </Editable>
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                <Editable id="home-nigar-bio-2">
                  Today, Gogi Studios channels that legacy into communication services for the organisations that need it most: UN agencies, INGOs, government departments, and CSR programmes working on behaviour change across South Asia.
                </Editable>
              </p>

              <Link href="/projects" data-testid="link-nigar-work">
                <Button variant="outline" className="rounded-full px-8 border-foreground/25 hover:bg-foreground hover:text-background font-semibold transition-all">
                  See Our Work <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY GOGI STUDIOS ─────────────────────────────────────────────── */}
      <section className="py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Stats bento */}
            <div className="grid grid-cols-2 gap-4 order-2 md:order-1">
              {[
                { number: "50+", label: "Years of Impact", bg: "bg-primary", text: "text-white" },
                { number: "100+", label: "Campaigns Delivered", bg: "bg-secondary", text: "text-secondary-foreground" },
                { number: "15+", label: "Awards & Honours", bg: "bg-secondary", text: "text-secondary-foreground" },
                { number: "20+", label: "Service Offerings", bg: "bg-primary", text: "text-white" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${stat.bg} ${stat.text} rounded-3xl p-8 text-center flex flex-col justify-center ${i === 0 ? "col-span-2 md:col-span-1" : ""} hover:scale-105 transition-transform duration-300`}
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-5xl font-serif font-bold mb-2">
                    <Editable id={`home-stat-${i}-number`}>{stat.number}</Editable>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80">
                    <Editable id={`home-stat-${i}-label`}>{stat.label}</Editable>
                  </div>
                </div>
              ))}
            </div>

            {/* Text */}
            <div className="order-1 md:order-2">
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
                <Editable id="home-why-label">Why Gogi Studios</Editable>
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                <Editable id="home-why-title-1">50 years of storytelling</Editable>
                <br />
                <span className="italic text-primary">
                  <Editable id="home-why-title-2">for social change</Editable>
                </span>
              </h2>
              <p className="text-muted-foreground mb-7 leading-relaxed">
                <Editable id="home-why-body">
                  Ms. Nigar Nazar — Pakistan's first and most celebrated female political cartoonist — has spent five decades using the Gogi character to shift mindsets on gender, education, climate, and health. That cultural authority is now available to your program.
                </Editable>
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  { id: "p1", text: "Deep cultural fluency across Pakistan and South Asia" },
                  { id: "p2", text: "Multilingual content — Urdu, English, regional languages" },
                  { id: "p3", text: "Proven track record with UN, government, and INGO partners" },
                  { id: "p4", text: "End-to-end: strategy, illustration, animation, and training" },
                ].map((point) => (
                  <li key={point.id} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium">
                      <Editable id={`home-why-point-${point.id}`}>{point.text}</Editable>
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/hire" data-testid="link-why-hire">
                <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-8 font-bold shadow-md shadow-primary/20 hover:scale-105 transition-all">
                  Start a Conversation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGH-IMPACT SERVICES ─────────────────────────────────────────── */}
      <section className="py-28 bg-secondary text-secondary-foreground relative overflow-hidden">
        <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-[20rem] font-serif font-bold text-black/5 leading-none select-none hidden lg:block" aria-hidden="true">
          5
        </span>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest opacity-70 mb-4">
              <Editable id="home-services-label">Our Core Capabilities</Editable>
            </p>
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-5">
              <Editable id="home-services-title">High-Impact Services</Editable>
            </h2>
            <p className="opacity-75 max-w-xl mx-auto text-lg">
              <Editable id="home-services-desc">
                The five areas where Gogi Studios delivers the highest value for development organisations and institutional clients.
              </Editable>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {topFive.map((service, i) => (
              <div
                key={service.id}
                className={`rounded-3xl p-8 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-default
                  ${i === 0
                    ? "bg-primary text-white md:col-span-2 lg:col-span-1"
                    : "bg-black/10 hover:bg-black/15"
                  }`}
                data-testid={`card-service-${service.id}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-5xl font-serif font-bold ${i === 0 ? "text-white/20" : "text-black/15"}`}>0{i + 1}</span>
                  {i === 0 && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Top Service
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-serif font-bold leading-snug">
                  <Editable id={`service-${service.id}-title`}>{service.title}</Editable>
                </h3>
                <p className={`text-sm leading-relaxed flex-1 ${i === 0 ? "text-white/80" : "opacity-75"}`}>
                  <Editable id={`service-${service.id}-description`}>{service.description}</Editable>
                </p>
                <Link href="/hire" data-testid={`link-inquire-${service.id}`}>
                  <span className={`inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all ${i === 0 ? "text-white" : ""}`}>
                    Inquire <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/services" data-testid="link-all-services">
              <Button className="rounded-full px-10 bg-foreground text-background hover:bg-foreground/85 font-bold text-base shadow-lg hover:scale-105 transition-all">
                <Editable id="home-services-cta">View All 20 Services</Editable> <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CLIENT SECTORS ───────────────────────────────────────────────── */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
              <Editable id="home-sectors-label">Who We Work With</Editable>
            </p>
            <h2 className="text-5xl font-serif font-bold mb-4">
              <Editable id="home-sectors-title">Our Client Sectors</Editable>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              <Editable id="home-sectors-desc">
                From UN programme teams to school systems, Gogi Studios serves organisations whose work demands communication that cuts through.
              </Editable>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {clientSegments.map((seg, i) => (
              <div
                key={seg.id}
                className={`rounded-3xl p-7 flex flex-col gap-4 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                  ${i % 2 === 0
                    ? "border-secondary bg-secondary/10 hover:bg-secondary/20"
                    : "border-primary/20 bg-card hover:border-primary/50"
                  }`}
                data-testid={`card-segment-${seg.id}`}
              >
                <div className="text-4xl">{seg.icon}</div>
                <h3 className="font-serif font-bold text-xl">
                  <Editable id={`segment-${seg.id}-name`}>{seg.name}</Editable>
                </h3>
                <ul className="space-y-1.5 flex-1">
                  {seg.audience.map((a) => (
                    <li key={a} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
                <Link href="/hire" className="mt-auto" data-testid={`link-segment-hire-${seg.id}`}>
                  <Button variant="outline" size="sm" className="w-full rounded-full text-xs font-bold border-foreground/20 hover:bg-primary hover:text-white hover:border-primary transition-all">
                    Get a proposal
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-28 bg-muted/40 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">
              <Editable id="home-testimonials-label">Client Testimonials</Editable>
            </p>
            <h2 className="text-4xl font-serif font-bold">
              <Editable id="home-testimonials-title">What our partners say</Editable>
            </h2>
          </div>
        </div>

        {/* Marquee strip — full section width */}
        <div className="relative w-full group cursor-default select-none">
          {/* Dynamic image testimonials */}
          {dynamicTestimonials.length > 0 ? (
            <div
              className="flex gap-5 w-max animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: `${Math.max(20, dynamicTestimonials.length * 8)}s` }}
            >
              {[...dynamicTestimonials, ...dynamicTestimonials].map((t, idx) => {
                const imgUrl = getTestimonialImg(t.id);
                const hasError = imgErrors[t.id];
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    className="w-72 shrink-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col"
                  >
                    {imgUrl && !hasError ? (
                      <div className="w-full bg-muted/30">
                        <img
                          src={imgUrl}
                          alt={`Testimonial from ${t.caption}`}
                          className="w-full h-52 object-cover"
                          onError={() => setImgErrors((prev) => ({ ...prev, [t.id]: true }))}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-muted/40 flex items-center justify-center">
                        <span className="text-6xl font-serif text-primary/20 leading-none">"</span>
                      </div>
                    )}
                    <div className="px-5 py-4 border-t border-border">
                      <p className="text-sm font-semibold text-muted-foreground">— {t.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback text testimonials marquee */
            <div
              className="flex gap-5 w-max animate-marquee group-hover:[animation-play-state:paused]"
            >
              {[...FALLBACK_TESTIMONIALS, ...FALLBACK_TESTIMONIALS].map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="w-80 shrink-0 bg-card border border-border rounded-2xl p-8 flex flex-col gap-5 shadow-sm"
                >
                  <span className="text-5xl font-serif text-primary/30 leading-none">"</span>
                  <p className="font-serif italic text-lg leading-relaxed text-foreground/85 flex-1">
                    <Editable id={`home-testimonial-${t.id}-quote`}>{t.quote}</Editable>
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground border-t border-border pt-4">
                    <Editable id={`home-testimonial-${t.id}-author`}>{t.author}</Editable>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── RECENT NEWS ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
                <Editable id="home-news-label">Latest News</Editable>
              </p>
              <h2 className="text-4xl font-serif font-bold">
                <Editable id="home-news-title">From Gogi Studios</Editable>
              </h2>
            </div>
            <Link href="/blog" data-testid="link-all-news">
              <Button variant="ghost" className="rounded-full text-sm font-semibold text-primary hover:bg-primary/10">
                All News <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <article
                key={post.id}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <Editable id={`home-blog-${post.id}-category`}>{post.category}</Editable>
                  </span>
                  <time className="text-xs text-muted-foreground">
                    <Editable id={`home-blog-${post.id}-date`}>{post.date}</Editable>
                  </time>
                </div>
                <h3 className="font-serif font-bold text-lg leading-snug flex-1">
                  <Editable id={`home-blog-${post.id}-title`}>{post.title}</Editable>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  <Editable id={`home-blog-${post.id}-excerpt`}>{post.excerpt}</Editable>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ─────────────────────────────────────────────── */}
      <section className="py-28 bg-primary text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary/20 pointer-events-none" />
        <svg
          aria-hidden="true"
          className="absolute top-0 left-0 w-full text-background -translate-y-[1px]"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,15 1440,30 L1440,0 L0,0 Z"
            fill="currentColor"
          />
        </svg>

        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-5">
            <Editable id="home-cta-label">Ready to commission?</Editable>
          </p>
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
            <Editable id="home-cta-title-1">Let's create something</Editable>
            <br />
            <span className="italic text-secondary">
              <Editable id="home-cta-title-2">that moves people</Editable>
            </span>
          </h2>
          <p className="text-white/80 mb-12 text-lg leading-relaxed max-w-xl mx-auto">
            <Editable id="home-cta-body">
              Tell us about your programme, campaign, or training need. We'll come back with a tailored proposal within 48 hours.
            </Editable>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hire" data-testid="link-bottom-hire">
              <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 px-12 font-bold text-base shadow-xl hover:scale-105 transition-all">
                <Editable id="home-cta-btn-primary">Commission a Project</Editable>
              </Button>
            </Link>
            <Link href="/services" data-testid="link-bottom-services">
              <Button size="lg" variant="outline" className="rounded-full px-10 text-base border-white/30 text-white hover:bg-white/15 font-semibold">
                <Editable id="home-cta-btn-secondary">Browse Services</Editable>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
