import { Router } from "express";
import { db, workSectionsTable, workSubCategoriesTable } from "../lib/db";
import { eq, asc, max } from "drizzle-orm";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}
function isValidSlug(s: string): boolean {
  return /^[a-z0-9-]+$/.test(s) && s.length > 0 && s.length <= 100;
}

/** GET /api/work-sections — public; returns sections with nested subCategories */
router.get("/work-sections", async (_req, res) => {
  try {
    const [sections, subCats] = await Promise.all([
      db.select().from(workSectionsTable).orderBy(asc(workSectionsTable.sortOrder)),
      db.select().from(workSubCategoriesTable).orderBy(asc(workSubCategoriesTable.sortOrder)),
    ]);
    const result = sections.map((s) => ({
      slug: s.slug,
      label: s.label,
      subCategories: subCats
        .filter((sc) => sc.sectionSlug === s.slug)
        .map((sc) => ({ slug: sc.slug, label: sc.label, parentSlug: sc.parentSlug ?? null })),
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to load work sections." });
  }
});

/** POST /api/work-sections — admin; { slug, label } */
router.post("/work-sections", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug, label } = req.body as { slug?: string; label?: string };
  if (!slug?.trim() || !label?.trim()) { res.status(400).json({ ok: false, error: "slug and label are required." }); return; }
  if (!isValidSlug(slug.trim())) { res.status(400).json({ ok: false, error: "Invalid slug." }); return; }

  try {
    const [{ maxOrder }] = await db.select({ maxOrder: max(workSectionsTable.sortOrder) }).from(workSectionsTable);
    const [section] = await db.insert(workSectionsTable).values({ slug: slug.trim(), label: label.trim(), sortOrder: (maxOrder ?? -1) + 1 }).returning();
    res.json({ ok: true, section: { ...section, subCategories: [] } });
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ ok: false, error: "Slug already exists." }); return; }
    res.status(500).json({ ok: false, error: "Failed to create section." });
  }
});

/** PATCH /api/work-sections/:slug — admin; { label } */
router.patch("/work-sections/:slug", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug } = req.params;
  const { label } = req.body as { label?: string };
  if (!label?.trim()) { res.status(400).json({ ok: false, error: "label is required." }); return; }

  try {
    const [updated] = await db.update(workSectionsTable).set({ label: label.trim() }).where(eq(workSectionsTable.slug, slug)).returning();
    if (!updated) { res.status(404).json({ ok: false, error: "Section not found." }); return; }
    res.json({ ok: true, section: updated });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update section." });
  }
});

/** DELETE /api/work-sections/:slug — admin */
router.delete("/work-sections/:slug", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug } = req.params;

  try {
    const deleted = await db.delete(workSectionsTable).where(eq(workSectionsTable.slug, slug)).returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Section not found." }); return; }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete section." });
  }
});

/** POST /api/work-sections/:slug/sub-categories — admin; { slug, label, parentSlug? } */
router.post("/work-sections/:slug/sub-categories", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug: sectionSlug } = req.params;
  const { slug, label, parentSlug } = req.body as { slug?: string; label?: string; parentSlug?: string | null };
  if (!slug?.trim() || !label?.trim()) { res.status(400).json({ ok: false, error: "slug and label are required." }); return; }
  if (!isValidSlug(slug.trim())) { res.status(400).json({ ok: false, error: "Invalid slug." }); return; }

  try {
    const [{ maxOrder }] = await db.select({ maxOrder: max(workSubCategoriesTable.sortOrder) }).from(workSubCategoriesTable).where(eq(workSubCategoriesTable.sectionSlug, sectionSlug));
    const [sub] = await db.insert(workSubCategoriesTable).values({
      slug: slug.trim(), label: label.trim(), sectionSlug,
      parentSlug: parentSlug ?? null, sortOrder: (maxOrder ?? -1) + 1,
    }).returning();
    res.json({ ok: true, subCategory: sub });
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ ok: false, error: "Slug already exists." }); return; }
    res.status(500).json({ ok: false, error: "Failed to create sub-category." });
  }
});

/** DELETE /api/work-sections/:slug/sub-categories/:subSlug — admin */
router.delete("/work-sections/:slug/sub-categories/:subSlug", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { subSlug } = req.params;

  try {
    const deleted = await db.delete(workSubCategoriesTable).where(eq(workSubCategoriesTable.slug, subSlug)).returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Sub-category not found." }); return; }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete sub-category." });
  }
});

export default router;
