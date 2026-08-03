// Work sections are managed dynamically via /api/work-sections.

export interface SubCategory {
  slug: string;
  label: string;
  parentSlug: string | null;
}

export interface WorkSection {
  slug: string;
  label: string;
  domain?: string;
  subCategories: SubCategory[];
}

/** Returns sub-categories in depth-first order with depth and full path label. */
export function buildTreeOrder(
  subCategories: SubCategory[]
): { node: SubCategory; depth: number; pathLabel: string }[] {
  const result: { node: SubCategory; depth: number; pathLabel: string }[] = [];

  function walk(parentSlug: string | null, depth: number, parentPath: string) {
    subCategories
      .filter((s) => s.parentSlug === parentSlug)
      .forEach((s) => {
        const pathLabel = parentPath ? `${parentPath} › ${s.label}` : s.label;
        result.push({ node: s, depth, pathLabel });
        walk(s.slug, depth + 1, pathLabel);
      });
  }

  walk(null, 0, "");
  return result;
}
