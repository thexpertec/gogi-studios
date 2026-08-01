import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

const SETTINGS_PATH = join(process.cwd(), "data", "settings.json");
const LOGO_META_PATH = join(process.cwd(), "data", "logo-meta.json");

function dataDir() {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  socialLinks: SocialLink[];
  companyName: string;
  tagline: string;
  footerDescription: string;
  copyrightText: string;
  email: string;
}

export const DEFAULTS: SiteSettings = {
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com" },
    { platform: "instagram", url: "https://instagram.com" },
  ],
  companyName: "Gogi Studios",
  tagline: "Social Impact Communication — Since 1975",
  footerDescription:
    "Pakistan's leading social impact communication studio. Illustrated campaigns, animation, and training programs for NGOs, UN agencies, governments, and CSR programmes — since 1975.",
  copyrightText: "© 2026 Gogi Studios. All rights reserved.",
  email: "info@gogistudios.com",
};

function readSettings(): SiteSettings {
  try {
    if (existsSync(SETTINGS_PATH)) {
      const parsed = JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"));
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // fall back to defaults on parse error
  }
  return { ...DEFAULTS };
}

function writeSettings(data: SiteSettings): void {
  dataDir();
  writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/settings — public */
router.get("/settings", (_req, res) => {
  res.json(readSettings());
});

/** PUT /api/settings — admin only; accepts any subset of SiteSettings fields */
router.put("/settings", (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }

  const body = req.body as Partial<SiteSettings>;

  // Validate socialLinks if provided
  if (body.socialLinks !== undefined) {
    if (!Array.isArray(body.socialLinks)) {
      res.status(400).json({ ok: false, error: "socialLinks must be an array." });
      return;
    }
    for (const link of body.socialLinks) {
      if (typeof link.platform !== "string" || typeof link.url !== "string") {
        res.status(400).json({ ok: false, error: "Each social link needs platform and url strings." });
        return;
      }
    }
  }

  const current = readSettings();
  // Merge: only overwrite fields that are explicitly provided
  const updated: SiteSettings = { ...current };
  if (body.socialLinks !== undefined) updated.socialLinks = body.socialLinks;
  if (typeof body.companyName === "string") updated.companyName = body.companyName;
  if (typeof body.tagline === "string") updated.tagline = body.tagline;
  if (typeof body.footerDescription === "string") updated.footerDescription = body.footerDescription;
  if (typeof body.copyrightText === "string") updated.copyrightText = body.copyrightText;
  if (typeof body.email === "string") updated.email = body.email;

  writeSettings(updated);
  res.json({ ok: true, settings: updated });
});

/** POST /api/logo — admin only; body: { data: base64String, mimeType: string } */
router.post("/logo", (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }

  const { data, mimeType } = req.body as { data?: string; mimeType?: string };
  if (!data || !mimeType) {
    res.status(400).json({ ok: false, error: "data and mimeType are required." });
    return;
  }

  const allowedTypes: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const ext = allowedTypes[mimeType];
  if (!ext) {
    res.status(400).json({ ok: false, error: "Unsupported image type." });
    return;
  }

  try {
    const dir = dataDir();
    const logoPath = join(dir, `logo.${ext}`);
    const buffer = Buffer.from(data, "base64");
    writeFileSync(logoPath, buffer);
    // Save metadata so GET /api/logo knows which file to serve
    writeFileSync(LOGO_META_PATH, JSON.stringify({ file: `logo.${ext}`, mimeType }), "utf-8");
    res.json({ ok: true, url: "/api/logo" });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to save logo." });
  }
});

/** GET /api/logo — public; 404 if no custom logo uploaded */
router.get("/logo", (_req, res) => {
  try {
    if (!existsSync(LOGO_META_PATH)) {
      res.status(404).json({ error: "No custom logo." });
      return;
    }
    const meta = JSON.parse(readFileSync(LOGO_META_PATH, "utf-8")) as { file: string; mimeType: string };
    const logoPath = join(process.cwd(), "data", meta.file);
    if (!existsSync(logoPath)) {
      res.status(404).json({ error: "Logo file missing." });
      return;
    }
    res.setHeader("Content-Type", meta.mimeType);
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(readFileSync(logoPath));
  } catch {
    res.status(500).json({ error: "Failed to serve logo." });
  }
});

export default router;
