import { Router } from "express";
import {
  readFileSync, writeFileSync, existsSync, mkdirSync,
  readdirSync, unlinkSync,
} from "fs";
import { join } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const IMAGES_DIR = join(process.cwd(), "data", "images");

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

function typeDir(type: string): string {
  const dir = join(IMAGES_DIR, type);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function findFile(type: string, id: string): string | null {
  const dir = join(IMAGES_DIR, type);
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.startsWith(`${id}.`));
  return files.length > 0 ? join(dir, files[0]) : null;
}

/** GET /api/content-images — public; returns { "books/1": "/api/content-images/books/1", ... } */
router.get("/content-images", (_req, res) => {
  const map: Record<string, string> = {};
  if (!existsSync(IMAGES_DIR)) { res.json(map); return; }
  for (const entry of readdirSync(IMAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !isAllowedType(entry.name)) continue;
    const type = entry.name;
    const dir = join(IMAGES_DIR, type);
    for (const file of readdirSync(dir)) {
      const id = file.replace(/\.[^.]+$/, "");
      map[`${type}/${id}`] = `/api/content-images/${type}/${id}`;
    }
  }
  res.json(map);
});

/** GET /api/content-images/:type/:id — serve a specific image */
router.get("/content-images/:type/:id", (req, res) => {
  const { type, id } = req.params;
  if (!isAllowedType(type)) {
    res.status(400).json({ error: "Invalid type." });
    return;
  }
  const filePath = findFile(type, id);
  if (!filePath) {
    res.status(404).json({ error: "Not found." });
    return;
  }
  const ext = filePath.split(".").pop() ?? "jpg";
  res.setHeader("Content-Type", EXT_TO_MIME[ext] ?? "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.send(readFileSync(filePath));
});

/** POST /api/content-images/:type/:id — admin only; { data: base64, mimeType } */
router.post("/content-images/:type/:id", (req, res) => {
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
    const dir = typeDir(type);
    // Remove any previous file for this id (could have different extension)
    const existing = readdirSync(dir).filter((f) => f.startsWith(`${id}.`));
    for (const f of existing) unlinkSync(join(dir, f));
    // Write new file
    writeFileSync(join(dir, `${id}.${ext}`), Buffer.from(data, "base64"));
    res.json({ ok: true, url: `/api/content-images/${type}/${id}` });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to save image." });
  }
});

export default router;
