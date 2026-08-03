import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
const STATIC_LOGO = "/api/static-images/gogi-logo.png";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import type { WorkSection } from "@/lib/workSections";
import { buildTreeOrder } from "@/lib/workSections";

const API = "/api";

export function Navbar() {
  const [location] = useLocation();
  const [companyName, setCompanyName] = useState("Gogi Studios");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [workSections, setWorkSections] = useState<WorkSection[]>([]);
  const [workOpen, setWorkOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flyoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => { if (data.companyName) setCompanyName(data.companyName); })
      .catch(() => {});

    fetch(`${API}/logo`)
      .then((r) => { if (r.ok) setLogoUrl(`${API}/logo?t=${Date.now()}`); })
      .catch(() => {});

    fetch(`${API}/work-sections`)
      .then((r) => r.json())
      .then((sections) => { if (Array.isArray(sections)) setWorkSections(sections); })
      .catch(() => {});

    function onSettingsUpdated(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.companyName) setCompanyName(detail.companyName);
      if (detail?.logoUpdated && detail?.logoUrl) setLogoUrl(detail.logoUrl);
      if (Array.isArray(detail?.workSections)) setWorkSections(detail.workSections);
    }
    window.addEventListener("settings-updated", onSettingsUpdated);
    return () => window.removeEventListener("settings-updated", onSettingsUpdated);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setWorkOpen(false);
    setActiveSection(null);
  }, [location]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (workRef.current && !workRef.current.contains(e.target as Node)) {
        setWorkOpen(false);
        setActiveSection(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openWork() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setWorkOpen(true);
  }
  function closeWork() {
    hoverTimeout.current = setTimeout(() => {
      setWorkOpen(false);
      setActiveSection(null);
    }, 150);
  }

  function onSectionHover(slug: string, hasSubCats: boolean) {
    if (flyoutTimeout.current) clearTimeout(flyoutTimeout.current);
    setActiveSection(hasSubCats ? slug : null);
  }

  const isWorkActive = location.startsWith("/work/") || location === "/projects";

  const activeSectionData = activeSection
    ? workSections.find((s) => s.slug === activeSection) ?? null
    : null;

  const staticLinks = [
    { href: "/services",     label: "Services" },
    { href: "/awards",       label: "Awards" },
    { href: "/blog",         label: "News" },
    { href: "/books",        label: "Books" },
    { href: "/merchandise",  label: "Shop" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0" data-testid="link-home-logo">
          <img
            src={logoUrl ?? STATIC_LOGO}
            alt={companyName}
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            onError={() => setLogoUrl(null)}
          />
          <span className="font-serif font-bold text-xl tracking-tight text-foreground hidden sm:block">
            {companyName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          <Link
            href="/services"
            data-testid="nav-link-services"
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/services" ? "text-primary font-semibold" : "text-muted-foreground"}`}
          >
            Services
          </Link>

          {/* Work dropdown with flyout */}
          <div ref={workRef} className="relative" onMouseEnter={openWork} onMouseLeave={closeWork}>
            <button
              data-testid="nav-link-work"
              onClick={() => setWorkOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${isWorkActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
            >
              Work
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${workOpen ? "rotate-180" : ""}`} />
            </button>

            {workOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex z-50 shadow-xl"
                style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}
                onMouseEnter={openWork}
                onMouseLeave={closeWork}
              >
                {/* Left panel — top-level sections */}
                <div className="w-64 bg-background border border-border rounded-2xl py-2 shrink-0">
                  {workSections.map((s) => {
                    const hasSubCats = (s.subCategories ?? []).length > 0;
                    const isActive = activeSection === s.slug;
                    return (
                      <div
                        key={s.slug}
                        onPointerEnter={() => onSectionHover(s.slug, hasSubCats)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg mx-1 cursor-pointer transition-colors group ${isActive ? "bg-muted" : "hover:bg-muted"}`}
                      >
                        <Link
                          href={`/work/${s.slug}`}
                          className={`flex-1 text-sm leading-snug transition-colors group-hover:text-primary ${isActive ? "text-primary font-medium" : location === `/work/${s.slug}` ? "text-primary font-medium" : "text-muted-foreground"}`}
                        >
                          {s.label}
                        </Link>
                        {hasSubCats && (
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground/50 group-hover:text-primary/60"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right flyout panel — sub-categories */}
                {activeSectionData && (activeSectionData.subCategories ?? []).length > 0 && (
                  <div className="w-56 bg-background border border-border rounded-2xl py-2 ml-2 shrink-0">
                    <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {activeSectionData.label}
                    </p>
                    <div className="h-px bg-border mx-3 my-1" />
                    {buildTreeOrder(activeSectionData.subCategories).map(({ node, depth }) => (
                      <Link
                        key={node.slug}
                        href={`/work/${activeSectionData.slug}#${node.slug}`}
                        style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                        className={`block py-2 pr-4 text-sm transition-colors hover:bg-muted hover:text-primary leading-snug text-muted-foreground`}
                      >
                        {node.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {staticLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary font-semibold" : "text-muted-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA + Mobile hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/hire" data-testid="nav-link-hire-cta" className="hidden md:block">
            <Button size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90 px-6 font-semibold">
              Hire Us
            </Button>
          </Link>

          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 pb-5 pt-2">
          <nav className="flex flex-col">
            <Link
              href="/services"
              className={`py-3 text-sm font-medium border-b border-border/50 transition-colors hover:text-primary ${location === "/services" ? "text-primary" : "text-foreground"}`}
            >
              Services
            </Link>

            <div className="border-b border-border/50">
              <button
                onClick={() => setMobileWorkOpen((v) => !v)}
                className={`flex items-center justify-between w-full py-3 text-sm font-medium transition-colors hover:text-primary ${isWorkActive ? "text-primary" : "text-foreground"}`}
              >
                Work
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileWorkOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileWorkOpen && (
                <div className="flex flex-col pl-4 pb-2 gap-0.5">
                  {workSections.map((s) => {
                    const hasSubCats = (s.subCategories ?? []).length > 0;
                    const isExpanded = mobileExpandedSection === s.slug;
                    return (
                      <div key={s.slug}>
                        <div className="flex items-center justify-between pr-2">
                          <Link
                            href={`/work/${s.slug}`}
                            className={`flex-1 py-2 text-sm transition-colors hover:text-primary leading-snug ${location === `/work/${s.slug}` ? "text-primary font-medium" : "text-muted-foreground"}`}
                          >
                            {s.label}
                          </Link>
                          {hasSubCats && (
                            <button
                              onClick={() => setMobileExpandedSection(isExpanded ? null : s.slug)}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${s.label}`}
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>
                        {hasSubCats && isExpanded && (
                          <div className="flex flex-col pl-4 pb-1 gap-0.5 border-l border-border/50 ml-1 mb-1">
                            {buildTreeOrder(s.subCategories).map(({ node }) => (
                              <Link
                                key={node.slug}
                                href={`/work/${s.slug}#${node.slug}`}
                                className="py-1.5 text-xs transition-colors hover:text-primary text-muted-foreground/70 leading-snug"
                              >
                                {node.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {staticLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 text-sm font-medium border-b border-border/50 transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/hire" className="mt-4">
              <Button className="w-full rounded-full bg-primary text-white hover:bg-primary/90 font-semibold">
                Hire Us
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
