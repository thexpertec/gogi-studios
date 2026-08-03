import { Router } from "express";
import { putObject, getObject, deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

const LOGO_KEY_PREFIX = "logo/logo";
const EXTS = ["png", "jpg", "jpeg", "gif", "webp"] as const;
const MIME_TO_EXT: Record<string, string> = {
  "image/png":  "png",
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/gif":  "gif",
  "image/webp": "webp",
};

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/logo — public; serves the logo image from R2 */
router.get("/logo", async (_req, res) => {
  for (const ext of EXTS) {
    const obj = await getObject(`${LOGO_KEY_PREFIX}.${ext}`);
    if (obj) {
      res.setHeader("Content-Type", obj.contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(obj.body);
      return;
    }
  }
  res.status(404).json({ error: "No logo uploaded yet." });
});

/** POST /api/logo — admin only; { data: base64, mimeType } */
router.post("/logo", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  const { data, mimeType } = req.body as { data?: string; mimeType?: string };
  if (!data || !mimeType) {
    res.status(400).json({ ok: false, error: "data and mimeType are required." });
    return;
  }
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    res.status(400).json({ ok: false, error: "Unsupported image type." });
    return;
  }

  try {
    // Remove any previously stored logo (any extension)
    for (const e of EXTS) {
      await deleteObject(`${LOGO_KEY_PREFIX}.${e}`);
    }
    const buffer = Buffer.from(data, "base64");
    await putObject(`${LOGO_KEY_PREFIX}.${ext}`, buffer, mimeType);
    res.json({ ok: true, url: "/api/logo" });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to save logo." });
  }
});

/** DELETE /api/logo — admin only */
router.delete("/logo", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  try {
    for (const e of EXTS) {
      await deleteObject(`${LOGO_KEY_PREFIX}.${e}`);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete logo." });
  }
});

export default router;
