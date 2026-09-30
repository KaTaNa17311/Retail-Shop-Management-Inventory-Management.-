import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const parties = sqliteTable("parties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["supplier", "farmer", "retailer"] }).notNull(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  phone: text("phone").notNull().default(""),
  gstin: text("gstin").notNull().default(""),
  balance: real("balance").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  hsn: text("hsn").notNull(),
  batch: text("batch").notNull(),
  expiry: text("expiry").notNull(),
  unit: text("unit").notNull(),
  stock: real("stock").notNull().default(0),
  purchaseRate: real("purchase_rate").notNull().default(0),
  saleRate: real("sale_rate").notNull().default(0),
  gstRate: real("gst_rate").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const vouchers = sqliteTable("vouchers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voucherNo: text("voucher_no").notNull().unique(),
  type: text("type", { enum: ["purchase", "sale", "payment", "receipt"] }).notNull(),
  partyName: text("party_name").notNull(),
  itemName: text("item_name").notNull().default(""),
  quantity: real("quantity").notNull().default(0),
  taxableValue: real("taxable_value").notNull().default(0),
  taxAmount: real("tax_amount").notNull().default(0),
  total: real("total").notNull().default(0),
  status: text("status").notNull().default("Credit"),
  voucherDate: text("voucher_date").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  action: text("action").notNull(),
  module: text("module").notNull(),
  recordRef: text("record_ref").notNull(),
  detail: text("detail").notNull(),
  actor: text("actor").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
