import { Router } from "express";
import { db, servicesTable } from "../lib/db";
import { eq, asc } from "drizzle-orm";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/services — public, ordered */
router.get("/services", async (_req, res) => {
  try {
    const items = await db.select().from(servicesTable).orderBy(asc(servicesTable.sortOrder));
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to load services." });
  }
});

/** POST /api/services — admin; { title, description?, topService? } */
router.post("/services", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { title, description, topService } = req.body as any;
  if (typeof title !== "string" || !title.trim()) { res.status(400).json({ ok: false, error: "title is required." }); return; }

  try {
    const rows = await db.select({ id: servicesTable.id, sortOrder: servicesTable.sortOrder }).from(servicesTable);
    const nums = rows.map((r) => parseInt(r.id.replace(/^s/, ""), 10)).filter((n) => !isNaN(n));
    const nextId = `s${nums.length ? Math.max(...nums) + 1 : 1}`;
    const nextOrder = rows.length ? Math.max(...rows.map((r) => r.sortOrder)) + 1 : 0;
    const [item] = await db.insert(servicesTable).values({
      id: nextId,
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      topService: !!topService,
      sortOrder: nextOrder,
    }).returning();
    res.json({ ok: true, item });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create service." });
  }
});

/** PATCH /api/services/:id — admin; partial { title?, description?, topService? } */
router.patch("/services/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const body = req.body as any;
  const update: any = {};
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) { res.status(400).json({ ok: false, error: "title cannot be empty." }); return; }
    update.title = body.title.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string") { res.status(400).json({ ok: false, error: "description must be a string." }); return; }
    update.description = body.description;
  }
  if (body.topService !== undefined) update.topService = !!body.topService;
  if (!Object.keys(update).length) { res.status(400).json({ ok: false, error: "Nothing to update." }); return; }

  try {
    const [item] = await db.update(servicesTable).set(update).where(eq(servicesTable.id, req.params.id)).returning();
    if (!item) { res.status(404).json({ ok: false, error: "Service not found." }); return; }
    res.json({ ok: true, item });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update service." });
  }
});

/** PUT /api/services/reorder — admin; { ids: ["s3","s1",...] } full ordered list */
router.put("/services/reorder", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { ids } = req.body as any;
  if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string")) {
    res.status(400).json({ ok: false, error: "ids must be an array of strings." }); return;
  }
  if (new Set(ids).size !== ids.length) {
    res.status(400).json({ ok: false, error: "ids must be unique." }); return;
  }
  try {
    const existing = await db.select({ id: servicesTable.id }).from(servicesTable);
    const existingIds = new Set(existing.map((r) => r.id));
    if (ids.length !== existingIds.size || ids.some((i) => !existingIds.has(i))) {
      res.status(400).json({ ok: false, error: "ids must contain every service exactly once." }); return;
    }
    for (let i = 0; i < ids.length; i++) {
      await db.update(servicesTable).set({ sortOrder: i }).where(eq(servicesTable.id, ids[i]));
    }
    const items = await db.select().from(servicesTable).orderBy(asc(servicesTable.sortOrder));
    res.json({ ok: true, items });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to reorder services." });
  }
});

/** DELETE /api/services/:id — admin */
router.delete("/services/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  try {
    const deleted = await db.delete(servicesTable).where(eq(servicesTable.id, req.params.id)).returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Service not found." }); return; }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete service." });
  }
});

export default router;
