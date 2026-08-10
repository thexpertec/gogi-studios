import { Router } from "express";
import { db, workGalleryTable } from "../lib/db";
import { eq, and, asc, max } from "drizzle-orm";
import { deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}
function isValidSlug(s: string): boolean {
  return /^[a-z0-9-]+$/.test(s) && s.length > 0 && s.length <= 100;
}

/** GET /api/work-gallery/:section */
router.get("/work-gallery/:section", async (req, res) => {
  const { section } = req.params;
  if (!isValidSlug(section)) { res.status(400).json({ error: "Invalid section slug." }); return; }

  try {
    const items = await db.select().from(workGalleryTable)
      .where(eq(workGalleryTable.sectionSlug, section))
      .orderBy(asc(workGalleryTable.sortOrder));
    res.json({
      items: items.map((i) => ({ ...i, imageUrl: `/api/content-images/work-${section}/${i.id}` })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load gallery." });
  }
});

/** POST /api/work-gallery/:section */
router.post("/work-gallery/:section", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { section } = req.params;
  if (!isValidSlug(section)) { res.status(400).json({ ok: false, error: "Invalid section slug." }); return; }
  const { caption, subCategorySlug, mediaType, videoUrl } = req.body as { caption?: string; subCategorySlug?: string | null; mediaType?: string; videoUrl?: string | null };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }
  const mType = (mediaType === "video") ? "video" : "image";
  if (mType === "video" && !videoUrl?.trim()) { res.status(400).json({ ok: false, error: "videoUrl is required for video items." }); return; }

  try {
    const [{ maxOrder }] = await db.select({ maxOrder: max(workGalleryTable.sortOrder) }).from(workGalleryTable).where(eq(workGalleryTable.sectionSlug, section));
    const rows = await db.select({ id: workGalleryTable.id }).from(workGalleryTable);
    const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const id = `g${nextNum}`;

    const [item] = await db.insert(workGalleryTable).values({
      id, sectionSlug: section, subCategorySlug: subCategorySlug ?? null,
      caption: caption.trim(), sortOrder: (maxOrder ?? -1) + 1,
      mediaType: mType, videoUrl: mType === "video" ? (videoUrl?.trim() ?? null) : null,
    }).returning();
    res.json({ ok: true, item: { ...item, imageUrl: `/api/content-images/work-${section}/${id}` } });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create gallery item." });
  }
});

/** PUT /api/work-gallery/:section/reorder — admin; { ids: [...] } full ordered list for the section */
router.put("/work-gallery/:section/reorder", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { section } = req.params;
  if (!isValidSlug(section)) { res.status(400).json({ ok: false, error: "Invalid section slug." }); return; }
  const { ids } = req.body as { ids?: unknown };
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string")) {
    res.status(400).json({ ok: false, error: "ids must be an array of strings." }); return;
  }
  if (new Set(ids).size !== ids.length) {
    res.status(400).json({ ok: false, error: "ids must be unique." }); return;
  }
  try {
    const existing = await db.select({ id: workGalleryTable.id }).from(workGalleryTable)
      .where(eq(workGalleryTable.sectionSlug, section));
    const existingIds = new Set(existing.map((r) => r.id));
    if (ids.length !== existingIds.size || ids.some((i) => !existingIds.has(i as string))) {
      res.status(400).json({ ok: false, error: "ids must contain every item in the section exactly once." }); return;
    }
    for (let i = 0; i < ids.length; i++) {
      await db.update(workGalleryTable).set({ sortOrder: i })
        .where(and(eq(workGalleryTable.id, ids[i] as string), eq(workGalleryTable.sectionSlug, section)));
    }
    const items = await db.select().from(workGalleryTable)
      .where(eq(workGalleryTable.sectionSlug, section))
      .orderBy(asc(workGalleryTable.sortOrder));
    res.json({ ok: true, items: items.map((i) => ({ ...i, imageUrl: `/api/content-images/work-${section}/${i.id}` })) });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to reorder gallery items." });
  }
});

/** PATCH /api/work-gallery/:section/:id */
router.patch("/work-gallery/:section/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { section, id } = req.params;
  const { caption, subCategorySlug, mediaType, videoUrl } = req.body as { caption?: string; subCategorySlug?: string | null; mediaType?: string; videoUrl?: string | null };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }

  try {
    const update: any = { caption: caption.trim() };
    if (subCategorySlug !== undefined) update.subCategorySlug = subCategorySlug ?? null;
    if (mediaType !== undefined) { update.mediaType = mediaType === "video" ? "video" : "image"; update.videoUrl = mediaType === "video" ? (videoUrl?.trim() ?? null) : null; }
    const [item] = await db.update(workGalleryTable).set(update)
      .where(and(eq(workGalleryTable.id, id), eq(workGalleryTable.sectionSlug, section)))
      .returning();
    if (!item) { res.status(404).json({ ok: false, error: "Item not found." }); return; }
    res.json({ ok: true, item: { ...item, imageUrl: `/api/content-images/work-${section}/${id}` } });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update gallery item." });
  }
});

/** DELETE /api/work-gallery/:section/:id */
router.delete("/work-gallery/:section/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { section, id } = req.params;

  try {
    const deleted = await db.delete(workGalleryTable)
      .where(and(eq(workGalleryTable.id, id), eq(workGalleryTable.sectionSlug, section)))
      .returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Item not found." }); return; }
    for (const ext of ["jpg", "png", "gif", "webp"]) {
      await deleteObject(`content-images/work-${section}/${id}.${ext}`);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete gallery item." });
  }
});

export default router;
