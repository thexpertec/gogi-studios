import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const CATALOG_PATH = join(process.cwd(), "data", "catalog.json");

const ALLOWED_TYPES = ["books", "merchandise", "projects"] as const;
type CatalogType = (typeof ALLOWED_TYPES)[number];

export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  priceUsd?: string;
  tag?: string | null;
  featured?: boolean;
}

interface Catalog {
  books: CatalogItem[];
  merchandise: CatalogItem[];
  projects: CatalogItem[];
  _nextId: number;
}

/** Hardcoded seed data — used only to populate catalog.json on first run */
const SEED: Record<CatalogType, CatalogItem[]> = {
  books: [
    { id: "1", name: "Gogi Goes to School",         description: "A heartwarming tale of Gogi's first day navigating school life.",           price: "PKR 450",   priceUsd: "$16" },
    { id: "2", name: "Gogi and the Water Crisis",    description: "Teaching children the importance of water conservation.",                    price: "PKR 500",   priceUsd: "$18" },
    { id: "3", name: "Gogi's Big Adventure",         description: "An epic journey exploring the cultural heritage of Pakistan.",               price: "PKR 550",   priceUsd: "$20" },
    { id: "4", name: "Gogi Saves the Day",           description: "Gogi uses wit and humor to solve a community problem.",                      price: "PKR 450",   priceUsd: "$16" },
    { id: "5", name: "Gogi and the Climate",         description: "Understanding climate change through the eyes of Gogi.",                     price: "PKR 500",   priceUsd: "$18" },
    { id: "6", name: "The Complete Gogi Collection", description: "All five iconic Gogi books in one beautiful boxed set — the perfect gift.", price: "PKR 2,000", priceUsd: "$72", featured: true },
  ],
  merchandise: [
    { id: "1", name: "Gogi Classic Tote Bag",    price: "$25", tag: "Best Seller", description: "Sturdy canvas tote with the iconic Gogi character print." },
    { id: "2", name: "Gogi Enamel Pin Set",       price: "$15", tag: null,         description: "Set of 4 collectible enamel pins featuring Gogi expressions." },
    { id: "3", name: "Gogi Studios Art Print",    price: "$40", tag: "Popular",    description: "Museum-quality 8x10 art print, ready to frame." },
    { id: "4", name: "Gogi Coffee Mug",           price: "$20", tag: null,         description: "Start your morning with Gogi. Ceramic, dishwasher-safe." },
    { id: "5", name: "Gogi Notebook",             price: "$18", tag: null,         description: "Ruled notebook with illustrated Gogi cover art, 160 pages." },
    { id: "6", name: "Gogi Sticker Pack",         price: "$10", tag: "New",        description: "12 high-quality vinyl stickers — waterproof and vibrant." },
    { id: "7", name: "Gogi Tee — Classic Black",  price: "$35", tag: "New",        description: "100% cotton unisex tee with embroidered Gogi Studios logo." },
    { id: "8", name: "Gogi Gift Bundle",          price: "$75", tag: "Gift Idea",  description: "Tote, mug, sticker pack and art print — everything Gogi in one box." },
  ],
  projects: [
    { id: "1", name: '"Gogi" Comic Strip Series',    description: "Pakistan's longest-running female-led comic strip" },
    { id: "2", name: "Bus No.1 Campaign",            description: "Climate change awareness through art on public transport" },
    { id: "3", name: "NUST Mural Project",           description: "Large-scale campus artwork inspiring students" },
    { id: "4", name: "Beaconhouse School Program",   description: "Art education outreach for the next generation" },
    { id: "5", name: "UN SDG Awareness Campaign",    description: "Sustainable development through illustration and storytelling" },
  ],
};

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

function readCatalog(): Catalog {
  try {
    if (existsSync(CATALOG_PATH)) {
      return JSON.parse(readFileSync(CATALOG_PATH, "utf-8")) as Catalog;
    }
  } catch {}
  return { books: [], merchandise: [], projects: [], _nextId: 1 };
}

function writeCatalog(catalog: Catalog): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");
}

/**
 * Prepend any seed items whose IDs are not already present in the catalog.
 * Idempotent — safe to call on both fresh installs and upgrades.
 * Returns true if any items were added.
 */
function seedIfNeeded(catalog: Catalog): boolean {
  let changed = false;
  for (const type of ALLOWED_TYPES) {
    const existingIds = new Set(catalog[type].map((i) => i.id));
    const missing = SEED[type].filter((item) => !existingIds.has(item.id));
    if (missing.length > 0) {
      catalog[type] = [...missing, ...catalog[type]];
      changed = true;
    }
  }
  return changed;
}

/** GET /api/catalog — public; seeds on first run then returns all items per type */
router.get("/catalog", (_req, res) => {
  const c = readCatalog();
  if (seedIfNeeded(c)) writeCatalog(c);
  res.json({ books: c.books, merchandise: c.merchandise, projects: c.projects });
});

/** POST /api/catalog/:type — admin only; { name: string } → appends a new item */
router.post("/catalog/:type", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }
  const { name } = req.body as { name?: string };
  if (!name?.trim()) { res.status(400).json({ ok: false, error: "name is required." }); return; }

  const catalog = readCatalog();
  const id = `d${catalog._nextId}`;
  catalog._nextId += 1;
  catalog[type as CatalogType].push({ id, name: name.trim() });
  writeCatalog(catalog);
  res.json({ ok: true, item: { id, name: name.trim() } });
});

/** PATCH /api/catalog/:type/:id — admin only; { name: string } → renames an item */
router.patch("/catalog/:type/:id", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type, id } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }
  const { name } = req.body as { name?: string };
  if (!name?.trim()) { res.status(400).json({ ok: false, error: "name is required." }); return; }

  const catalog = readCatalog();
  // Ensure seed items are present so they can be renamed
  seedIfNeeded(catalog);
  const items = catalog[type as CatalogType];
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Item not found." }); return; }

  items[idx] = { ...items[idx], name: name.trim() };
  writeCatalog(catalog);
  res.json({ ok: true, item: items[idx] });
});

/** DELETE /api/catalog/:type/:id — admin only; also removes the associated cover image */
router.delete("/catalog/:type/:id", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { type, id } = req.params;
  if (!ALLOWED_TYPES.includes(type as CatalogType)) { res.status(400).json({ ok: false, error: "Invalid type." }); return; }

  const catalog = readCatalog();
  // Ensure seed items are present so they can be deleted
  seedIfNeeded(catalog);
  const before = catalog[type as CatalogType].length;
  catalog[type as CatalogType] = catalog[type as CatalogType].filter((i) => i.id !== id);
  if (catalog[type as CatalogType].length === before) { res.status(404).json({ ok: false, error: "Item not found." }); return; }
  writeCatalog(catalog);

  // Remove associated cover image file if present
  const imgDir = join(process.cwd(), "data", "images", type);
  if (existsSync(imgDir)) {
    try {
      const files = readdirSync(imgDir).filter((f) => f.startsWith(`${id}.`));
      for (const f of files) unlinkSync(join(imgDir, f));
    } catch {}
  }

  res.json({ ok: true });
});

export default router;
