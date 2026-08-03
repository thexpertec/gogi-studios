import { Router } from "express";
import { db, settingsTable } from "../lib/db";
import { eq } from "drizzle-orm";
import { putObject, getObject, deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

const ALLOWED_MIME: Record<string, string> = {
  "image/png":     "png",
  "image/jpeg":    "jpg",
  "image/jpg":     "jpg",
  "image/gif":     "gif",
  "image/webp":    "webp",
  "image/svg+xml": "svg",
};

/** GET /api/settings */
router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable).limit(1);
    if (!rows.length) {
      res.json({ companyName: "Gogi Studios", tagline: "", footerDescription: "", copyrightText: "", email: "", socialLinks: [], navLinks: [] });
      return;
    }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to load settings." });
  }
});

/** PUT /api/settings */
router.put("/settings", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const body = req.body as any;

  if (body.socialLinks !== undefined) {
    if (!Array.isArray(body.socialLinks)) { res.status(400).json({ ok: false, error: "socialLinks must be an array." }); return; }
    for (const link of body.socialLinks) {
      if (typeof link.platform !== "string" || typeof link.url !== "string") {
        res.status(400).json({ ok: false, error: "Each social link needs platform and url strings." }); return;
      }
    }
  }

  if (body.navLinks !== undefined) {
    if (!Array.isArray(body.navLinks)) { res.status(400).json({ ok: false, error: "navLinks must be an array." }); return; }
    for (const link of body.navLinks) {
      if (typeof link.label !== "string" || typeof link.href !== "string") {
        res.status(400).json({ ok: false, error: "Each nav link needs label and href strings." }); return;
      }
    }
  }

  try {
    const update: Record<string, any> = {};
    if (body.socialLinks       !== undefined) update.socialLinks       = body.socialLinks;
    if (body.navLinks          !== undefined) update.navLinks          = body.navLinks;
    if (typeof body.companyName       === "string") update.companyName       = body.companyName;
    if (typeof body.tagline           === "string") update.tagline           = body.tagline;
    if (typeof body.footerDescription === "string") update.footerDescription = body.footerDescription;
    if (typeof body.copyrightText     === "string") update.copyrightText     = body.copyrightText;
    if (typeof body.email             === "string") update.email             = body.email;

    // UPSERT: create the row if it doesn't exist yet, otherwise update it.
    await db
      .insert(settingsTable)
      .values({ id: 1, ...update })
      .onConflictDoUpdate({ target: settingsTable.id, set: update });
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.id, 1)).limit(1);
    res.json({ ok: true, settings: rows[0] });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to save settings." });
  }
});

/** POST /api/logo */
router.post("/logo", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { data, mimeType } = req.body as { data?: string; mimeType?: string };
  if (!data || !mimeType) { res.status(400).json({ ok: false, error: "data and mimeType are required." }); return; }
  const ext = ALLOWED_MIME[mimeType];
  if (!ext) { res.status(400).json({ ok: false, error: "Unsupported image type." }); return; }

  try {
    for (const oldExt of Object.values(ALLOWED_MIME)) {
      await deleteObject(`logo/logo.${oldExt}`);
    }
    await putObject(`logo/logo.${ext}`, Buffer.from(data, "base64"), mimeType);
    res.json({ ok: true, url: "/api/logo" });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to save logo." });
  }
});

/** GET /api/logo */
router.get("/logo", async (_req, res) => {
  try {
    for (const ext of Object.values(ALLOWED_MIME)) {
      const obj = await getObject(`logo/logo.${ext}`);
      if (obj) {
        res.setHeader("Content-Type", obj.contentType);
        res.setHeader("Cache-Control", "public, max-age=60");
        res.send(obj.body);
        return;
      }
    }
    res.status(404).json({ error: "No custom logo." });
  } catch {
    res.status(500).json({ error: "Failed to serve logo." });
  }
});

export default router;
