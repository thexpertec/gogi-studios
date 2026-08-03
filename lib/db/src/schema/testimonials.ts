import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const testimonialsTable = pgTable("testimonials", {
  id:        text("id").primaryKey(),
  caption:   text("caption").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Testimonial = typeof testimonialsTable.$inferSelect;
