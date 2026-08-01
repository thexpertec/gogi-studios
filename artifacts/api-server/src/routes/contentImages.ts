import { Router } from "express";
import { putObject, getObject, deleteObject, listKeys } from "../lib/r2";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

const STATIC_TYPES = ["books", "merchandise", "projects", "testimonials"] as const;

/** Allow static types plus any work-<slug> type for dynamic gallery sections */
function isAllowedType(type: string): boolean {
  if ((STATIC_TYPES as readonly string[]).includes(type)) return true;
  if (/^work-[a-z0-9-]+$/.test(type)) return true;
  return false;
}

const MIME_TO_EXT: Record<string, string> = {
  "image/png":  "png",
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/gif":  "gif",
  "image/webp": "webp",
};

const EXT_TO_MIME: Record<string, string> = {
  png:  "image/png",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  gif:  "image/gif",
  webp: "image/webp",
};

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

function r2Key(type: string, id: string, ext: string): string {
  return `content-images/${type}/${id}.${ext}`;
}

function r2Prefix(type: string): string {
  return `content-images/${type}/`;
}

/** GET /api/content-images — public; returns { "books/1": "/api/content-images/books/1", ... } */
router.get("/content-images", async (_req, res) => {
  try {
    const map: Record<string, string> = {};
    const allTypes = [...STATIC_TYPES];
    // Also list work-* prefixes by scanning the r2 prefix
    const workKeys = await listKeys("content-images/work-");
    const workTypes = new Set<string>();
    for (const key of workKeys) {
      const parts = key.split("/");
      if (parts.length >= 2) workTypes.add(parts[1]);
    }

    for (const type of [...allTypes, ...workTypes]) {
      const keys = await listKeys(r2Prefix(type));
      for (const key of keys) {
        const filename = key.split("/").pop() ?? "";
        const id = filename.replace(/\.[^.]+$/, "");
        if (id) map[`${type}/${id}`] = `/api/content-images/${type}/${id}`;
      }
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: "Failed to list images." });
  }
});

/** GET /api/content-images/:type/:id — serve a specific image */
router.get("/content-images/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (!isAllowedType(type)) {
    res.status(400).json({ error: "Invalid type." });
    return;
  }

  // Try each supported extension
  const exts = ["jpg", "png", "gif", "webp"];
  for (const ext of exts) {
    const obj = await getObject(r2Key(type, id, ext));
    if (obj) {
      res.setHeader("Content-Type", obj.contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(obj.body);
      return;
    }
  }

  res.status(404).json({ error: "Not found." });
});

/** POST /api/content-images/:type/:id — admin only; { data: base64, mimeType } */
router.post("/content-images/:type/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  const { type, id } = req.params;
  if (!isAllowedType(type)) {
    res.status(400).json({ ok: false, error: "Invalid type." });
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
    // Remove any previous object for this id (could have different extension)
    for (const oldExt of Object.values(MIME_TO_EXT)) {
      await deleteObject(r2Key(type, id, oldExt));
    }

    const buffer = Buffer.from(data, "base64");
    await putObject(r2Key(type, id, ext), buffer, mimeType);

    res.json({ ok: true, url: `/api/content-images/${type}/${id}` });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to save image." });
  }
});

/** DELETE /api/content-images/:type/:id — admin only */
router.delete("/content-images/:type/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  const { type, id } = req.params;
  if (!isAllowedType(type)) {
    res.status(400).json({ ok: false, error: "Invalid type." });
    return;
  }

  try {
    for (const ext of Object.values(MIME_TO_EXT)) {
      await deleteObject(r2Key(type, id, ext));
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete image." });
  }
});

export default router;
