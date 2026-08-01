import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const TESTIMONIALS_PATH = join(process.cwd(), "data", "testimonials.json");

interface TestimonialItem {
  id: string;
  caption: string;
}

interface TestimonialsStore {
  items: TestimonialItem[];
  _nextId: number;
}

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

function readStore(): TestimonialsStore {
  try {
    if (existsSync(TESTIMONIALS_PATH)) {
      return JSON.parse(readFileSync(TESTIMONIALS_PATH, "utf-8")) as TestimonialsStore;
    }
  } catch {}
  return { items: [], _nextId: 1 };
}

function writeStore(store: TestimonialsStore): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(TESTIMONIALS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/** GET /api/testimonials — public; returns items with imageUrl if available */
router.get("/testimonials", (_req, res) => {
  const store = readStore();
  const items = store.items.map((item) => ({
    ...item,
    imageUrl: `/api/content-images/testimonials/${item.id}`,
  }));
  res.json({ items });
});

/** POST /api/testimonials — admin only; { caption: string } */
router.post("/testimonials", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { caption } = req.body as { caption?: string };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }
  const store = readStore();
  const id = `t${store._nextId}`;
  store._nextId += 1;
  store.items.push({ id, caption: caption.trim() });
  writeStore(store);
  res.json({ ok: true, item: { id, caption: caption.trim(), imageUrl: `/api/content-images/testimonials/${id}` } });
});

/** PATCH /api/testimonials/:id — admin only; { caption: string } */
router.patch("/testimonials/:id", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { id } = req.params;
  const { caption } = req.body as { caption?: string };
  if (!caption?.trim()) { res.status(400).json({ ok: false, error: "caption is required." }); return; }

  const store = readStore();
  const idx = store.items.findIndex((i) => i.id === id);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Testimonial not found." }); return; }

  store.items[idx] = { ...store.items[idx], caption: caption.trim() };
  writeStore(store);
  res.json({ ok: true, item: store.items[idx] });
});

/** DELETE /api/testimonials/:id — admin only; also removes the associated image */
router.delete("/testimonials/:id", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { id } = req.params;

  const store = readStore();
  const before = store.items.length;
  store.items = store.items.filter((i) => i.id !== id);
  if (store.items.length === before) { res.status(404).json({ ok: false, error: "Testimonial not found." }); return; }
  writeStore(store);

  // Remove associated image file if present
  const imgDir = join(process.cwd(), "data", "images", "testimonials");
  if (existsSync(imgDir)) {
    try {
      const files = readdirSync(imgDir).filter((f) => f.startsWith(`${id}.`));
      for (const f of files) unlinkSync(join(imgDir, f));
    } catch {}
  }

  res.json({ ok: true });
});

export default router;
