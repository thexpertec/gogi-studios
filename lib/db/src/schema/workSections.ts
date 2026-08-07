import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const workSectionsTable = pgTable("work_sections", {
  slug:      text("slug").primaryKey(),
  label:     text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  domain:    text("domain").notNull().default("work"), // "work" | "services" | "awards" | "news" | "books" | "shop"
});

export const workSubCategoriesTable = pgTable("work_sub_categories", {
  slug:        text("slug").primaryKey(),
  label:       text("label").notNull(),
  description: text("description"),
  sectionSlug: text("section_slug").notNull().references(() => workSectionsTable.slug, { onDelete: "cascade" }),
  parentSlug:  text("parent_slug"),
  sortOrder:   integer("sort_order").notNull().default(0),
});

export type WorkSection     = typeof workSectionsTable.$inferSelect;
export type WorkSubCategory = typeof workSubCategoriesTable.$inferSelect;
