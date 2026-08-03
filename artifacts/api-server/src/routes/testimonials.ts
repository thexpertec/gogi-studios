import { Router } from "express";
import { db, testimonialsTable } from "../lib/db";
import { eq, max } from "drizzle-orm";
import { deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/testimonials */
router.get("/testimonials", async (_req, res) => {
  try {
    const items = await db.select().from(testimonialsTable).orderBy(testimonialsTable.sortOrder);
    res.json({
      items: items.map((t) => ({ ...t, imageUrl: `/api/content-images/testimonials/${t.id}` })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load testimonials." });
  }
});

/** POST /api/testimonials */
router.post("/testimonials", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { caption } = req.body as { caption?: string };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }

  try {
    const [{ maxOrder }] = await db.select({ maxOrder: max(testimonialsTable.sortOrder) }).from(testimonialsTable);
    const nextOrder = (maxOrder ?? -1) + 1;
    // Generate id: tN where N = next integer
    const rows = await db.select({ id: testimonialsTable.id }).from(testimonialsTable);
    const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
    const id = `t${nextNum}`;

    const [item] = await db.insert(testimonialsTable).values({ id, caption: caption.trim(), sortOrder: nextOrder }).returning();
    res.json({ ok: true, item: { ...item, imageUrl: `/api/content-images/testimonials/${id}` } });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create testimonial." });
  }
});

/** PATCH /api/testimonials/:id */
router.patch("/testimonials/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { id } = req.params;
  const { caption } = req.body as { caption?: string };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }

  try {
    const [item] = await db.update(testimonialsTable).set({ caption: caption.trim() }).where(eq(testimonialsTable.id, id)).returning();
    if (!item) { res.status(404).json({ ok: false, error: "Testimonial not found." }); return; }
    res.json({ ok: true, item: { ...item, imageUrl: `/api/content-images/testimonials/${id}` } });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update testimonial." });
  }
});

/** DELETE /api/testimonials/:id */
router.delete("/testimonials/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { id } = req.params;

  try {
    const deleted = await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id)).returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Testimonial not found." }); return; }

    // Remove image from R2
    for (const ext of ["jpg", "png", "gif", "webp"]) {
      await deleteObject(`content-images/testimonials/${id}.${ext}`);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete testimonial." });
  }
});

export default router;
