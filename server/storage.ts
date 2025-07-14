import {
  companies,
  customers,
  vendors,
  bankAccounts,
  transactions,
  invoices,
  bills,
  expenseCategories,
  expenseTransactions,
  bankStatementUploads,
  bankStatementTransactions,
  chartOfAccounts,
  journalEntries,
  revenueUploads,
  customerStatementLines,
  users,
  userRoles,
  permissions,
  rolePermissions,
  userRoleAssignments,
  userSessions,
  type Company,
  type Customer,
  type Vendor,
  type BankAccount,
  type Transaction,
  type Invoice,
  type Bill,
  type ExpenseCategory,
  type ExpenseTransaction,
  type BankStatementUpload,
  type BankStatementTransaction,
  type ChartOfAccount,
  type JournalEntry,
  type RevenueUpload,
  type CustomerStatementLine,
  type User,
  type UserRole,
  type Permission,
  type RolePermission,
  type UserRoleAssignment,
  type UserSession,
  type InsertCompany,
  type InsertCustomer,
  type InsertVendor,
  type InsertBankAccount,
  type InsertTransaction,
  type InsertInvoice,
  type InsertBill,
  type InsertExpenseCategory,
  type InsertExpenseTransaction,
  type InsertBankStatementUpload,
  type InsertBankStatementTransaction,
  type InsertRevenueUpload,
  type InsertCustomerStatementLine,
  type InsertUserRole,
  type InsertPermission,
  type InsertRolePermission,
  type InsertUserRoleAssignment,
  type InsertUserSession,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sum, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;

  // Customers
  getCustomers(companyId: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Vendors
  getVendors(companyId: number): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;

  // Bank Accounts
  getBankAccounts(companyId: number): Promise<BankAccount[]>;
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount>;
  deleteBankAccount(id: number): Promise<void>;

  // Transactions
  getTransactions(companyId: number, page?: number, limit?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Invoices
  getInvoices(companyId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<void>;

  // Bills
  getBills(companyId: number): Promise<Bill[]>;
  getBill(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill>;
  deleteBill(id: number): Promise<void>;

  // Expense Categories
  getExpenseCategories(companyId: number): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(companyId: number, category: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(companyId: number, id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory>;
  deleteExpenseCategory(companyId: number, id: number): Promise<void>;

  // Expense Transactions
  getExpenseTransactions(companyId: number): Promise<ExpenseTransaction[]>;
  getExpenseTransaction(id: number): Promise<ExpenseTransaction | undefined>;
  createExpenseTransaction(transaction: InsertExpenseTransaction): Promise<ExpenseTransaction>;
  updateExpenseTransaction(id: number, transaction: Partial<InsertExpenseTransaction>): Promise<ExpenseTransaction>;
  deleteExpenseTransaction(id: number): Promise<void>;

  // Bank Statement Uploads
  getBankStatementUploads(companyId: number): Promise<BankStatementUpload[]>;
  getBankStatementUpload(id: number): Promise<BankStatementUpload | undefined>;
  createBankStatementUpload(upload: InsertBankStatementUpload): Promise<BankStatementUpload>;
  updateBankStatementUpload(id: number, upload: Partial<InsertBankStatementUpload>): Promise<BankStatementUpload>;
  processBankStatementUpload(uploadId: number, csvData: any[]): Promise<void>;

  // Bank Statement Transactions
  getBankStatementTransactions(companyId: number, uploadId?: number): Promise<BankStatementTransaction[]>;
  getBankStatementTransaction(id: number): Promise<BankStatementTransaction | undefined>;
  createBankStatementTransaction(transaction: InsertBankStatementTransaction): Promise<BankStatementTransaction>;
  updateBankStatementTransaction(id: number, transaction: Partial<InsertBankStatementTransaction>): Promise<BankStatementTransaction>;
  deleteBankStatementTransaction(id: number): Promise<void>;
  categorizeBankTransaction(id: number, categorization: { categoryId?: number; customerId?: number; vendorId?: number; notes?: string }): Promise<BankStatementTransaction>;
  suggestTransactionCategorization(description: string, amount: number, companyId: number): Promise<{ customers: any[]; vendors: any[]; categories: any[] }>;

  // Chart of Accounts
  getChartOfAccounts(companyId: number): Promise<ChartOfAccount[]>;
  initializeChartOfAccounts(companyId: number): Promise<void>;

  // Dashboard metrics
  getDashboardMetrics(companyId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    outstandingBalance: number;
    netProfit: number;
  }>;

  // Outstanding balances
  getOutstandingCustomers(companyId: number): Promise<any[]>;
  getOutstandingVendors(companyId: number): Promise<any[]>;

  // Recent transactions
  getRecentTransactions(companyId: number, limit?: number): Promise<Transaction[]>;

  // Reports
  getGeneralLedger(companyId: number, startDate?: string, endDate?: string): Promise<any[]>;
  getTrialBalance(companyId: number, asOfDate?: string): Promise<any[]>;
  getExpenseCategoryReport(companyId: number, startDate?: string, endDate?: string): Promise<any[]>;
  getProfitLossReport(companyId: number, startDate?: string, endDate?: string): Promise<any>;
  getBalanceSheetReport(companyId: number, asOfDate?: string): Promise<any>;

  // Revenue Uploads
  getRevenueUploads(companyId: number): Promise<RevenueUpload[]>;
  getRevenueUpload(id: number): Promise<RevenueUpload | undefined>;
  createRevenueUpload(upload: InsertRevenueUpload): Promise<RevenueUpload>;
  updateRevenueUpload(id: number, upload: Partial<InsertRevenueUpload>): Promise<RevenueUpload>;
  processRevenueUpload(uploadId: number, csvData: any[]): Promise<void>;

  // Customer Statement Lines
  getCustomerStatementLines(companyId: number, customerId: number, startDate?: string, endDate?: string): Promise<CustomerStatementLine[]>;
  getCustomerStatementLine(id: number): Promise<CustomerStatementLine | undefined>;
  createCustomerStatementLine(line: InsertCustomerStatementLine): Promise<CustomerStatementLine>;
  updateCustomerStatementLine(id: number, line: Partial<InsertCustomerStatementLine>): Promise<CustomerStatementLine>;
  deleteCustomerStatementLine(id: number): Promise<void>;

  // Customer Statement Summary
  getCustomerStatementSummary(companyId: number, customerId: number, startDate?: string, endDate?: string): Promise<{
    openingBalance: number;
    totalRevenue: number;
    totalCost: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
    lines: CustomerStatementLine[];
  }>;

  // User Management
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Role Management
  getRoles(): Promise<UserRole[]>;
  getRole(id: number): Promise<UserRole | undefined>;
  createRole(role: InsertUserRole): Promise<UserRole>;
  updateRole(id: number, role: Partial<InsertUserRole>): Promise<UserRole>;
  deleteRole(id: number): Promise<void>;

  // Permission Management
  getPermissions(): Promise<Permission[]>;
  getPermission(id: number): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: number): Promise<void>;

  // Role Permission Management
  getRolePermissions(roleId: number): Promise<Permission[]>;
  assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;

  // User Role Assignment
  getUserRoles(userId: string, companyId?: number): Promise<UserRole[]>;
  assignRoleToUser(userId: string, roleId: number, companyId?: number, assignedBy?: string): Promise<UserRoleAssignment>;
  removeRoleFromUser(userId: string, roleId: number, companyId?: number): Promise<void>;
  getUserPermissions(userId: string, companyId?: number): Promise<Permission[]>;
  hasPermission(userId: string, resource: string, action: string, companyId?: number): Promise<boolean>;

  // Initialize default roles and permissions
  initializeDefaultRolesAndPermissions(): Promise<void>;

  // Analytics
  getAnalytics(companyId: number, timeRange: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(asc(companies.name));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    
    // Initialize chart of accounts for the new company
    await this.initializeChartOfAccounts(newCompany.id);
    
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Customers
  async getCustomers(companyId: number): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.companyId, companyId))
      .orderBy(asc(customers.name));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      // Delete related customer statement lines
      await db.delete(customerStatementLines).where(eq(customerStatementLines.customerId, id));
      
      // Update bank statement transactions to remove all references to this customer
      await db.update(bankStatementTransactions)
        .set({ 
          suggestedCustomerId: null,
          customerId: null
        })
        .where(or(
          eq(bankStatementTransactions.suggestedCustomerId, id),
          eq(bankStatementTransactions.customerId, id)
        ));
      
      // Delete the customer
      await db.delete(customers).where(eq(customers.id, id));
    } catch (error) {
      console.error("Error in deleteCustomer:", error);
      throw error;
    }
  }

  // Vendors
  async getVendors(companyId: number): Promise<Vendor[]> {
    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.companyId, companyId))
      .orderBy(asc(vendors.name));
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...vendor, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Bank Accounts
  async getBankAccounts(companyId: number): Promise<BankAccount[]> {
    return await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.companyId, companyId))
      .orderBy(asc(bankAccounts.accountName));
  }

  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    const [bankAccount] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return bankAccount;
  }

  async createBankAccount(bankAccount: InsertBankAccount): Promise<BankAccount> {
    const [newBankAccount] = await db.insert(bankAccounts).values(bankAccount).returning();
    return newBankAccount;
  }

  async updateBankAccount(id: number, bankAccount: Partial<InsertBankAccount>): Promise<BankAccount> {
    const [updatedBankAccount] = await db
      .update(bankAccounts)
      .set({ ...bankAccount, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning();
    return updatedBankAccount;
  }

  async deleteBankAccount(id: number): Promise<void> {
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
  }

  // Transactions
  async getTransactions(companyId: number, page: number = 1, limit: number = 50): Promise<Transaction[]> {
    const offset = (page - 1) * limit;
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.companyId, companyId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Invoices
  async getInvoices(companyId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.companyId, companyId))
      .orderBy(desc(invoices.invoiceDate));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Bills
  async getBills(companyId: number): Promise<Bill[]> {
    return await db
      .select()
      .from(bills)
      .where(eq(bills.companyId, companyId))
      .orderBy(desc(bills.billDate));
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill> {
    const [updatedBill] = await db
      .update(bills)
      .set({ ...bill, updatedAt: new Date() })
      .where(eq(bills.id, id))
      .returning();
    return updatedBill;
  }

  async deleteBill(id: number): Promise<void> {
    await db.delete(bills).where(eq(bills.id, id));
  }

  // Expense Categories
  async getExpenseCategories(companyId: number, page: number = 1, limit: number = 10): Promise<{
    categories: ExpenseCategory[],
    totalCount: number,
    totalPages: number,
    currentPage: number
  }> {
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenseCategories)
      .where(and(eq(expenseCategories.companyId, companyId), eq(expenseCategories.isActive, true)));

    const totalCount = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated categories
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(and(eq(expenseCategories.companyId, companyId), eq(expenseCategories.isActive, true)))
      .orderBy(asc(expenseCategories.name))
      .limit(limit)
      .offset(offset);
    
    return {
      categories,
      totalCount,
      totalPages,
      currentPage: page
    };
  }

  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(companyId: number, category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const categoryData = { ...category, companyId };
    const [newCategory] = await db.insert(expenseCategories).values(categoryData).returning();
    return newCategory;
  }

  async updateExpenseCategory(companyId: number, id: number, category: Partial<InsertExpenseCategory>): Promise<ExpenseCategory> {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.companyId, companyId)))
      .returning();
    return updatedCategory;
  }

  async deleteExpenseCategory(companyId: number, id: number): Promise<void> {
    await db.update(expenseCategories)
      .set({ isActive: false })
      .where(and(eq(expenseCategories.id, id), eq(expenseCategories.companyId, companyId)));
  }

  // Expense Transactions
  async getExpenseTransactions(companyId: number): Promise<ExpenseTransaction[]> {
    return await db
      .select()
      .from(expenseTransactions)
      .where(eq(expenseTransactions.companyId, companyId))
      .orderBy(desc(expenseTransactions.transactionDate));
  }

  async getExpenseTransaction(id: number): Promise<ExpenseTransaction | undefined> {
    const [transaction] = await db.select().from(expenseTransactions).where(eq(expenseTransactions.id, id));
    return transaction;
  }

  async createExpenseTransaction(transaction: InsertExpenseTransaction): Promise<ExpenseTransaction> {
    const [newTransaction] = await db.insert(expenseTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateExpenseTransaction(id: number, transaction: Partial<InsertExpenseTransaction>): Promise<ExpenseTransaction> {
    const [updatedTransaction] = await db
      .update(expenseTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(expenseTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteExpenseTransaction(id: number): Promise<void> {
    await db.delete(expenseTransactions).where(eq(expenseTransactions.id, id));
  }

  // Bank Statement Uploads
  async getBankStatementUploads(companyId: number): Promise<BankStatementUpload[]> {
    return await db
      .select()
      .from(bankStatementUploads)
      .where(eq(bankStatementUploads.companyId, companyId))
      .orderBy(desc(bankStatementUploads.uploadDate));
  }

  async getBankStatementUpload(id: number): Promise<BankStatementUpload | undefined> {
    const [upload] = await db.select().from(bankStatementUploads).where(eq(bankStatementUploads.id, id));
    return upload;
  }

  async createBankStatementUpload(upload: InsertBankStatementUpload): Promise<BankStatementUpload> {
    const [newUpload] = await db.insert(bankStatementUploads).values(upload).returning();
    return newUpload;
  }

  async updateBankStatementUpload(id: number, upload: Partial<InsertBankStatementUpload>): Promise<BankStatementUpload> {
    const [updatedUpload] = await db
      .update(bankStatementUploads)
      .set(upload)
      .where(eq(bankStatementUploads.id, id))
      .returning();
    return updatedUpload;
  }

  async processBankStatementUpload(uploadId: number, csvData: any[]): Promise<void> {
    // First, get the upload record
    const upload = await this.getBankStatementUpload(uploadId);
    if (!upload) {
      throw new Error("Upload not found");
    }

    try {
      console.log(`Processing ${csvData.length} rows for upload ${uploadId}`);
      
      // Process each row of CSV data
      for (const row of csvData) {
        console.log(`Processing row:`, row);
        
        // Parse the row data
        const transactionDate = new Date(row.date).toISOString().split('T')[0];
        const description = row.description || '';
        
        // Handle different amount field formats
        let debitAmount = 0;
        let creditAmount = 0;
        
        if (row.debit && row.credit) {
          // Separate debit/credit columns
          debitAmount = parseFloat(row.debit.toString()) || 0;
          creditAmount = parseFloat(row.credit.toString()) || 0;
        } else if (row.amount) {
          // Single amount column - determine if it's debit or credit based on sign
          const amount = parseFloat(row.amount.toString()) || 0;
          if (amount > 0) {
            creditAmount = amount;
          } else {
            debitAmount = Math.abs(amount);
          }
        } else {
          // Try to find any numeric value
          const numericValue = parseFloat(row.debit || row.credit || row.amount || '0');
          if (numericValue !== 0) {
            if (numericValue > 0) {
              creditAmount = numericValue;
            } else {
              debitAmount = Math.abs(numericValue);
            }
          }
        }
        
        const runningBalance = row.balance ? parseFloat(row.balance.toString()) : 0;

        // Get smart categorization suggestions
        const suggestions = await this.suggestTransactionCategorization(
          description, 
          debitAmount + creditAmount, 
          upload.companyId
        );

        // Create bank statement transaction with suggestions
        await this.createBankStatementTransaction({
          companyId: upload.companyId,
          bankAccountId: upload.bankAccountId,
          bankStatementUploadId: uploadId,
          transactionDate,
          description,
          debitAmount: debitAmount.toString(),
          creditAmount: creditAmount.toString(),
          runningBalance: runningBalance.toString(),
          isReconciled: false,
          suggestedCustomerId: suggestions.customers.length > 0 ? suggestions.customers[0].id : undefined,
          suggestedVendorId: suggestions.vendors.length > 0 ? suggestions.vendors[0].id : undefined,
          suggestedCategoryId: suggestions.categories.length > 0 ? suggestions.categories[0].id : undefined,
        });
      }

      // Update upload status
      await this.updateBankStatementUpload(uploadId, {
        status: "PROCESSED",
        processedDate: new Date(),
        processedRows: csvData.length,
      });
      
      console.log(`Successfully processed ${csvData.length} rows for upload ${uploadId}`);
    } catch (error) {
      console.error(`Error processing upload ${uploadId}:`, error);
      // Update upload status to failed
      await this.updateBankStatementUpload(uploadId, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
      });
      throw error;
    }
  }

  // Chart of Accounts
  async getChartOfAccounts(companyId: number): Promise<ChartOfAccount[]> {
    return await db
      .select()
      .from(chartOfAccounts)
      .where(and(eq(chartOfAccounts.companyId, companyId), eq(chartOfAccounts.isActive, true)))
      .orderBy(asc(chartOfAccounts.accountCode));
  }

  async initializeChartOfAccounts(companyId: number): Promise<void> {
    const defaultAccounts = [
      { accountCode: '1000', accountName: 'Cash', accountType: 'Asset' },
      { accountCode: '1200', accountName: 'Accounts Receivable', accountType: 'Asset' },
      { accountCode: '1500', accountName: 'Inventory', accountType: 'Asset' },
      { accountCode: '1700', accountName: 'Equipment', accountType: 'Asset' },
      { accountCode: '2000', accountName: 'Accounts Payable', accountType: 'Liability' },
      { accountCode: '2100', accountName: 'Accrued Expenses', accountType: 'Liability' },
      { accountCode: '3000', accountName: 'Owner\'s Equity', accountType: 'Equity' },
      { accountCode: '4000', accountName: 'Sales Revenue', accountType: 'Revenue' },
      { accountCode: '4100', accountName: 'Service Revenue', accountType: 'Revenue' },
      { accountCode: '5000', accountName: 'Cost of Goods Sold', accountType: 'Expense' },
      { accountCode: '6000', accountName: 'Office Supplies', accountType: 'Expense' },
      { accountCode: '6100', accountName: 'Rent Expense', accountType: 'Expense' },
      { accountCode: '6200', accountName: 'Utilities Expense', accountType: 'Expense' },
      { accountCode: '6300', accountName: 'Travel Expense', accountType: 'Expense' },
      { accountCode: '6400', accountName: 'Miscellaneous Expense', accountType: 'Expense' },
    ];

    for (const account of defaultAccounts) {
      await db.insert(chartOfAccounts).values({
        companyId,
        ...account,
      });
    }
  }

  // Dashboard metrics
  async getDashboardMetrics(companyId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    outstandingBalance: number;
    netProfit: number;
  }> {
    // Get total revenue from invoices
    const revenueResult = await db
      .select({ total: sum(invoices.amount) })
      .from(invoices)
      .where(eq(invoices.companyId, companyId));

    // Get total expenses from bills
    const expenseResult = await db
      .select({ total: sum(bills.amount) })
      .from(bills)
      .where(eq(bills.companyId, companyId));

    // Get outstanding balance from unpaid invoices
    const outstandingResult = await db
      .select({ total: sum(invoices.amount) })
      .from(invoices)
      .where(and(eq(invoices.companyId, companyId), eq(invoices.status, 'PENDING')));

    const totalRevenue = Number(revenueResult[0]?.total || 0);
    const totalExpenses = Number(expenseResult[0]?.total || 0);
    const outstandingBalance = Number(outstandingResult[0]?.total || 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      outstandingBalance,
      netProfit,
    };
  }

  // Outstanding customers
  async getOutstandingCustomers(companyId: number): Promise<any[]> {
    const result = await db
      .select({
        customerId: customers.id,
        customerName: customers.name,
        totalAmount: sum(invoices.amount),
        invoiceCount: sql<number>`count(${invoices.id})`,
        oldestInvoiceDate: sql<string>`min(${invoices.invoiceDate})`,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, 'PENDING')
        )
      )
      .groupBy(customers.id, customers.name)
      .orderBy(desc(sum(invoices.amount)));

    return result.map(row => ({
      ...row,
      totalAmount: Number(row.totalAmount || 0),
    }));
  }

  // Outstanding vendors
  async getOutstandingVendors(companyId: number): Promise<any[]> {
    const result = await db
      .select({
        vendorId: vendors.id,
        vendorName: vendors.name,
        totalAmount: sum(bills.amount),
        billCount: sql<number>`count(${bills.id})`,
        oldestBillDate: sql<string>`min(${bills.billDate})`,
      })
      .from(bills)
      .innerJoin(vendors, eq(bills.vendorId, vendors.id))
      .where(
        and(
          eq(bills.companyId, companyId),
          eq(bills.status, 'PENDING')
        )
      )
      .groupBy(vendors.id, vendors.name)
      .orderBy(desc(sum(bills.amount)));

    return result.map(row => ({
      ...row,
      totalAmount: Number(row.totalAmount || 0),
    }));
  }

  // Recent transactions
  async getRecentTransactions(companyId: number, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.companyId, companyId))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit);
  }

  // General Ledger Report
  async getGeneralLedger(companyId: number, startDate?: string, endDate?: string): Promise<any[]> {
    let query = db
      .select({
        accountId: journalEntries.accountId,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        entryDate: journalEntries.entryDate,
        description: journalEntries.description,
        debitAmount: journalEntries.debitAmount,
        creditAmount: journalEntries.creditAmount,
        transactionNumber: transactions.transactionNumber,
      })
      .from(journalEntries)
      .innerJoin(chartOfAccounts, eq(journalEntries.accountId, chartOfAccounts.id))
      .innerJoin(transactions, eq(journalEntries.transactionId, transactions.id))
      .where(eq(journalEntries.companyId, companyId));

    if (startDate) {
      query = query.where(and(eq(journalEntries.companyId, companyId), gte(journalEntries.entryDate, startDate)));
    }

    if (endDate) {
      query = query.where(and(eq(journalEntries.companyId, companyId), lte(journalEntries.entryDate, endDate)));
    }

    return await query.orderBy(asc(chartOfAccounts.accountCode), asc(journalEntries.entryDate));
  }

  // Trial Balance Report
  async getTrialBalance(companyId: number, asOfDate?: string): Promise<any[]> {
    let query = db
      .select({
        accountId: chartOfAccounts.id,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        totalDebits: sum(journalEntries.debitAmount),
        totalCredits: sum(journalEntries.creditAmount),
      })
      .from(chartOfAccounts)
      .leftJoin(journalEntries, eq(chartOfAccounts.id, journalEntries.accountId))
      .where(and(eq(chartOfAccounts.companyId, companyId), eq(chartOfAccounts.isActive, true)));

    if (asOfDate) {
      query = query.where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(chartOfAccounts.isActive, true),
          lte(journalEntries.entryDate, asOfDate)
        )
      );
    }

    const result = await query
      .groupBy(chartOfAccounts.id, chartOfAccounts.accountCode, chartOfAccounts.accountName, chartOfAccounts.accountType)
      .orderBy(asc(chartOfAccounts.accountCode));

    return result.map(row => ({
      ...row,
      totalDebits: Number(row.totalDebits || 0),
      totalCredits: Number(row.totalCredits || 0),
      balance: Number(row.totalDebits || 0) - Number(row.totalCredits || 0),
    }));
  }

  // Expense Category Report
  async getExpenseCategoryReport(companyId: number, startDate?: string, endDate?: string): Promise<any[]> {
    let query = db
      .select({
        categoryId: expenseCategories.id,
        categoryName: expenseCategories.name,
        totalAmount: sum(transactions.amount),
        transactionCount: sql<number>`count(${transactions.id})`,
      })
      .from(transactions)
      .innerJoin(expenseCategories, eq(transactions.categoryId, expenseCategories.id))
      .where(and(eq(transactions.companyId, companyId), eq(transactions.transactionType, 'EXPENSE')));

    if (startDate) {
      query = query.where(
        and(
          eq(transactions.companyId, companyId),
          eq(transactions.transactionType, 'EXPENSE'),
          gte(transactions.transactionDate, startDate)
        )
      );
    }

    if (endDate) {
      query = query.where(
        and(
          eq(transactions.companyId, companyId),
          eq(transactions.transactionType, 'EXPENSE'),
          lte(transactions.transactionDate, endDate)
        )
      );
    }

    const result = await query
      .groupBy(expenseCategories.id, expenseCategories.name)
      .orderBy(desc(sum(transactions.amount)));

    return result.map(row => ({
      ...row,
      totalAmount: Number(row.totalAmount || 0),
    }));
  }

  // P&L Report
  async getProfitLossReport(companyId: number, startDate?: string, endDate?: string): Promise<any> {
    try {
      const currentDate = new Date();
      const defaultStartDate = startDate || new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
      const defaultEndDate = endDate || currentDate.toISOString().split('T')[0];

      // Get revenue from invoices (paid invoices)
      const revenueQuery = db
        .select({
          totalRevenue: sql<number>`COALESCE(SUM(CAST(${invoices.amount} AS NUMERIC)), 0)`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.companyId, companyId),
            eq(invoices.status, 'PAID'),
            gte(invoices.invoiceDate, defaultStartDate),
            lte(invoices.invoiceDate, defaultEndDate)
          )
        );

      // Get expenses from expense transactions
      const expenseQuery = db
        .select({
          totalExpenses: sql<number>`COALESCE(SUM(CAST(${expenseTransactions.totalAmount} AS NUMERIC)), 0)`,
        })
        .from(expenseTransactions)
        .where(
          and(
            eq(expenseTransactions.companyId, companyId),
            gte(expenseTransactions.transactionDate, defaultStartDate),
            lte(expenseTransactions.transactionDate, defaultEndDate)
          )
        );

      // Get expense categories breakdown
      const expenseCategoriesQuery = db
        .select({
          categoryName: expenseCategories.name,
          totalAmount: sql<number>`COALESCE(SUM(CAST(${expenseTransactions.totalAmount} AS NUMERIC)), 0)`,
        })
        .from(expenseTransactions)
        .innerJoin(expenseCategories, eq(expenseTransactions.expenseCategoryId, expenseCategories.id))
        .where(
          and(
            eq(expenseTransactions.companyId, companyId),
            gte(expenseTransactions.transactionDate, defaultStartDate),
            lte(expenseTransactions.transactionDate, defaultEndDate)
          )
        )
        .groupBy(expenseCategories.name)
        .orderBy(desc(sql`COALESCE(SUM(CAST(${expenseTransactions.totalAmount} AS NUMERIC)), 0)`));

      const [revenueResult] = await revenueQuery;
      const [expenseResult] = await expenseQuery;
      const expenseCategoriesResult = await expenseCategoriesQuery;

      const totalRevenue = Number(revenueResult?.totalRevenue || 0);
      const totalExpenses = Number(expenseResult?.totalExpenses || 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        period: {
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        },
        revenue: {
          totalRevenue,
        },
        expenses: {
          totalExpenses,
          categories: expenseCategoriesResult.map((cat: any) => ({
            categoryName: cat.categoryName,
            totalAmount: Number(cat.totalAmount || 0),
          })),
        },
        netIncome,
      };
    } catch (error) {
      console.error('Error in getProfitLossReport:', error);
      // Return empty report structure on error
      return {
        period: {
          startDate: startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          endDate: endDate || new Date().toISOString().split('T')[0],
        },
        revenue: {
          totalRevenue: 0,
        },
        expenses: {
          totalExpenses: 0,
          categories: [],
        },
        netIncome: 0,
      };
    }
  }

  // Balance Sheet Report
  async getBalanceSheetReport(companyId: number, asOfDate?: string): Promise<any> {
    try {
      const currentDate = new Date();
      const defaultAsOfDate = asOfDate || currentDate.toISOString().split('T')[0];

    // Get assets from chart of accounts
    const assetsQuery = db
      .select({
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        balance: sql<number>`
          COALESCE(
            (SELECT SUM(
              CAST(je.debit_amount AS NUMERIC) - CAST(je.credit_amount AS NUMERIC)
            ) 
            FROM ${journalEntries} je 
            WHERE je.account_id = ${chartOfAccounts.id} 
            AND je.entry_date <= ${defaultAsOfDate}), 0
          )
        `,
      })
      .from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(chartOfAccounts.isActive, true),
          or(
            eq(chartOfAccounts.accountType, 'Asset'),
            eq(chartOfAccounts.accountType, 'Current Asset'),
            eq(chartOfAccounts.accountType, 'Fixed Asset')
          )
        )
      )
      .orderBy(chartOfAccounts.accountCode);

    // Get liabilities from chart of accounts
    const liabilitiesQuery = db
      .select({
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        balance: sql<number>`
          COALESCE(
            (SELECT SUM(
              CAST(je.credit_amount AS NUMERIC) - CAST(je.debit_amount AS NUMERIC)
            ) 
            FROM ${journalEntries} je 
            WHERE je.account_id = ${chartOfAccounts.id} 
            AND je.entry_date <= ${defaultAsOfDate}), 0
          )
        `,
      })
      .from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(chartOfAccounts.isActive, true),
          or(
            eq(chartOfAccounts.accountType, 'Liability'),
            eq(chartOfAccounts.accountType, 'Current Liability'),
            eq(chartOfAccounts.accountType, 'Long-term Liability')
          )
        )
      )
      .orderBy(chartOfAccounts.accountCode);

    // Get equity from chart of accounts
    const equityQuery = db
      .select({
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        balance: sql<number>`
          COALESCE(
            (SELECT SUM(
              CAST(je.credit_amount AS NUMERIC) - CAST(je.debit_amount AS NUMERIC)
            ) 
            FROM ${journalEntries} je 
            WHERE je.account_id = ${chartOfAccounts.id} 
            AND je.entry_date <= ${defaultAsOfDate}), 0
          )
        `,
      })
      .from(chartOfAccounts)
      .where(
        and(
          eq(chartOfAccounts.companyId, companyId),
          eq(chartOfAccounts.isActive, true),
          eq(chartOfAccounts.accountType, 'Equity')
        )
      )
      .orderBy(chartOfAccounts.accountCode);

    const assets = await assetsQuery;
    const liabilities = await liabilitiesQuery;
    const equity = await equityQuery;

    const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + Number(liability.balance || 0), 0);
    const totalEquity = equity.reduce((sum, equityItem) => sum + Number(equityItem.balance || 0), 0);

    return {
      asOfDate: defaultAsOfDate,
      assets: {
        accounts: assets.map(asset => ({
          ...asset,
          balance: Number(asset.balance || 0),
        })),
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities.map(liability => ({
          ...liability,
          balance: Number(liability.balance || 0),
        })),
        total: totalLiabilities,
      },
      equity: {
        accounts: equity.map(equityItem => ({
          ...equityItem,
          balance: Number(equityItem.balance || 0),
        })),
        total: totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
    } catch (error) {
      console.error('Error in getBalanceSheetReport:', error);
      // Return empty balance sheet structure on error
      return {
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        assets: { accounts: [], total: 0 },
        liabilities: { accounts: [], total: 0 },
        equity: { accounts: [], total: 0 },
        totalLiabilitiesAndEquity: 0,
      };
    }
  }

  // Revenue Uploads
  async getRevenueUploads(companyId: number): Promise<RevenueUpload[]> {
    return await db.select().from(revenueUploads).where(eq(revenueUploads.companyId, companyId));
  }

  async getRevenueUpload(id: number): Promise<RevenueUpload | undefined> {
    const [upload] = await db.select().from(revenueUploads).where(eq(revenueUploads.id, id));
    return upload;
  }

  async createRevenueUpload(upload: InsertRevenueUpload): Promise<RevenueUpload> {
    const [newUpload] = await db.insert(revenueUploads).values(upload).returning();
    return newUpload;
  }

  async updateRevenueUpload(id: number, upload: Partial<InsertRevenueUpload>): Promise<RevenueUpload> {
    const [updatedUpload] = await db.update(revenueUploads)
      .set({ ...upload, updatedAt: new Date() })
      .where(eq(revenueUploads.id, id))
      .returning();
    return updatedUpload;
  }

  async processRevenueUpload(uploadId: number, csvData: any[]): Promise<void> {
    const upload = await this.getRevenueUpload(uploadId);
    if (!upload) throw new Error('Revenue upload not found');

    try {
      // Process each row of CSV data
      for (const row of csvData) {
        // Find or create customer
        let customer = await db.select().from(customers)
          .where(and(eq(customers.companyId, upload.companyId), eq(customers.name, row.customerName)))
          .limit(1);

        if (customer.length === 0) {
          // Create new customer
          const [newCustomer] = await db.insert(customers).values({
            companyId: upload.companyId,
            name: row.customerName,
            paymentTerms: 'Net 30'
          }).returning();
          customer = [newCustomer];
        }

        // Create revenue statement line
        const revenue = Number(row.revenue || 0);
        const cost = Number(row.cost || 0);
        const nettingBalance = revenue - cost;
        
        // Parse date properly
        const lineDate = new Date(row.date);
        if (isNaN(lineDate.getTime())) {
          throw new Error(`Invalid date format: ${row.date}`);
        }
        
        await db.insert(customerStatementLines).values({
          companyId: upload.companyId,
          customerId: customer[0].id,
          lineDate: lineDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          lineType: 'REVENUE',
          description: `Revenue entry from ${upload.fileName}`,
          revenue: revenue.toFixed(2),
          cost: cost.toFixed(2),
          nettingBalance: nettingBalance.toFixed(2),
          debitAmount: '0.00',
          creditAmount: '0.00',
          runningBalance: nettingBalance.toFixed(2),
          revenueUploadId: uploadId
        });
      }

      // Update upload status
      await this.updateRevenueUpload(uploadId, {
        status: 'PROCESSED',
        processedDate: new Date(),
        processedRows: csvData.length
      });
    } catch (error) {
      // Update upload status with error
      await this.updateRevenueUpload(uploadId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Customer Statement Lines
  async getCustomerStatementLines(companyId: number, customerId: number, startDate?: string, endDate?: string): Promise<CustomerStatementLine[]> {
    let whereConditions = [
      eq(customerStatementLines.companyId, companyId),
      eq(customerStatementLines.customerId, customerId)
    ];

    if (startDate) {
      whereConditions.push(gte(customerStatementLines.lineDate, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(customerStatementLines.lineDate, endDate));
    }

    return await db.select().from(customerStatementLines)
      .where(and(...whereConditions))
      .orderBy(customerStatementLines.lineDate, customerStatementLines.id);
  }

  async getCustomerStatementLine(id: number): Promise<CustomerStatementLine | undefined> {
    const [line] = await db.select().from(customerStatementLines).where(eq(customerStatementLines.id, id));
    return line;
  }

  async createCustomerStatementLine(line: InsertCustomerStatementLine): Promise<CustomerStatementLine> {
    const [newLine] = await db.insert(customerStatementLines).values(line).returning();
    return newLine;
  }

  async updateCustomerStatementLine(id: number, line: Partial<InsertCustomerStatementLine>): Promise<CustomerStatementLine> {
    const [updatedLine] = await db.update(customerStatementLines)
      .set({ ...line, updatedAt: new Date() })
      .where(eq(customerStatementLines.id, id))
      .returning();
    return updatedLine;
  }

  async deleteCustomerStatementLine(id: number): Promise<void> {
    await db.delete(customerStatementLines).where(eq(customerStatementLines.id, id));
  }

  // Customer Statement Summary
  async getCustomerStatementSummary(companyId: number, customerId: number, startDate?: string, endDate?: string): Promise<{
    openingBalance: number;
    totalRevenue: number;
    totalCost: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
    lines: CustomerStatementLine[];
  }> {
    const customer = await this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    const lines = await this.getCustomerStatementLines(companyId, customerId, startDate, endDate);
    
    const openingBalance = Number(customer.openingBalance || 0);
    const totalRevenue = lines.reduce((sum, line) => sum + Number(line.revenue), 0);
    const totalCost = lines.reduce((sum, line) => sum + Number(line.cost), 0);
    const totalDebits = lines.reduce((sum, line) => sum + Number(line.debitAmount), 0);
    const totalCredits = lines.reduce((sum, line) => sum + Number(line.creditAmount), 0);
    
    // Calculate running balances
    let runningBalance = openingBalance;
    const linesWithRunningBalance = lines.map(line => {
      const nettingBalance = Number(line.revenue) - Number(line.cost);
      const debitCredit = Number(line.debitAmount) - Number(line.creditAmount);
      runningBalance += nettingBalance + debitCredit;
      
      return {
        ...line,
        runningBalance: runningBalance.toFixed(2)
      };
    });

    const closingBalance = runningBalance;

    return {
      openingBalance,
      totalRevenue,
      totalCost,
      totalDebits,
      totalCredits,
      closingBalance,
      lines: linesWithRunningBalance
    };
  }

  // Bank Statement Transactions
  async getBankStatementTransactions(companyId: number, uploadId?: number): Promise<BankStatementTransaction[]> {
    const conditions = [eq(bankStatementTransactions.companyId, companyId)];
    
    if (uploadId) {
      conditions.push(eq(bankStatementTransactions.bankStatementUploadId, uploadId));
    }

    return await db
      .select()
      .from(bankStatementTransactions)
      .where(and(...conditions))
      .orderBy(desc(bankStatementTransactions.transactionDate));
  }

  async getBankStatementTransaction(id: number): Promise<BankStatementTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(bankStatementTransactions)
      .where(eq(bankStatementTransactions.id, id));
    return transaction;
  }

  async createBankStatementTransaction(transaction: InsertBankStatementTransaction): Promise<BankStatementTransaction> {
    const [newTransaction] = await db
      .insert(bankStatementTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateBankStatementTransaction(id: number, transaction: Partial<InsertBankStatementTransaction>): Promise<BankStatementTransaction> {
    const [updatedTransaction] = await db
      .update(bankStatementTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(bankStatementTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteBankStatementTransaction(id: number): Promise<void> {
    await db.delete(bankStatementTransactions).where(eq(bankStatementTransactions.id, id));
  }

  async categorizeBankTransaction(id: number, categorization: { 
    categoryId?: number; 
    customerId?: number; 
    vendorId?: number; 
    notes?: string 
  }): Promise<BankStatementTransaction> {
    // Get the transaction first
    const transaction = await this.getBankStatementTransaction(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const updateData: Partial<InsertBankStatementTransaction> = {
      ...categorization,
      updatedAt: new Date(),
    };

    const [updatedTransaction] = await db
      .update(bankStatementTransactions)
      .set(updateData)
      .where(eq(bankStatementTransactions.id, id))
      .returning();

    // If assigned to a customer, create a customer statement line
    if (categorization.customerId) {
      const debitAmount = Number(transaction.debitAmount);
      const creditAmount = Number(transaction.creditAmount);
      
      // Get the customer's current running balance from the last statement line
      const lastStatementLine = await db
        .select({ runningBalance: customerStatementLines.runningBalance })
        .from(customerStatementLines)
        .where(eq(customerStatementLines.customerId, categorization.customerId))
        .orderBy(desc(customerStatementLines.lineDate), desc(customerStatementLines.id))
        .limit(1);

      // If no previous lines, get the customer's opening balance
      let currentRunningBalance = 0;
      if (lastStatementLine.length > 0) {
        currentRunningBalance = Number(lastStatementLine[0].runningBalance);
      } else {
        const customer = await this.getCustomer(categorization.customerId);
        currentRunningBalance = Number(customer?.openingBalance || 0);
      }

      // Calculate new running balance
      // Debit increases balance (payment received), Credit decreases balance (payment made)
      const lineImpact = debitAmount - creditAmount;
      const newRunningBalance = currentRunningBalance + lineImpact;
      
      // Create customer statement line
      await this.createCustomerStatementLine({
        companyId: transaction.companyId,
        customerId: categorization.customerId,
        lineDate: transaction.transactionDate,
        lineType: 'BANK_TRANSACTION',
        description: `Bank Transaction: ${transaction.description}`,
        revenue: '0.00',
        cost: '0.00',
        nettingBalance: '0.00',
        debitAmount: debitAmount.toFixed(2),
        creditAmount: creditAmount.toFixed(2),
        runningBalance: newRunningBalance.toFixed(2),
        bankStatementTransactionId: id,
      });
    }
    
    return updatedTransaction;
  }

  async suggestTransactionCategorization(description: string, amount: number, companyId: number): Promise<{
    customers: any[];
    vendors: any[];
    categories: any[];
  }> {
    // Simple keyword matching for suggestions
    const descriptionLower = description.toLowerCase();
    
    // Get all customers, vendors, and categories for the company
    const [allCustomers, allVendors, allCategories] = await Promise.all([
      this.getCustomers(companyId),
      this.getVendors(companyId),
      this.getExpenseCategories(companyId)
    ]);

    // Filter customers based on name matching
    const suggestedCustomers = allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(descriptionLower) ||
      descriptionLower.includes(customer.name.toLowerCase())
    );

    // Filter vendors based on name matching
    const suggestedVendors = allVendors.filter(vendor => 
      vendor.name.toLowerCase().includes(descriptionLower) ||
      descriptionLower.includes(vendor.name.toLowerCase())
    );

    // Filter categories based on name matching or common keywords
    const suggestedCategories = allCategories.filter(category => {
      const categoryName = category.name.toLowerCase();
      return categoryName.includes(descriptionLower) ||
             descriptionLower.includes(categoryName) ||
             this.matchCategoryKeywords(descriptionLower, categoryName);
    });

    return {
      customers: suggestedCustomers.slice(0, 5), // Limit to top 5
      vendors: suggestedVendors.slice(0, 5),
      categories: suggestedCategories.slice(0, 5),
    };
  }

  private matchCategoryKeywords(description: string, categoryName: string): boolean {
    // Define common keyword mappings
    const keywordMappings = {
      'rent': ['rent', 'lease', 'property'],
      'utilities': ['electric', 'gas', 'water', 'internet', 'phone'],
      'travel': ['hotel', 'flight', 'uber', 'taxi', 'fuel', 'gas'],
      'office': ['office', 'supplies', 'equipment', 'furniture'],
      'marketing': ['advertising', 'marketing', 'promotion', 'social media'],
      'insurance': ['insurance', 'premium', 'coverage'],
      'legal': ['legal', 'attorney', 'lawyer', 'court'],
      'accounting': ['accounting', 'bookkeeping', 'tax', 'cpa'],
    };

    for (const [category, keywords] of Object.entries(keywordMappings)) {
      if (categoryName.includes(category)) {
        return keywords.some(keyword => description.includes(keyword));
      }
    }
    
    return false;
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.email);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: UpsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<UpsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Role Management
  async getRoles(): Promise<UserRole[]> {
    return await db.select().from(userRoles).orderBy(userRoles.name);
  }

  async getRole(id: number): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.id, id));
    return role;
  }

  async createRole(role: InsertUserRole): Promise<UserRole> {
    const [newRole] = await db.insert(userRoles).values(role).returning();
    return newRole;
  }

  async updateRole(id: number, role: Partial<InsertUserRole>): Promise<UserRole> {
    const [updatedRole] = await db
      .update(userRoles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(userRoles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(userRoles).where(eq(userRoles.id, id));
  }

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions).orderBy(permissions.resource, permissions.action);
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db.insert(permissions).values(permission).returning();
    return newPermission;
  }

  async updatePermission(id: number, permission: Partial<InsertPermission>): Promise<Permission> {
    const [updatedPermission] = await db
      .update(permissions)
      .set(permission)
      .where(eq(permissions.id, id))
      .returning();
    return updatedPermission;
  }

  async deletePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  // Role Permission Management
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissionsList = await db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    
    return rolePermissionsList.map(rp => rp.permission);
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<RolePermission> {
    const [rolePermission] = await db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .returning();
    return rolePermission;
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db
      .delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }

  // User Role Assignment
  async getUserRoles(userId: string, companyId?: number): Promise<UserRole[]> {
    const conditions = [eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.isActive, true)];
    
    if (companyId) {
      conditions.push(eq(userRoleAssignments.companyId, companyId));
    }

    const userRolesList = await db
      .select({ role: userRoles })
      .from(userRoleAssignments)
      .innerJoin(userRoles, eq(userRoleAssignments.roleId, userRoles.id))
      .where(and(...conditions));
    
    return userRolesList.map(ur => ur.role);
  }

  async assignRoleToUser(userId: string, roleId: number, companyId?: number, assignedBy?: string): Promise<UserRoleAssignment> {
    const [roleAssignment] = await db
      .insert(userRoleAssignments)
      .values({
        userId,
        roleId,
        companyId,
        assignedBy,
        isActive: true,
      })
      .returning();
    return roleAssignment;
  }

  async removeRoleFromUser(userId: string, roleId: number, companyId?: number): Promise<void> {
    const conditions = [
      eq(userRoleAssignments.userId, userId),
      eq(userRoleAssignments.roleId, roleId)
    ];
    
    if (companyId) {
      conditions.push(eq(userRoleAssignments.companyId, companyId));
    }

    await db
      .update(userRoleAssignments)
      .set({ isActive: false })
      .where(and(...conditions));
  }

  async getUserPermissions(userId: string, companyId?: number): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId, companyId);
    const allPermissions: Permission[] = [];
    
    for (const role of userRoles) {
      const rolePermissions = await this.getRolePermissions(role.id);
      allPermissions.push(...rolePermissions);
    }
    
    // Remove duplicates
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;
  }

  async hasPermission(userId: string, resource: string, action: string, companyId?: number): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, companyId);
    return permissions.some(p => p.resource === resource && p.action === action);
  }

  // Initialize default roles and permissions
  async initializeDefaultRolesAndPermissions(): Promise<void> {
    // Define default permissions
    const defaultPermissions = [
      // Company permissions
      { name: 'company.read', resource: 'company', action: 'read', description: 'View company information' },
      { name: 'company.write', resource: 'company', action: 'write', description: 'Edit company information' },
      { name: 'company.delete', resource: 'company', action: 'delete', description: 'Delete company' },
      { name: 'company.manage', resource: 'company', action: 'manage', description: 'Full company management' },
      
      // Customer permissions
      { name: 'customers.read', resource: 'customers', action: 'read', description: 'View customers' },
      { name: 'customers.write', resource: 'customers', action: 'write', description: 'Edit customers' },
      { name: 'customers.delete', resource: 'customers', action: 'delete', description: 'Delete customers' },
      { name: 'customers.manage', resource: 'customers', action: 'manage', description: 'Full customer management' },
      
      // Vendor permissions
      { name: 'vendors.read', resource: 'vendors', action: 'read', description: 'View vendors' },
      { name: 'vendors.write', resource: 'vendors', action: 'write', description: 'Edit vendors' },
      { name: 'vendors.delete', resource: 'vendors', action: 'delete', description: 'Delete vendors' },
      { name: 'vendors.manage', resource: 'vendors', action: 'manage', description: 'Full vendor management' },
      
      // Transaction permissions
      { name: 'transactions.read', resource: 'transactions', action: 'read', description: 'View transactions' },
      { name: 'transactions.write', resource: 'transactions', action: 'write', description: 'Edit transactions' },
      { name: 'transactions.delete', resource: 'transactions', action: 'delete', description: 'Delete transactions' },
      { name: 'transactions.manage', resource: 'transactions', action: 'manage', description: 'Full transaction management' },
      
      // Bank statement permissions
      { name: 'bank_statements.read', resource: 'bank_statements', action: 'read', description: 'View bank statements' },
      { name: 'bank_statements.write', resource: 'bank_statements', action: 'write', description: 'Upload and categorize bank statements' },
      { name: 'bank_statements.delete', resource: 'bank_statements', action: 'delete', description: 'Delete bank statements' },
      { name: 'bank_statements.manage', resource: 'bank_statements', action: 'manage', description: 'Full bank statement management' },
      
      // Reports permissions
      { name: 'reports.read', resource: 'reports', action: 'read', description: 'View reports' },
      { name: 'reports.generate', resource: 'reports', action: 'generate', description: 'Generate reports' },
      { name: 'reports.export', resource: 'reports', action: 'export', description: 'Export reports' },
      
      // User management permissions
      { name: 'users.read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'users.write', resource: 'users', action: 'write', description: 'Edit users' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'users.manage', resource: 'users', action: 'manage', description: 'Full user management' },
      
      // Role management permissions
      { name: 'roles.read', resource: 'roles', action: 'read', description: 'View roles' },
      { name: 'roles.write', resource: 'roles', action: 'write', description: 'Edit roles' },
      { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles' },
      { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Full role management' },
    ];

    // Create permissions if they don't exist
    for (const permission of defaultPermissions) {
      const existing = await db.select().from(permissions).where(eq(permissions.name, permission.name));
      if (existing.length === 0) {
        await this.createPermission(permission);
      }
    }

    // Define default roles
    const defaultRoles = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        isSystemRole: true,
        permissions: defaultPermissions.map(p => p.name),
      },
      {
        name: 'Company Admin',
        description: 'Full access to company data and user management',
        isSystemRole: false,
        permissions: [
          'company.read', 'company.write', 'company.manage',
          'customers.read', 'customers.write', 'customers.delete', 'customers.manage',
          'vendors.read', 'vendors.write', 'vendors.delete', 'vendors.manage',
          'transactions.read', 'transactions.write', 'transactions.delete', 'transactions.manage',
          'bank_statements.read', 'bank_statements.write', 'bank_statements.delete', 'bank_statements.manage',
          'reports.read', 'reports.generate', 'reports.export',
          'users.read', 'users.write', 'users.delete',
          'roles.read',
        ],
      },
      {
        name: 'Accountant',
        description: 'Full access to financial data and transactions',
        isSystemRole: false,
        permissions: [
          'company.read',
          'customers.read', 'customers.write', 'customers.manage',
          'vendors.read', 'vendors.write', 'vendors.manage',
          'transactions.read', 'transactions.write', 'transactions.manage',
          'bank_statements.read', 'bank_statements.write', 'bank_statements.manage',
          'reports.read', 'reports.generate', 'reports.export',
        ],
      },
      {
        name: 'Bookkeeper',
        description: 'Data entry and basic transaction management',
        isSystemRole: false,
        permissions: [
          'company.read',
          'customers.read', 'customers.write',
          'vendors.read', 'vendors.write',
          'transactions.read', 'transactions.write',
          'bank_statements.read', 'bank_statements.write',
          'reports.read',
        ],
      },
      {
        name: 'Viewer',
        description: 'Read-only access to financial data',
        isSystemRole: false,
        permissions: [
          'company.read',
          'customers.read',
          'vendors.read',
          'transactions.read',
          'bank_statements.read',
          'reports.read',
        ],
      },
    ];

    // Create roles and assign permissions
    for (const roleData of defaultRoles) {
      const existing = await db.select().from(userRoles).where(eq(userRoles.name, roleData.name));
      if (existing.length === 0) {
        const role = await this.createRole({
          name: roleData.name,
          description: roleData.description,
          isSystemRole: roleData.isSystemRole,
        });

        // Assign permissions to role
        for (const permissionName of roleData.permissions) {
          const [permission] = await db.select().from(permissions).where(eq(permissions.name, permissionName));
          if (permission) {
            await this.assignPermissionToRole(role.id, permission.id);
          }
        }
      }
    }
  }

  // Analytics implementation
  async getAnalytics(companyId: number, timeRange: string): Promise<any> {
    try {
      // Calculate date range based on timeRange parameter
      const now = new Date();
      const months = timeRange === '24m' ? 24 : timeRange === '12m' ? 12 : timeRange === '6m' ? 6 : 3;
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get summary metrics
      const [revenueResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)` })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          gte(invoices.issueDate, startDate.toISOString().split('T')[0]),
          lte(invoices.issueDate, endDate.toISOString().split('T')[0])
        ));

      const [expenseResult] = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)` })
        .from(expenseTransactions)
        .where(and(
          eq(expenseTransactions.companyId, companyId),
          gte(expenseTransactions.transactionDate, startDate.toISOString().split('T')[0]),
          lte(expenseTransactions.transactionDate, endDate.toISOString().split('T')[0])
        ));

      const totalRevenue = revenueResult?.total || 0;
      const totalExpenses = expenseResult?.total || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Get outstanding balances
      const [outstandingReceivables] = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)` })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, 'SENT')
        ));

      const [outstandingPayables] = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)` })
        .from(bills)
        .where(and(
          eq(bills.companyId, companyId),
          eq(bills.status, 'PENDING')
        ));

      // Calculate burn rate (average monthly expenses)
      const monthlyExpenses = totalExpenses / months;
      const burnRate = monthlyExpenses;
      const runway = totalRevenue > 0 ? Math.floor(totalRevenue / burnRate) : 0;

      // Get monthly trends - use simpler approach for PostgreSQL
      const revenueTrends = await db
        .select({
          month: sql<string>`TO_CHAR(issue_date, 'YYYY-MM')`,
          amount: sql<number>`COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0)`
        })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          gte(invoices.issueDate, startDate.toISOString().split('T')[0])
        ))
        .groupBy(sql`TO_CHAR(issue_date, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(issue_date, 'YYYY-MM')`);

      const expenseTrends = await db
        .select({
          month: sql<string>`TO_CHAR(${expenseTransactions.transactionDate}, 'YYYY-MM')`,
          amount: sql<number>`COALESCE(SUM(${expenseTransactions.totalAmount}), 0)`
        })
        .from(expenseTransactions)
        .where(and(
          eq(expenseTransactions.companyId, companyId),
          gte(expenseTransactions.transactionDate, startDate.toISOString().split('T')[0])
        ))
        .groupBy(sql`TO_CHAR(${expenseTransactions.transactionDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${expenseTransactions.transactionDate}, 'YYYY-MM')`);

      // Get category breakdown
      const categoryBreakdown = await db
        .select({
          category: expenseCategories.name,
          amount: sql<number>`COALESCE(SUM(${expenseTransactions.totalAmount}), 0)`
        })
        .from(expenseTransactions)
        .leftJoin(expenseCategories, eq(expenseTransactions.expenseCategoryId, expenseCategories.id))
        .where(and(
          eq(expenseTransactions.companyId, companyId),
          gte(expenseTransactions.transactionDate, startDate.toISOString().split('T')[0])
        ))
        .groupBy(expenseCategories.name)
        .orderBy(sql`SUM(${expenseTransactions.totalAmount}) DESC`);

      const totalCategoryExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
      const categoryBreakdownWithPercentage = categoryBreakdown.map(cat => ({
        ...cat,
        percentage: totalCategoryExpenses > 0 ? (cat.amount / totalCategoryExpenses) * 100 : 0
      }));

      // Generate simple forecasts (linear projection based on recent trends)
      const forecastMonths = 6;
      const recentMonths = revenueTrends.slice(-3);
      const avgRevenueGrowth = recentMonths.length > 1 ? 
        (recentMonths[recentMonths.length - 1].amount - recentMonths[0].amount) / recentMonths.length : 0;
      
      const revenueForecast = Array.from({ length: forecastMonths }, (_, i) => {
        const futureMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
        const monthStr = futureMonth.toISOString().slice(0, 7);
        const baseAmount = recentMonths.length > 0 ? recentMonths[recentMonths.length - 1].amount : 0;
        return {
          month: monthStr,
          projected: Math.max(0, baseAmount + (avgRevenueGrowth * (i + 1))),
          confidence: Math.max(0.5, 0.9 - (i * 0.1))
        };
      });

      // Create alerts based on financial metrics
      const alerts = [];
      
      if (netProfit < 0) {
        alerts.push({
          type: 'danger',
          title: 'Negative Profit Margin',
          message: `Your expenses exceed revenue by ${Math.abs(netProfit).toFixed(2)}. Consider reducing costs or increasing revenue.`,
          severity: 'high'
        });
      }

      if (runway > 0 && runway < 3) {
        alerts.push({
          type: 'warning',
          title: 'Low Cash Runway',
          message: `At current burn rate, you have ${runway} months of runway remaining.`,
          severity: 'high'
        });
      }

      if (outstandingReceivables.total > totalRevenue * 0.3) {
        alerts.push({
          type: 'warning',
          title: 'High Outstanding Receivables',
          message: `${outstandingReceivables.total.toFixed(2)} in outstanding receivables. Consider following up on unpaid invoices.`,
          severity: 'medium'
        });
      }

      return {
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          cashFlow: netProfit, // Simplified cash flow
          outstandingReceivables: outstandingReceivables.total || 0,
          outstandingPayables: outstandingPayables.total || 0,
          burnRate,
          runway
        },
        trends: {
          revenue: revenueTrends,
          expenses: expenseTrends,
          profit: revenueTrends.map((rev, i) => ({
            month: rev.month,
            amount: rev.amount - (expenseTrends[i]?.amount || 0)
          })),
          cashFlow: revenueTrends.map((rev, i) => ({
            month: rev.month,
            amount: rev.amount - (expenseTrends[i]?.amount || 0)
          }))
        },
        forecasts: {
          revenue: revenueForecast,
          expenses: revenueForecast.map(f => ({ ...f, projected: f.projected * 0.8 })),
          cashFlow: revenueForecast.map(f => ({ ...f, projected: f.projected * 0.2 }))
        },
        categoryBreakdown: categoryBreakdownWithPercentage,
        alerts
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Return default empty analytics structure
      return {
        summary: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          cashFlow: 0,
          outstandingReceivables: 0,
          outstandingPayables: 0,
          burnRate: 0,
          runway: 0
        },
        trends: {
          revenue: [],
          expenses: [],
          profit: [],
          cashFlow: []
        },
        forecasts: {
          revenue: [],
          expenses: [],
          cashFlow: []
        },
        categoryBreakdown: [],
        alerts: []
      };
    }
  }

  // Dashboard helper methods
  async getTotalRevenue(companyId: number, startDate: string, endDate: string): Promise<number> {
    try {
      const result = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(CAST(${invoices.amount} AS NUMERIC)), 0)` 
        })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          gte(invoices.invoiceDate, startDate),
          lte(invoices.invoiceDate, endDate)
        ));
      
      return Number(result[0]?.total || 0);
    } catch (error) {
      console.error('Error in getTotalRevenue:', error);
      return 0;
    }
  }

  async getTotalExpenses(companyId: number, startDate: string, endDate: string): Promise<number> {
    try {
      const result = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(CAST(${expenseTransactions.totalAmount} AS NUMERIC)), 0)` 
        })
        .from(expenseTransactions)
        .where(and(
          eq(expenseTransactions.companyId, companyId),
          gte(expenseTransactions.transactionDate, startDate),
          lte(expenseTransactions.transactionDate, endDate)
        ));
      
      return Number(result[0]?.total || 0);
    } catch (error) {
      console.error('Error in getTotalExpenses:', error);
      return 0;
    }
  }

  async getOutstandingReceivables(companyId: number): Promise<number> {
    try {
      const result = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(CAST(${invoices.amount} AS NUMERIC)), 0)` 
        })
        .from(invoices)
        .where(and(
          eq(invoices.companyId, companyId),
          eq(invoices.status, 'SENT')
        ));
      
      return Number(result[0]?.total || 0);
    } catch (error) {
      console.error('Error in getOutstandingReceivables:', error);
      return 0;
    }
  }

  async getRecentTransactions(companyId: number, limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        id: expenseTransactions.id,
        transactionDate: expenseTransactions.transactionDate,
        description: expenseTransactions.description,
        totalAmount: expenseTransactions.totalAmount,
        categoryName: expenseCategories.name,
        vendorName: vendors.name,
        type: sql<string>`'expense'`,
      })
      .from(expenseTransactions)
      .leftJoin(expenseCategories, eq(expenseTransactions.expenseCategoryId, expenseCategories.id))
      .leftJoin(vendors, eq(expenseTransactions.vendorId, vendors.id))
      .where(eq(expenseTransactions.companyId, companyId))
      .orderBy(desc(expenseTransactions.transactionDate))
      .limit(limit);

    return result.map(row => ({
      ...row,
      totalAmount: Number(row.totalAmount || 0),
    }));
  }

  // Customer Statement with Pagination
  async getCustomerStatements(companyId: number, page: number = 1, limit: number = 10): Promise<{
    customers: any[],
    totalCount: number,
    totalPages: number,
    currentPage: number
  }> {
    const offset = (page - 1) * limit;

    try {
      // Get total count for pagination
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(eq(customers.companyId, companyId));

      const totalCount = Number(countResult?.count || 0);
      const totalPages = Math.ceil(totalCount / limit);

      // Get customers with their receivable and payable amounts from customer_statement_lines
      const customerStatements = await db
        .select({
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          paymentTerms: customers.paymentTerms,
          openingBalance: customers.openingBalance,
          receivableAmount: sql<number>`
            COALESCE(
              (SELECT SUM(CAST(revenue AS NUMERIC))
               FROM customer_statement_lines
               WHERE customer_id = customers.id
                 AND line_type = 'REVENUE'
              ), 0
            )
          `,
          paidAmount: sql<number>`
            COALESCE(
              (SELECT SUM(CAST(credit_amount AS NUMERIC))
               FROM customer_statement_lines
               WHERE customer_id = customers.id
                 AND line_type = 'BANK_TRANSACTION'
              ), 0
            )
          `,
          totalInvoiced: sql<number>`
            COALESCE(
              (SELECT SUM(CAST(revenue AS NUMERIC))
               FROM customer_statement_lines
               WHERE customer_id = customers.id
                 AND line_type = 'REVENUE'
              ), 0
            )
          `,
          invoiceCount: sql<number>`
            COALESCE(
              (SELECT COUNT(*)
               FROM customer_statement_lines
               WHERE customer_id = customers.id
                 AND line_type = 'REVENUE'
              ), 0
            )
          `,
          lastInvoiceDate: sql<string>`
            (SELECT MAX(line_date)
             FROM customer_statement_lines
             WHERE customer_id = customers.id
               AND line_type = 'REVENUE'
            )
          `
        })
        .from(customers)
        .where(eq(customers.companyId, companyId))
        .orderBy(customers.name)
        .limit(limit)
        .offset(offset);

      const processedCustomers = customerStatements.map(customer => ({
        ...customer,
        openingBalance: Number(customer.openingBalance || 0),
        receivableAmount: Number(customer.receivableAmount || 0),
        paidAmount: Number(customer.paidAmount || 0),
        totalInvoiced: Number(customer.totalInvoiced || 0),
        invoiceCount: Number(customer.invoiceCount || 0),
        // Calculate outstanding balance (receivables - what's been paid)
        outstandingBalance: Number(customer.receivableAmount || 0) - Number(customer.paidAmount || 0),
        // Calculate total balance including opening balance
        totalBalance: Number(customer.openingBalance || 0) + Number(customer.receivableAmount || 0) - Number(customer.paidAmount || 0),
      }));

      return {
        customers: processedCustomers,
        totalCount,
        totalPages,
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching customer statements:', error);
      return {
        customers: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }
  }

  // Get detailed customer statement summary with transaction lines
  async getCustomerStatementSummary(companyId: number, customerId: number): Promise<{
    openingBalance: number,
    totalRevenue: number,
    totalCost: number,
    totalDebits: number,
    totalCredits: number,
    closingBalance: number,
    lines: any[]
  }> {
    try {
      // Get customer's opening balance
      const [customer] = await db
        .select({ openingBalance: customers.openingBalance })
        .from(customers)
        .where(and(
          eq(customers.id, customerId),
          eq(customers.companyId, companyId)
        ));

      const openingBalance = Number(customer?.openingBalance || 0);

      // Get all transaction lines for this customer
      const lines = await db
        .select({
          id: customerStatementLines.id,
          lineDate: customerStatementLines.lineDate,
          lineType: customerStatementLines.lineType,
          description: customerStatementLines.description,
          revenue: customerStatementLines.revenue,
          cost: customerStatementLines.cost,
          nettingBalance: customerStatementLines.nettingBalance,
          debitAmount: customerStatementLines.debitAmount,
          creditAmount: customerStatementLines.creditAmount,
          runningBalance: customerStatementLines.runningBalance,
          referenceNumber: customerStatementLines.referenceNumber,
        })
        .from(customerStatementLines)
        .where(eq(customerStatementLines.customerId, customerId))
        .orderBy(customerStatementLines.lineDate, customerStatementLines.id);

      // Calculate totals
      const totalRevenue = lines.reduce((sum, line) => sum + Number(line.revenue || 0), 0);
      const totalCost = lines.reduce((sum, line) => sum + Number(line.cost || 0), 0);
      const totalDebits = lines.reduce((sum, line) => sum + Number(line.debitAmount || 0), 0);
      const totalCredits = lines.reduce((sum, line) => sum + Number(line.creditAmount || 0), 0);

      // Recalculate running balance correctly
      let runningBalance = openingBalance;
      const processedLines = lines.map(line => {
        const revenue = Number(line.revenue || 0);
        const cost = Number(line.cost || 0);
        const debitAmount = Number(line.debitAmount || 0);
        const creditAmount = Number(line.creditAmount || 0);
        
        // Calculate the impact of this line on the running balance
        // Revenue increases balance, Cost decreases balance
        // Debit increases balance (payment received), Credit decreases balance (payment made)
        const lineImpact = revenue - cost + debitAmount - creditAmount;
        runningBalance += lineImpact;
        
        return {
          ...line,
          revenue: revenue,
          cost: cost,
          nettingBalance: revenue - cost,
          debitAmount: debitAmount,
          creditAmount: creditAmount,
          runningBalance: parseFloat(runningBalance.toFixed(2)),
        };
      });

      const closingBalance = runningBalance;

      return {
        openingBalance,
        totalRevenue,
        totalCost,
        totalDebits,
        totalCredits,
        closingBalance,
        lines: processedLines
      };
    } catch (error) {
      console.error('Error fetching customer statement summary:', error);
      return {
        openingBalance: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalDebits: 0,
        totalCredits: 0,
        closingBalance: 0,
        lines: []
      };
    }
  }
}

export const storage = new DatabaseStorage();
