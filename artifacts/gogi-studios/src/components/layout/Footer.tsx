import {
  SiFacebook, SiInstagram, SiYoutube,
  SiX, SiTiktok, SiPinterest, SiWhatsapp, SiThreads,
} from "react-icons/si";
import { Link2, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const API = "/api";

export interface SocialLink {
  platform: string;
  url: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  facebook:  SiFacebook,
  instagram: SiInstagram,
  youtube:   SiYoutube,
  x:         SiX,
  tiktok:    SiTiktok,
  pinterest: SiPinterest,
  whatsapp:  SiWhatsapp,
  threads:   SiThreads,
};

interface FooterSettings {
  socialLinks: SocialLink[];
  companyName: string;
  footerDescription: string;
  copyrightText: string;
  email: string;
}

const DEFAULTS: FooterSettings = {
  socialLinks: [
    { platform: "facebook",  url: "https://facebook.com" },
    { platform: "instagram", url: "https://instagram.com" },
  ],
  companyName: "Gogi Studios",
  footerDescription:
    "Pakistan's leading social impact communication studio. Illustrated campaigns, animation, and training programs for NGOs, UN agencies, governments, and CSR programmes — since 1975.",
  copyrightText: "© 2026 Gogi Studios. All rights reserved.",
  email: "info@gogistudios.com",
};

export function Footer() {
  const [s, setS] = useState<FooterSettings>(DEFAULTS);

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setS({
          socialLinks: Array.isArray(data.socialLinks) && data.socialLinks.length > 0
            ? data.socialLinks
            : DEFAULTS.socialLinks,
          companyName:       data.companyName       || DEFAULTS.companyName,
          footerDescription: data.footerDescription || DEFAULTS.footerDescription,
          copyrightText:     data.copyrightText     || DEFAULTS.copyrightText,
          email:             data.email             || DEFAULTS.email,
        });
      })
      .catch(() => {});

    function onSettingsUpdated(e: Event) {
      const detail = (e as CustomEvent<Partial<FooterSettings>>).detail;
      if (!detail) return;
      setS((prev) => ({
        socialLinks: Array.isArray(detail.socialLinks) && detail.socialLinks.length > 0
          ? detail.socialLinks
          : prev.socialLinks,
        companyName:       detail.companyName       || prev.companyName,
        footerDescription: detail.footerDescription || prev.footerDescription,
        copyrightText:     detail.copyrightText     || prev.copyrightText,
        email:             detail.email             || prev.email,
      }));
    }
    window.addEventListener("settings-updated", onSettingsUpdated);
    return () => window.removeEventListener("settings-updated", onSettingsUpdated);
  }, []);

  return (
    <footer className="bg-foreground text-background mt-auto">
      {/* CTA Row */}
      <div className="border-b border-white/10 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-xl font-bold mb-1">Ready to commission a project?</p>
            <p className="text-background/60 text-sm">NGOs, governments, schools, and CSR teams — let's talk.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/hire" data-testid="footer-cta-hire">
              <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-6 font-semibold">
                Hire Us
              </Button>
            </Link>
            <a href={`mailto:${s.email}`} data-testid="footer-cta-email">
              <Button variant="outline" className="rounded-full px-5 border-white/20 text-background hover:bg-white/10">
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-serif text-2xl font-bold mb-3">{s.companyName}</h3>
          <p className="text-background/60 text-sm leading-relaxed max-w-sm mb-6">
            {s.footerDescription}
          </p>

          {/* Dynamic social icons */}
          <div className="flex gap-3 flex-wrap">
            {s.socialLinks.map((link, i) => {
              const Icon = PLATFORM_ICONS[link.platform] ?? Link2;
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-primary transition-colors"
                  data-testid={`link-social-${link.platform}`}
                  title={link.platform}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/50">Services</p>
          <ul className="space-y-2 text-sm">
            {[
              { label: "All Services", href: "/services" },
              { label: "Commission a Project", href: "/hire" },
              { label: "Speaking Engagements", href: "/hire" },
              { label: "Training Workshops", href: "/hire" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-background/65 hover:text-background transition-colors" data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-sm uppercase tracking-wider mb-4 text-background/50">Studio</p>
          <ul className="space-y-2 text-sm mb-6">
            {[
              { href: "/projects", label: "Our Work" },
              { href: "/awards", label: "Awards" },
              { href: "/blog", label: "News" },
              { href: "/books", label: "Books" },
              { href: "/merchandise", label: "Shop" },
            ].map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-background/65 hover:text-background transition-colors" data-testid={`footer-link-${l.label.toLowerCase()}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4">
          <p className="text-xs text-background/35" data-testid="text-copyright">
            {s.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
