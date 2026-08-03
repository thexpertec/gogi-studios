import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const workGalleryTable = pgTable("work_gallery", {
  id:              text("id").primaryKey(),
  sectionSlug:     text("section_slug").notNull(),
  subCategorySlug: text("sub_category_slug"),
  caption:         text("caption").notNull(),
  sortOrder:       integer("sort_order").notNull().default(0),
  mediaType:       text("media_type").notNull().default("image"), // "image" | "video"
  videoUrl:        text("video_url"),                             // YouTube / Vimeo / direct URL
});

export type WorkGalleryItem = typeof workGalleryTable.$inferSelect;
