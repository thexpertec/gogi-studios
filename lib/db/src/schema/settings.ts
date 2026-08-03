import { pgTable, serial, text, jsonb } from "drizzle-orm/pg-core";

export interface SocialLink { platform: string; url: string; }

export const settingsTable = pgTable("settings", {
  id:                serial("id").primaryKey(),
  companyName:       text("company_name").notNull().default("Gogi Studios"),
  tagline:           text("tagline").notNull().default("Social Impact Communication — Since 1975"),
  footerDescription: text("footer_description").notNull().default(""),
  copyrightText:     text("copyright_text").notNull().default(""),
  email:             text("email").notNull().default(""),
  socialLinks:       jsonb("social_links").$type<SocialLink[]>().notNull().default([]),
});

export type Settings = typeof settingsTable.$inferSelect;
