import { pgTable, text, integer, decimal, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";

export const company = pgTable("company", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  ice: text("ice").notNull().default(""),
  logo: text("logo").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").default(""),
  address: text("address").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'invoice' | 'quote'
  number: text("number").notNull().unique(),
  date: text("date").notNull(),
  dueDate: text("due_date").default(""),
  clientName: text("client_name").notNull().default(""),
  clientPhone: text("client_phone").default(""),
  clientEmail: text("client_email").default(""),
  clientAddress: text("client_address").default(""),
  items: jsonb("items").notNull().default([]),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  discountType: text("discount_type").notNull().default("fixed"), // 'fixed' | 'percent'
  status: text("status").notNull().default("draft"),
  template: text("template").notNull().default("classic"), // 'classic' | 'modern' | 'minimal'
  language: text("language").notNull().default("ar"), // 'ar' | 'fr' | 'en'
  notes: text("notes").default(""),
  convertedFrom: integer("converted_from").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Company = typeof company.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type NewClient = typeof clients.$inferInsert;
