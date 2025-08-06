import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // Checking, Savings, Credit Card, etc.
  owner: text("owner").notNull(),
  identifier: text("identifier").notNull(), // Account number or identifier
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => accounts.id),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  originalDescription: text("original_description").notNull(),
  currentDescription: text("current_description"),
  transactor: text("transactor"), // Counterparty
  
  // Classification fields
  classification: text("classification"), // Income, Expense
  paymentMedium: text("payment_medium"), // Bank Transfer, Card Payment, etc.
  processType: text("process_type"), // Automated, Manual
  schedule: text("schedule"), // Recurring, Ad Hoc
  statutoryType: text("statutory_type"), // Income, Mandatory, Voluntary
  
  // Flags
  isDeleted: boolean("is_deleted").default(false),
  isActual: boolean("is_actual").default(true),
  isBudgetItem: boolean("is_budget_item").default(false),
  isInteraccount: boolean("is_interaccount").default(false),
  isIncomeStatement: boolean("is_income_statement").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactors = pgTable("transactors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  category: text("category"), // Optional categorization
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactorSchema = createInsertSchema(transactors).omit({
  id: true,
  createdAt: true,
});

// Update schemas
export const updateTransactionSchema = insertTransactionSchema.partial();

// Types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;

export type Transactor = typeof transactors.$inferSelect;
export type InsertTransactor = z.infer<typeof insertTransactorSchema>;

// Enums for classification options
export const CLASSIFICATION_OPTIONS = ["Income", "Expense"] as const;
export const PAYMENT_MEDIUM_OPTIONS = [
  "Bank Transfer",
  "Card Payment", 
  "Debit Order",
  "Cash Payment",
  "Cheque",
  "Valuation",
  "System Generated",
  "Interaccount Transfer"
] as const;
export const PROCESS_TYPE_OPTIONS = ["Automated", "Manual"] as const;
export const SCHEDULE_OPTIONS = ["Recurring", "Ad Hoc"] as const;
export const STATUTORY_TYPE_OPTIONS = ["Income", "Mandatory", "Voluntary"] as const;
export const ACCOUNT_TYPE_OPTIONS = ["Checking", "Savings", "Credit Card", "Investment", "Loan"] as const;
