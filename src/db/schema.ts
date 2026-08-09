import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

/* =========================
   USERS TABLE
========================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: text("name")
    .notNull()
    .default(""),

  email: text("email")
    .notNull()
    .unique(),

  /*
   * Never store the original password.
   * Only the password hash is stored.
   */
  passwordHash: text("password_hash")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

/* =========================
   COMPANY TABLE
========================= */

export const company = pgTable("company", {
  id: serial("id").primaryKey(),

  name: text("name")
    .notNull()
    .default(""),

  address: text("address")
    .notNull()
    .default(""),

  phone: text("phone")
    .notNull()
    .default(""),

  email: text("email")
    .notNull()
    .default(""),

  ice: text("ice")
    .notNull()
    .default(""),

  logo: text("logo")
    .default(""),

  // Default company currency
  currency: text("currency")
    .notNull()
    .default("USD"),

  createdAt: timestamp("created_at")
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .defaultNow(),
});

/* =========================
   CLIENTS TABLE
========================= */

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),

  name: text("name")
    .notNull(),

  phone: text("phone")
    .notNull()
    .default(""),

  email: text("email")
    .default(""),

  address: text("address")
    .default(""),

  createdAt: timestamp("created_at")
    .defaultNow(),
});

/* =========================
   DOCUMENTS TABLE
========================= */

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),

  type: text("type")
    .notNull(),

  number: text("number")
    .notNull()
    .unique(),

  date: text("date")
    .notNull(),

  dueDate: text("due_date")
    .default(""),

  /* =====================
     Client snapshot
  ===================== */

  clientName: text("client_name")
    .notNull()
    .default(""),

  clientPhone: text("client_phone")
    .default(""),

  clientEmail: text("client_email")
    .default(""),

  clientAddress: text("client_address")
    .default(""),

  /* =====================
     Items
  ===================== */

  items: jsonb("items")
    .notNull()
    .default([]),

  /* =====================
     Tax
  ===================== */

  taxRate: decimal(
    "tax_rate",
    {
      precision: 5,
      scale: 2,
    }
  )
    .notNull()
    .default("20"),

  /* =====================
     Discount
  ===================== */

  discount: decimal(
    "discount",
    {
      precision: 10,
      scale: 2,
    }
  )
    .notNull()
    .default("0"),

  discountType: text(
    "discount_type"
  )
    .notNull()
    .default("fixed"),

  /* =====================
     Status
  ===================== */

  status: text("status")
    .notNull()
    .default("draft"),

  /* =====================
     Template
  ===================== */

  template: text("template")
    .notNull()
    .default("classic"),

  /* =====================
     Language
  ===================== */

  language: text("language")
    .notNull()
    .default("ar"),

  /* =====================
     Currency
  ===================== */

  currency: text("currency")
    .notNull()
    .default("USD"),

  /* =====================
     Notes
  ===================== */

  notes: text("notes")
    .default(""),

  /* =====================
     Quote conversion
  ===================== */

  convertedFrom: integer(
    "converted_from"
  )
    .default(0),

  /* =====================
     Timestamps
  ===================== */

  createdAt: timestamp(
    "created_at"
  )
    .defaultNow(),

  updatedAt: timestamp(
    "updated_at"
  )
    .defaultNow(),
});

/* =========================
   TYPES
========================= */

export type User =
  typeof users.$inferSelect;

export type NewUser =
  typeof users.$inferInsert;

export type Company =
  typeof company.$inferSelect;

export type Client =
  typeof clients.$inferSelect;

export type Document =
  typeof documents.$inferSelect;

export type NewDocument =
  typeof documents.$inferInsert;

export type NewClient =
  typeof clients.$inferInsert;
