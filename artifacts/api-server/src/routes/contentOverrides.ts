import { Router } from "express";
import { db, contentOverridesTable } from "../lib/db";
import { inArray, sql } from "drizzle-orm";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

/** GET /api/content-overrides — public; returns { overrides: { [id]: value } } */
router.get("/content-overrides", async (_req, res) => {
  try {
    const rows = await db.select().from(contentOverridesTable);
    const overrides: Record<string, string> = {};
    for (const row of rows) overrides[row.id] = row.value;
    res.json({ overrides });
  } catch {
    res.status(500).json({ error: "Failed to load content overrides." });
  }
});

/** PUT /api/content-overrides — admin; { set?: Record<string,string>, remove?: string[], clear?: boolean } */
router.put("/content-overrides", async (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { set, remove, clear } = req.body as {
    set?: Record<string, string>;
    remove?: string[];
    clear?: boolean;
  };

  try {
    if (clear === true) {
      await db.delete(contentOverridesTable);
    }
    if (set && typeof set === "object") {
      const entries = Object.entries(set).filter(
        ([k, v]) => typeof k === "string" && k.length > 0 && typeof v === "string",
      );
      for (const [id, value] of entries) {
        await db
          .insert(contentOverridesTable)
          .values({ id, value })
          .onConflictDoUpdate({
            target: contentOverridesTable.id,
            set: { value: sql`excluded.value` },
          });
      }
    }
    if (Array.isArray(remove) && remove.length > 0) {
      const ids = remove.filter((k) => typeof k === "string" && k.length > 0);
      if (ids.length > 0) {
        await db.delete(contentOverridesTable).where(inArray(contentOverridesTable.id, ids));
      }
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to save content overrides." });
  }
});

export default router;
