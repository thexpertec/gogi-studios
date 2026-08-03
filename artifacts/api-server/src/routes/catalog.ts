import { Router } from "express";
import { db, catalogBooksTable, catalogMerchandiseTable, catalogProjectsTable } from "../lib/db";
import { eq, max } from "drizzle-orm";
import { deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

const ALLOWED_TYPES = ["books", "merchandise", "projects"] as const;
type CatalogType = (typeof ALLOWED_TYPES)[number];

const TABLE_MAP = {
  books:       catalogBooksTable,
  merchandise: catalogMerchandiseTable,
  projects:    catalogProjectsTable,
} as const;

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/catalog/:type */
router.get("/catalog/:type", async (req, res) => {
  const { type } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ error: "Invalid type." }); return; }

  try {
    const items = await db.select().from(TABLE_MAP[type as CatalogType]);
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to load catalog." });
  }
});

/** POST /api/catalog/:type — admin; { name, description?, price?, priceUsd?, tag?, featured? } */
router.post("/catalog/:type", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }
  const { name, description, price, priceUsd, tag, featured } = req.body as any;
  if (!name?.trim()) { res.status(400).json({ ok: false, error: "name is required." }); return; }

  try {
    const table = TABLE_MAP[type as CatalogType];
    const rows  = await db.select({ id: (table as any).id }).from(table as any);
    const nums  = rows.map((r: any) => parseInt(r.id, 10)).filter((n: number) => !isNaN(n));
    const nextId = String(nums.length ? Math.max(...nums) + 1 : 1);

    const base = { id: nextId, name: name.trim(), description: description?.trim() ?? "" };
    let item: any;

    if (type === "books") {
      [item] = await db.insert(catalogBooksTable).values({ ...base, price: price ?? "", priceUsd: priceUsd ?? "", featured: featured ?? false }).returning();
    } else if (type === "merchandise") {
      [item] = await db.insert(catalogMerchandiseTable).values({ ...base, price: price ?? "", tag: tag ?? null }).returning();
    } else {
      [item] = await db.insert(catalogProjectsTable).values(base).returning();
    }
    res.json({ ok: true, item });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create item." });
  }
});

/** PATCH /api/catalog/:type/:id — admin; partial update */
router.patch("/catalog/:type/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type, id } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }
  const body = req.body as any;
  if (!body.name?.trim()) { res.status(400).json({ ok: false, error: "name is required." }); return; }

  try {
    const update: any = { name: body.name.trim() };
    if (body.description !== undefined) update.description = body.description;
    if (body.price       !== undefined) update.price       = body.price;
    if (body.priceUsd    !== undefined) update.priceUsd    = body.priceUsd;
    if (body.tag         !== undefined) update.tag         = body.tag;
    if (body.featured    !== undefined) update.featured    = body.featured;

    const table = TABLE_MAP[type as CatalogType];
    const [item] = await (db.update(table as any).set(update).where(eq((table as any).id, id)) as any).returning();
    if (!item) { res.status(404).json({ ok: false, error: "Item not found." }); return; }
    res.json({ ok: true, item });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update item." });
  }
});

/** DELETE /api/catalog/:type/:id — admin */
router.delete("/catalog/:type/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type, id } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }

  try {
    const table = TABLE_MAP[type as CatalogType];
    const deleted = await (db.delete(table as any).where(eq((table as any).id, id)) as any).returning();
    if (!deleted.length) { res.status(404).json({ ok: false, error: "Item not found." }); return; }

    // Remove R2 cover image
    for (const ext of ["jpg", "png", "gif", "webp"]) {
      await deleteObject(`content-images/${type}/${id}.${ext}`);
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete item." });
  }
});

export default router;
