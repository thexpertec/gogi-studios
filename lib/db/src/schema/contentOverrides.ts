import { pgTable, text } from "drizzle-orm/pg-core";

export const contentOverridesTable = pgTable("content_overrides", {
  id:    text("id").primaryKey(),
  value: text("value").notNull(),
});

export type ContentOverride = typeof contentOverridesTable.$inferSelect;
