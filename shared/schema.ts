import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  decimal, 
  date,
  varchar,
  jsonb,
  uuid,
  index,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for future auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication and role management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: text("password"), // hashed password for local auth
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  legalEntityType: text("legal_entity_type").notNull(),
  taxId: text("tax_id").notNull(),
  registeredAddress: text("registered_address").notNull(),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  fiscalYearStart: date("fiscal_year_start").notNull(),
  fiscalYearEnd: date("fiscal_year_end").notNull(),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  billingAddress: text("billing_address"),
  shippingAddress: text("shipping_address"),
  paymentTerms: text("payment_terms").notNull().default("Net 30"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0.00"),
  openingBalanceDate: date("opening_balance_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  billingAddress: text("billing_address"),
  defaultPaymentMethod: text("default_payment_method").default("Bank Transfer"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0.00"),
  openingBalanceDate: date("opening_balance_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank Accounts table
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  accountType: text("account_type").notNull().default("CHECKING"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0.00"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chart of Accounts
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // Asset, Liability, Equity, Revenue, Expense
  parentAccountId: integer("parent_account_id").references(() => chartOfAccounts.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  transactionNumber: text("transaction_number").notNull(),
  transactionDate: date("transaction_date").notNull(),
  transactionType: text("transaction_type").notNull(), // PAYMENT, INVOICE, BILL, EXPENSE, REVENUE
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledDate: timestamp("reconciled_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Journal Entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  accountId: integer("account_id").references(() => chartOfAccounts.id).notNull(),
  description: text("description").notNull(),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default("0.00"),
  entryDate: date("entry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("PENDING"), // PENDING, PAID, OVERDUE, CANCELLED
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bills table
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  billNumber: text("bill_number").notNull(),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("PENDING"), // PENDING, PAID, OVERDUE, CANCELLED
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense Categories table
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  mainAccountType: text("main_account_type"), // Main account type from QuickBooks classification
  detailType: text("detail_type"), // Specific detail type within main account type
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bank Statement Uploads table
export const bankStatementUploads = pgTable("bank_statement_uploads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id).notNull(),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(), // CSV, OFX, QIF
  uploadDate: timestamp("upload_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  status: text("status").notNull().default("PENDING"), // PENDING, PROCESSED, FAILED
  totalRows: integer("total_rows"),
  processedRows: integer("processed_rows"),
  errorMessage: text("error_message"),
  csvData: text("csv_data"), // Store the raw CSV data
  createdAt: timestamp("created_at").defaultNow(),
});

// Bank Statement Transactions table - for individual bank statement entries
export const bankStatementTransactions = pgTable("bank_statement_transactions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  bankAccountId: integer("bank_account_id").references(() => bankAccounts.id).notNull(),
  bankStatementUploadId: integer("bank_statement_upload_id").references(() => bankStatementUploads.id).notNull(),
  transactionDate: date("transaction_date").notNull(),
  description: text("description").notNull(),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default("0.00"),
  runningBalance: decimal("running_balance", { precision: 10, scale: 2 }).default("0.00"),
  // Categorization fields
  categoryId: integer("category_id").references(() => expenseCategories.id),
  customerId: integer("customer_id").references(() => customers.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  suggestedCustomerId: integer("suggested_customer_id").references(() => customers.id),
  suggestedVendorId: integer("suggested_vendor_id").references(() => vendors.id),
  suggestedCategoryId: integer("suggested_category_id").references(() => expenseCategories.id),
  isReconciled: boolean("is_reconciled").default(false),
  reconciledDate: timestamp("reconciled_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Uploads table - for uploading revenue sheets
export const revenueUploads = pgTable("revenue_uploads", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  fileName: text("file_name").notNull(),
  uploadDate: timestamp("upload_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  status: text("status").notNull().default("PENDING"), // PENDING, PROCESSED, FAILED
  totalRows: integer("total_rows"),
  processedRows: integer("processed_rows"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Statement Lines table - for detailed customer statement records
export const customerStatementLines = pgTable("customer_statement_lines", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  lineDate: date("line_date").notNull(),
  lineType: text("line_type").notNull(), // REVENUE, COST, PAYMENT, OPENING_BALANCE, CLOSING_BALANCE
  description: text("description").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  nettingBalance: decimal("netting_balance", { precision: 10, scale: 2 }).default("0.00"),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default("0.00"),
  runningBalance: decimal("running_balance", { precision: 10, scale: 2 }).default("0.00"),
  referenceNumber: text("reference_number"),
  revenueUploadId: integer("revenue_upload_id").references(() => revenueUploads.id),
  bankStatementUploadId: integer("bank_statement_upload_id").references(() => bankStatementUploads.id),
  bankStatementTransactionId: integer("bank_statement_transaction_id").references(() => bankStatementTransactions.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Roles table - defines system roles
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystemRole: boolean("is_system_role").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table - defines granular permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  resource: text("resource").notNull(), // e.g., 'customers', 'vendors', 'transactions'
  action: text("action").notNull(), // e.g., 'read', 'write', 'delete', 'manage'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role Permissions table - maps roles to permissions
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => userRoles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueRolePermission: unique().on(table.roleId, table.permissionId),
}));



// User Roles table - maps users to roles
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => userRoles.id).notNull(),
  companyId: integer("company_id").references(() => companies.id), // null for system-wide roles
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  uniqueUserRoleCompany: unique().on(table.userId, table.roleId, table.companyId),
}));

// User Sessions table - for session management
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  customers: many(customers),
  vendors: many(vendors),
  bankAccounts: many(bankAccounts),
  chartOfAccounts: many(chartOfAccounts),
  transactions: many(transactions),
  invoices: many(invoices),
  bills: many(bills),
  expenseCategories: many(expenseCategories),
  bankStatementUploads: many(bankStatementUploads),
  bankStatementTransactions: many(bankStatementTransactions),
  revenueUploads: many(revenueUploads),
  customerStatementLines: many(customerStatementLines),
  userRoleAssignments: many(userRoleAssignments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  transactions: many(transactions),
  invoices: many(invoices),
  customerStatementLines: many(customerStatementLines),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  company: one(companies, {
    fields: [vendors.companyId],
    references: [companies.id],
  }),
  transactions: many(transactions),
  bills: many(bills),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  vendor: one(vendors, {
    fields: [transactions.vendorId],
    references: [vendors.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [transactions.bankAccountId],
    references: [bankAccounts.id],
  }),
  category: one(expenseCategories, {
    fields: [transactions.categoryId],
    references: [expenseCategories.id],
  }),
  journalEntries: many(journalEntries),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  company: one(companies, {
    fields: [bills.companyId],
    references: [companies.id],
  }),
  vendor: one(vendors, {
    fields: [bills.vendorId],
    references: [vendors.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  company: one(companies, {
    fields: [journalEntries.companyId],
    references: [companies.id],
  }),
  transaction: one(transactions, {
    fields: [journalEntries.transactionId],
    references: [transactions.id],
  }),
  account: one(chartOfAccounts, {
    fields: [journalEntries.accountId],
    references: [chartOfAccounts.id],
  }),
}));

export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [chartOfAccounts.companyId],
    references: [companies.id],
  }),
  parentAccount: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
  }),
  childAccounts: many(chartOfAccounts),
  journalEntries: many(journalEntries),
}));

export const revenueUploadsRelations = relations(revenueUploads, ({ one, many }) => ({
  company: one(companies, {
    fields: [revenueUploads.companyId],
    references: [companies.id],
  }),
  customerStatementLines: many(customerStatementLines),
}));

export const customerStatementLinesRelations = relations(customerStatementLines, ({ one }) => ({
  company: one(companies, {
    fields: [customerStatementLines.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [customerStatementLines.customerId],
    references: [customers.id],
  }),
  revenueUpload: one(revenueUploads, {
    fields: [customerStatementLines.revenueUploadId],
    references: [revenueUploads.id],
  }),
  bankStatementUpload: one(bankStatementUploads, {
    fields: [customerStatementLines.bankStatementUploadId],
    references: [bankStatementUploads.id],
  }),
  bankStatementTransaction: one(bankStatementTransactions, {
    fields: [customerStatementLines.bankStatementTransactionId],
    references: [bankStatementTransactions.id],
  }),
}));

// User and Role Relations
export const usersRelations = relations(users, ({ many }) => ({
  roleAssignments: many(userRoleAssignments),
  sessions: many(userSessions),
  assignedRoles: many(userRoleAssignments, { relationName: 'assignedBy' }),
}));

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userAssignments: many(userRoleAssignments),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(userRoles, {
    fields: [rolePermissions.roleId],
    references: [userRoles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userRoleAssignments.userId],
    references: [users.id],
  }),
  role: one(userRoles, {
    fields: [userRoleAssignments.roleId],
    references: [userRoles.id],
  }),
  company: one(companies, {
    fields: [userRoleAssignments.companyId],
    references: [companies.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoleAssignments.assignedBy],
    references: [users.id],
    relationName: 'assignedBy',
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const bankStatementTransactionsRelations = relations(bankStatementTransactions, ({ one }) => ({
  company: one(companies, {
    fields: [bankStatementTransactions.companyId],
    references: [companies.id],
  }),
  bankAccount: one(bankAccounts, {
    fields: [bankStatementTransactions.bankAccountId],
    references: [bankAccounts.id],
  }),
  bankStatementUpload: one(bankStatementUploads, {
    fields: [bankStatementTransactions.bankStatementUploadId],
    references: [bankStatementUploads.id],
  }),
  category: one(expenseCategories, {
    fields: [bankStatementTransactions.categoryId],
    references: [expenseCategories.id],
  }),
  customer: one(customers, {
    fields: [bankStatementTransactions.customerId],
    references: [customers.id],
  }),
  vendor: one(vendors, {
    fields: [bankStatementTransactions.vendorId],
    references: [vendors.id],
  }),
  suggestedCustomer: one(customers, {
    fields: [bankStatementTransactions.suggestedCustomerId],
    references: [customers.id],
  }),
  suggestedVendor: one(vendors, {
    fields: [bankStatementTransactions.suggestedVendorId],
    references: [vendors.id],
  }),
  suggestedCategory: one(expenseCategories, {
    fields: [bankStatementTransactions.suggestedCategoryId],
    references: [expenseCategories.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankStatementUploadSchema = createInsertSchema(bankStatementUploads).omit({ id: true, createdAt: true });
export const insertBankStatementTransactionSchema = createInsertSchema(bankStatementTransactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRevenueUploadSchema = createInsertSchema(revenueUploads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerStatementLineSchema = createInsertSchema(customerStatementLines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true });
export const insertUserRoleAssignmentSchema = createInsertSchema(userRoleAssignments).omit({ id: true, assignedAt: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, createdAt: true });

// Select types
export type Company = typeof companies.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type BankStatementUpload = typeof bankStatementUploads.$inferSelect;
export type BankStatementTransaction = typeof bankStatementTransactions.$inferSelect;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type RevenueUpload = typeof revenueUploads.$inferSelect;
export type CustomerStatementLine = typeof customerStatementLines.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type User = typeof users.$inferSelect;

// Insert types
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type InsertBankStatementUpload = z.infer<typeof insertBankStatementUploadSchema>;
export type InsertBankStatementTransaction = z.infer<typeof insertBankStatementTransactionSchema>;
export type InsertRevenueUpload = z.infer<typeof insertRevenueUploadSchema>;
export type InsertCustomerStatementLine = z.infer<typeof insertCustomerStatementLineSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUserRoleAssignment = z.infer<typeof insertUserRoleAssignmentSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
