import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const catalogBooksTable = pgTable("catalog_books", {
  id:          text("id").primaryKey(),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
  price:       text("price").notNull().default(""),
  priceUsd:    text("price_usd").notNull().default(""),
  featured:    boolean("featured").notNull().default(false),
});

export const catalogMerchandiseTable = pgTable("catalog_merchandise", {
  id:          text("id").primaryKey(),
  name:        text("name").notNull(),
  price:       text("price").notNull().default(""),
  tag:         text("tag"),
  description: text("description").notNull().default(""),
});

export const catalogProjectsTable = pgTable("catalog_projects", {
  id:          text("id").primaryKey(),
  name:        text("name").notNull(),
  description: text("description").notNull().default(""),
});

export type CatalogBook        = typeof catalogBooksTable.$inferSelect;
export type CatalogMerchandise = typeof catalogMerchandiseTable.$inferSelect;
export type CatalogProject     = typeof catalogProjectsTable.$inferSelect;
