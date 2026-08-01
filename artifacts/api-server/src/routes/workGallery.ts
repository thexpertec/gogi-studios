import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const GALLERY_PATH = join(process.cwd(), "data", "work-gallery.json");

interface GalleryItem {
  id: string;
  caption: string;
  subCategorySlug?: string | null;
}

interface GalleryStore {
  sections: Record<string, GalleryItem[]>;
  _nextId: number;
}

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100;
}

function readStore(): GalleryStore {
  try {
    if (existsSync(GALLERY_PATH)) {
      return JSON.parse(readFileSync(GALLERY_PATH, "utf-8")) as GalleryStore;
    }
  } catch {}
  return { sections: {}, _nextId: 1 };
}

function writeStore(store: GalleryStore): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(GALLERY_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/** GET /api/work-gallery/:section — public */
router.get("/work-gallery/:section", (req, res) => {
  const { section } = req.params;
  if (!isValidSlug(section)) { res.status(400).json({ error: "Invalid section slug." }); return; }
  const store = readStore();
  const items = (store.sections[section] ?? []).map((item) => ({
    ...item,
    imageUrl: `/api/content-images/work-${section}/${item.id}`,
  }));
  res.json({ items });
});

/** POST /api/work-gallery/:section — admin only; { caption, subCategorySlug? } */
router.post("/work-gallery/:section", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { section } = req.params;
  if (!isValidSlug(section)) { res.status(400).json({ ok: false, error: "Invalid section slug." }); return; }
  const { caption, subCategorySlug } = req.body as { caption?: string; subCategorySlug?: string | null };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }
  const store = readStore();
  const id = `g${store._nextId}`;
  store._nextId += 1;
  if (!store.sections[section]) store.sections[section] = [];
  const item: GalleryItem = { id, caption: caption.trim() };
  if (subCategorySlug) item.subCategorySlug = subCategorySlug;
  store.sections[section].push(item);
  writeStore(store);
  res.json({ ok: true, item });
});

export default router;
