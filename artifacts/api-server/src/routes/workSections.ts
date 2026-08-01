import { Router } from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const router = Router();

const COOKIE_NAME = "gogi_admin_session";
const COOKIE_VALUE = "authenticated";
const SECTIONS_PATH = join(process.cwd(), "data", "work-sections.json");

export interface SubCategory {
  slug: string;
  label: string;
  parentSlug: string | null;
}

export interface WorkSection {
  slug: string;
  label: string;
  subCategories: SubCategory[];
}

interface SectionsStore {
  sections: WorkSection[];
}

const DEFAULT_SECTIONS: WorkSection[] = [
  { slug: "social-awareness",   label: "Social Awareness Campaigns",          subCategories: [] },
  { slug: "animation-videos",   label: "Animation & Explainer Videos",        subCategories: [] },
  { slug: "bcc-content",        label: "BCC Content",                         subCategories: [] },
  { slug: "workshops-training", label: "Workshops & Training Manuals & Guides", subCategories: [] },
];

function isAdmin(req: any): boolean {
  return req.signedCookies?.[COOKIE_NAME] === COOKIE_VALUE;
}

function readStore(): SectionsStore {
  try {
    if (existsSync(SECTIONS_PATH)) {
      const raw = JSON.parse(readFileSync(SECTIONS_PATH, "utf-8")) as SectionsStore;
      // Migrate: ensure each section has subCategories array
      raw.sections = raw.sections.map((s) => ({ ...s, subCategories: s.subCategories ?? [] }));
      return raw;
    }
  } catch {}
  return { sections: DEFAULT_SECTIONS };
}

function writeStore(store: SectionsStore): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(SECTIONS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Work sections ────────────────────────────────────────────────────────────

/** GET /api/work-sections — public */
router.get("/work-sections", (_req, res) => {
  const store = readStore();
  res.json(store.sections);
});

/** POST /api/work-sections — admin; { label } */
router.post("/work-sections", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { label } = req.body as { label?: string };
  if (!label?.trim()) { res.status(400).json({ ok: false, error: "label is required." }); return; }

  let slug = slugify(label.trim());
  if (!slug) { res.status(400).json({ ok: false, error: "Could not generate a valid slug." }); return; }

  const store = readStore();
  if (store.sections.some((s) => s.slug === slug)) {
    let n = 2;
    while (store.sections.some((s) => s.slug === `${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }

  const section: WorkSection = { slug, label: label.trim(), subCategories: [] };
  store.sections.push(section);
  writeStore(store);
  res.json({ ok: true, section });
});

/** PATCH /api/work-sections/:slug — admin; { label } */
router.patch("/work-sections/:slug", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug } = req.params;
  const { label } = req.body as { label?: string };
  if (!label?.trim()) { res.status(400).json({ ok: false, error: "label is required." }); return; }

  const store = readStore();
  const idx = store.sections.findIndex((s) => s.slug === slug);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Section not found." }); return; }

  store.sections[idx] = { ...store.sections[idx], label: label.trim() };
  writeStore(store);
  res.json({ ok: true, section: store.sections[idx] });
});

/** DELETE /api/work-sections/:slug — admin */
router.delete("/work-sections/:slug", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { slug } = req.params;

  const store = readStore();
  const before = store.sections.length;
  store.sections = store.sections.filter((s) => s.slug !== slug);
  if (store.sections.length === before) { res.status(404).json({ ok: false, error: "Section not found." }); return; }

  writeStore(store);
  res.json({ ok: true });
});

// ─── Sub-categories ───────────────────────────────────────────────────────────

/** POST /api/work-sections/:sectionSlug/sub-categories — admin; { label, parentSlug? } */
router.post("/work-sections/:sectionSlug/sub-categories", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { sectionSlug } = req.params;
  const { label, parentSlug } = req.body as { label?: string; parentSlug?: string | null };
  if (!label?.trim()) { res.status(400).json({ ok: false, error: "label is required." }); return; }

  const store = readStore();
  const sectionIdx = store.sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIdx === -1) { res.status(404).json({ ok: false, error: "Section not found." }); return; }

  const section = store.sections[sectionIdx];

  if (parentSlug && !section.subCategories.some((s) => s.slug === parentSlug)) {
    res.status(400).json({ ok: false, error: "Parent sub-category not found." }); return;
  }

  let slug = slugify(label.trim());
  if (!slug) { res.status(400).json({ ok: false, error: "Could not generate a valid slug." }); return; }

  if (section.subCategories.some((s) => s.slug === slug)) {
    let n = 2;
    while (section.subCategories.some((s) => s.slug === `${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }

  const sub: SubCategory = { slug, label: label.trim(), parentSlug: parentSlug ?? null };
  section.subCategories.push(sub);
  store.sections[sectionIdx] = section;
  writeStore(store);
  res.json({ ok: true, subCategory: sub });
});

/** PATCH /api/work-sections/:sectionSlug/sub-categories/:subSlug — admin; { label } */
router.patch("/work-sections/:sectionSlug/sub-categories/:subSlug", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { sectionSlug, subSlug } = req.params;
  const { label } = req.body as { label?: string };
  if (!label?.trim()) { res.status(400).json({ ok: false, error: "label is required." }); return; }

  const store = readStore();
  const sectionIdx = store.sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIdx === -1) { res.status(404).json({ ok: false, error: "Section not found." }); return; }

  const section = store.sections[sectionIdx];
  const subIdx = section.subCategories.findIndex((s) => s.slug === subSlug);
  if (subIdx === -1) { res.status(404).json({ ok: false, error: "Sub-category not found." }); return; }

  section.subCategories[subIdx] = { ...section.subCategories[subIdx], label: label.trim() };
  store.sections[sectionIdx] = section;
  writeStore(store);
  res.json({ ok: true, subCategory: section.subCategories[subIdx] });
});

/** DELETE /api/work-sections/:sectionSlug/sub-categories/:subSlug — admin; cascades children */
router.delete("/work-sections/:sectionSlug/sub-categories/:subSlug", (req, res) => {
  if (!isAdmin(req)) { res.status(401).json({ ok: false, error: "Unauthorized." }); return; }
  const { sectionSlug, subSlug } = req.params;

  const store = readStore();
  const sectionIdx = store.sections.findIndex((s) => s.slug === sectionSlug);
  if (sectionIdx === -1) { res.status(404).json({ ok: false, error: "Section not found." }); return; }

  const section = store.sections[sectionIdx];
  if (!section.subCategories.some((s) => s.slug === subSlug)) {
    res.status(404).json({ ok: false, error: "Sub-category not found." }); return;
  }

  function collectDescendants(slug: string): string[] {
    const children = section.subCategories.filter((s) => s.parentSlug === slug).map((s) => s.slug);
    return [slug, ...children.flatMap((c) => collectDescendants(c))];
  }
  const toDelete = new Set(collectDescendants(subSlug));

  section.subCategories = section.subCategories.filter((s) => !toDelete.has(s.slug));
  store.sections[sectionIdx] = section;
  writeStore(store);
  res.json({ ok: true, deleted: [...toDelete] });
});

export default router;
