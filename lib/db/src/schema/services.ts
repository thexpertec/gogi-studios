import { pgTable, text, boolean, integer } from "drizzle-orm/pg-core";

export const servicesTable = pgTable("services", {
  id:          text("id").primaryKey(),
  title:       text("title").notNull(),
  description: text("description").notNull().default(""),
  topService:  boolean("top_service").notNull().default(false),
  sortOrder:   integer("sort_order").notNull().default(0),
});

export type Service = typeof servicesTable.$inferSelect;
