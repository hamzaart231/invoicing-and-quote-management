import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  serial,
  uniqueIndex,
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

  userId: integer("user_id")
    .references(() => users.id),

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

  userId: integer("user_id")
    .references(() => users.id),

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

export const documents = pgTable(
  "documents",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .references(() => users.id),

    type: text("type")
      .notNull(),

    /*
     * Document number is no longer
     * globally unique.
     *
     * The unique index below makes it
     * unique only inside each account.
     */
    number: text("number")
      .notNull(),

    date: text("date")
      .notNull(),

    dueDate: text("due_date")
      .default(""),

    /* Client snapshot */

    clientName: text("client_name")
      .notNull()
      .default(""),

    clientPhone: text("client_phone")
      .default(""),

    clientEmail: text("client_email")
      .default(""),

    clientAddress: text("client_address")
      .default(""),

    /* Items */

    items: jsonb("items")
      .notNull()
      .default([]),

    /* Tax */

    taxRate: decimal(
      "tax_rate",
      {
        precision: 5,
        scale: 2,
      }
    )
      .notNull()
      .default("20"),

    /* Discount */

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

    /* Status */

    status: text("status")
      .notNull()
      .default("draft"),

    /* Template */

    template: text("template")
      .notNull()
      .default("classic"),

    /* Language */

    language: text("language")
      .notNull()
      .default("ar"),

    /* Currency */

    currency: text("currency")
      .notNull()
      .default("USD"),

    /* Notes */

    notes: text("notes")
      .default(""),

    /* Quote conversion */

    convertedFrom: integer(
      "converted_from"
    )
      .default(0),

    /* Timestamps */

    createdAt: timestamp(
      "created_at"
    )
      .defaultNow(),

    updatedAt: timestamp(
      "updated_at"
    )
      .defaultNow(),
  },
  (table) => [
    uniqueIndex(
      "documents_user_id_number_unique"
    ).on(
      table.userId,
      table.number
    ),
  ]
);

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
