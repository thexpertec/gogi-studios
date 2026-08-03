import { Router } from "express";
import { db, testimonialsTable } from "../lib/db";
import { eq, max } from "drizzle-orm";
import { putObject, deleteObject } from "../lib/r2";

const router = Router();
const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";

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

/** Derive the next auto-generated testimonial id (t1, t2, …) */
async function nextTestimonialId(): Promise<{ id: string; sortOrder: number }> {
  const [rows, [{ maxOrder }]] = await Promise.all([
    db.select({ id: testimonialsTable.id }).from(testimonialsTable),
    db.select({ maxOrder: max(testimonialsTable.sortOrder) }).from(testimonialsTable),
  ]);
  const nums = rows
    .map((r) => parseInt(r.id.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
  return { id: `t${nextNum}`, sortOrder: (maxOrder ?? -1) + 1 };
}

/** DELETE all known-extension R2 objects for a testimonial image key */
async function purgeTestimonialImage(id: string): Promise<void> {
  await Promise.allSettled(
    ["jpg", "png", "gif", "webp"].map((ext) =>
      deleteObject(`content-images/testimonials/${id}.${ext}`),
    ),
  );
}

// ──────────────────────────────────────────────────────────
// GET /api/testimonials
// ──────────────────────────────────────────────────────────
router.get("/testimonials", async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(testimonialsTable)
      .orderBy(testimonialsTable.sortOrder);
    res.json({
      items: items.map((t) => ({
        ...t,
        imageUrl: `/api/content-images/testimonials/${t.id}`,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load testimonials." });
  }
});

// ──────────────────────────────────────────────────────────
// POST /api/testimonials
//   Body: { caption, imageData?: base64, imageMimeType?: string }
//
//   Atomic guarantee:
//     1. If imageData provided → upload to R2 first.
//     2. Insert DB row.
//     3. If DB fails and image was already uploaded → delete it from R2.
//   Result: either both are saved, or neither is.
// ──────────────────────────────────────────────────────────
router.post("/testimonials", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }

  const { caption, imageData, imageMimeType } = req.body as {
    caption?: string;
    imageData?: string;
    imageMimeType?: string;
  };

  if (!caption?.trim()) {
    res.status(400).json({ ok: false, error: "caption is required." });
    return;
  }

  // Validate image fields when provided
  let imageExt: string | undefined;
  if (imageData !== undefined || imageMimeType !== undefined) {
    if (!imageData || !imageMimeType) {
      res.status(400).json({ ok: false, error: "Both imageData and imageMimeType are required when uploading an image." });
      return;
    }
    imageExt = MIME_TO_EXT[imageMimeType];
    if (!imageExt) {
      res.status(400).json({ ok: false, error: "Unsupported image type. Use JPEG, PNG, GIF, or WebP." });
      return;
    }
  }

  let imageUploaded = false;
  let assignedId = "";

  try {
    const { id, sortOrder } = await nextTestimonialId();
    assignedId = id;
    const r2Key = `content-images/testimonials/${id}.${imageExt}`;

    // ── Step 1: upload image to R2 (if provided) ──────────────────────
    if (imageData && imageExt) {
      const buffer = Buffer.from(imageData, "base64");
      await putObject(r2Key, buffer, imageMimeType!);
      imageUploaded = true;
    }

    // ── Step 2: insert DB row ─────────────────────────────────────────
    let item;
    try {
      [item] = await db
        .insert(testimonialsTable)
        .values({ id, caption: caption.trim(), sortOrder })
        .returning();
    } catch (dbErr) {
      // DB failed → roll back R2 upload so nothing is half-saved
      if (imageUploaded) await purgeTestimonialImage(id);
      throw dbErr;
    }

    res.json({
      ok: true,
      item: { ...item, imageUrl: `/api/content-images/testimonials/${id}` },
    });
  } catch (err: any) {
    // If we uploaded to R2 but then something else blew up, clean up
    if (imageUploaded && assignedId) await purgeTestimonialImage(assignedId).catch(() => {});
    console.error("POST /testimonials error:", err);
    res.status(500).json({ ok: false, error: "Failed to create testimonial." });
  }
});

// ──────────────────────────────────────────────────────────
// PATCH /api/testimonials/:id  — caption only
// ──────────────────────────────────────────────────────────
router.patch("/testimonials/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  const { id } = req.params;
  const { caption } = req.body as { caption?: string };
  if (!caption?.trim()) {
    res.status(400).json({ ok: false, error: "caption is required." });
    return;
  }

  try {
    const [item] = await db
      .update(testimonialsTable)
      .set({ caption: caption.trim() })
      .where(eq(testimonialsTable.id, id))
      .returning();
    if (!item) {
      res.status(404).json({ ok: false, error: "Testimonial not found." });
      return;
    }
    res.json({
      ok: true,
      item: { ...item, imageUrl: `/api/content-images/testimonials/${id}` },
    });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to update testimonial." });
  }
});

// ──────────────────────────────────────────────────────────
// DELETE /api/testimonials/:id
//   Deletes DB row first, then purges R2 images.
//   R2 cleanup failures are logged but do NOT fail the request
//   (the important thing is the DB row is gone; orphaned R2
//   objects are harmless and can be manually cleaned up).
// ──────────────────────────────────────────────────────────
router.delete("/testimonials/:id", async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }
  const { id } = req.params;

  try {
    const deleted = await db
      .delete(testimonialsTable)
      .where(eq(testimonialsTable.id, id))
      .returning();
    if (!deleted.length) {
      res.status(404).json({ ok: false, error: "Testimonial not found." });
      return;
    }

    // Best-effort R2 cleanup — fire-and-forget; don't await to keep response fast
    purgeTestimonialImage(id).catch((e) =>
      console.error(`R2 cleanup failed for testimonials/${id}:`, e),
    );

    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to delete testimonial." });
  }
});

export default router;
