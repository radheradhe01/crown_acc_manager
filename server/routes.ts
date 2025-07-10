import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { 
  insertCompanySchema, 
  insertCustomerSchema, 
  insertVendorSchema, 
  insertBankAccountSchema,
  insertTransactionSchema,
  insertInvoiceSchema,
  insertBillSchema,
  insertExpenseCategorySchema,
  insertBankStatementUploadSchema,
  insertBankStatementTransactionSchema,
  insertRevenueUploadSchema,
  insertCustomerStatementLineSchema,
  insertUserRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  insertUserRoleAssignmentSchema
} from "@shared/schema";

// Permission middleware for checking user permissions
const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For now, we'll bypass permission checks - in production, this would check actual user auth
      // TODO: Implement proper authentication and permission checking
      // const userId = req.user?.id;
      // const companyId = req.params.companyId ? parseInt(req.params.companyId) : undefined;
      // const hasPermission = await storage.hasPermission(userId, resource, action, companyId);
      // if (!hasPermission) {
      //   return res.status(403).json({ message: "Insufficient permissions" });
      // }
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default roles and permissions on startup
  try {
    await storage.initializeDefaultRolesAndPermissions();
    console.log("Default roles and permissions initialized");
  } catch (error) {
    console.error("Error initializing default roles and permissions:", error);
  }

  // Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, validatedData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(400).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompany(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Customers routes
  app.get("/api/companies/:companyId/customers", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const customers = await storage.getCustomers(companyId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/companies/:companyId/customers", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const validatedData = insertCustomerSchema.parse({
        ...req.body,
        companyId: companyId
      });
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Vendors routes
  app.get("/api/companies/:companyId/vendors", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const vendors = await storage.getVendors(companyId);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(400).json({ message: "Failed to create vendor" });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVendorSchema.partial().parse(req.body);
      const vendor = await storage.updateVendor(id, validatedData);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(400).json({ message: "Failed to update vendor" });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVendor(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Bank Accounts routes
  app.get("/api/companies/:companyId/bank-accounts", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const bankAccounts = await storage.getBankAccounts(companyId);
      res.json(bankAccounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
  });

  app.post("/api/bank-accounts", async (req, res) => {
    try {
      const validatedData = insertBankAccountSchema.parse(req.body);
      const bankAccount = await storage.createBankAccount(validatedData);
      res.status(201).json(bankAccount);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(400).json({ message: "Failed to create bank account" });
    }
  });

  app.put("/api/bank-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBankAccountSchema.partial().parse(req.body);
      const bankAccount = await storage.updateBankAccount(id, validatedData);
      res.json(bankAccount);
    } catch (error) {
      console.error("Error updating bank account:", error);
      res.status(400).json({ message: "Failed to update bank account" });
    }
  });

  app.delete("/api/bank-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBankAccount(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bank account:", error);
      res.status(500).json({ message: "Failed to delete bank account" });
    }
  });

  // Transactions routes
  app.get("/api/companies/:companyId/transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTransactions(companyId, page, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Invoices routes
  app.get("/api/companies/:companyId/invoices", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const invoices = await storage.getInvoices(companyId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  // Bills routes
  app.get("/api/companies/:companyId/bills", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const bills = await storage.getBills(companyId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(validatedData);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      res.status(400).json({ message: "Failed to create bill" });
    }
  });

  // Expense Categories routes
  app.get("/api/companies/:companyId/expense-categories", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const categories = await storage.getExpenseCategories(companyId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.post("/api/companies/:companyId/expense-categories", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const validatedData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(companyId, validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      res.status(400).json({ message: "Failed to create expense category" });
    }
  });

  app.patch("/api/companies/:companyId/expense-categories/:categoryId", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const categoryId = parseInt(req.params.categoryId);
      const updates = req.body;
      const category = await storage.updateExpenseCategory(companyId, categoryId, updates);
      res.json(category);
    } catch (error) {
      console.error("Error updating expense category:", error);
      res.status(500).json({ message: "Failed to update expense category" });
    }
  });

  app.delete("/api/companies/:companyId/expense-categories/:categoryId", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const categoryId = parseInt(req.params.categoryId);
      await storage.deleteExpenseCategory(companyId, categoryId);
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense category:", error);
      res.status(500).json({ message: "Failed to delete expense category" });
    }
  });

  // Expense Transactions routes
  app.get("/api/companies/:companyId/expense-transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const transactions = await storage.getExpenseTransactions(companyId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching expense transactions:", error);
      res.status(500).json({ message: "Failed to fetch expense transactions" });
    }
  });

  app.get("/api/companies/:companyId/expense-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getExpenseTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Expense transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching expense transaction:", error);
      res.status(500).json({ message: "Failed to fetch expense transaction" });
    }
  });

  app.post("/api/companies/:companyId/expense-transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const transactionData = { ...req.body, companyId };
      const transaction = await storage.createExpenseTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating expense transaction:", error);
      res.status(500).json({ message: "Failed to create expense transaction" });
    }
  });

  app.put("/api/companies/:companyId/expense-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.updateExpenseTransaction(id, req.body);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating expense transaction:", error);
      res.status(500).json({ message: "Failed to update expense transaction" });
    }
  });

  app.delete("/api/companies/:companyId/expense-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExpenseTransaction(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense transaction:", error);
      res.status(500).json({ message: "Failed to delete expense transaction" });
    }
  });

  // Analytics endpoint
  app.get("/api/companies/:companyId/analytics", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const timeRange = req.query.timeRange as string || "12m";
      const analytics = await storage.getAnalytics(companyId, timeRange);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Bank Statement Upload routes
  app.get("/api/companies/:companyId/bank-uploads", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const uploads = await storage.getBankStatementUploads(companyId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching bank uploads:", error);
      res.status(500).json({ message: "Failed to fetch bank uploads" });
    }
  });

  app.get("/api/companies/:companyId/bank-statement-transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const uploadId = req.query.uploadId ? parseInt(req.query.uploadId as string) : undefined;
      const transactions = await storage.getBankStatementTransactions(companyId, uploadId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank statement transactions:", error);
      res.status(500).json({ message: "Failed to fetch bank statement transactions" });
    }
  });

  app.put("/api/bank-statement-transactions/:id/categorize", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categorization = req.body;
      const transaction = await storage.categorizeBankTransaction(id, categorization);

      // If this is an expense transaction (has categoryId), create an expense transaction record
      if (categorization.categoryId && transaction) {
        try {
          // Extract payee from description (before " - " if exists)
          const payee = transaction.description.split(' - ')[0] || transaction.description;
          
          const expenseTransaction = {
            companyId: transaction.companyId,
            expenseCategoryId: categorization.categoryId,
            transactionDate: transaction.transactionDate,
            payee: payee,
            transactionType: 'EXPENSE' as const,
            description: transaction.description,
            amountBeforeTax: transaction.debitAmount !== '0.00' ? transaction.debitAmount : transaction.creditAmount,
            salesTax: '0.00',
            totalAmount: transaction.debitAmount !== '0.00' ? transaction.debitAmount : transaction.creditAmount,
            vendorId: categorization.vendorId || null,
            notes: categorization.notes || `Auto-created from bank transaction ID ${id}`
          };

          await storage.createExpenseTransaction(expenseTransaction);
          console.log(`Created expense transaction for bank transaction ${id}`);
        } catch (expenseError) {
          console.error("Error creating expense transaction:", expenseError);
          // Don't fail the entire categorization if expense creation fails
        }
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error categorizing bank transaction:", error);
      res.status(400).json({ message: "Failed to categorize bank transaction" });
    }
  });

  app.post("/api/bank-uploads", async (req, res) => {
    try {
      const { csvData, ...uploadData } = req.body;
      const validatedData = insertBankStatementUploadSchema.parse(uploadData);
      
      // Create the upload record
      const upload = await storage.createBankStatementUpload(validatedData);
      
      // Process the CSV data if provided
      if (csvData && Array.isArray(csvData)) {
        try {
          console.log(`Processing ${csvData.length} rows for upload ${upload.id}`);
          await storage.processBankStatementUpload(upload.id, csvData);
          console.log(`Successfully processed upload ${upload.id}`);
        } catch (processError) {
          console.error("Error processing bank statement upload:", processError);
          // Update upload status to failed
          await storage.updateBankStatementUpload(upload.id, {
            status: "FAILED",
            errorMessage: processError instanceof Error ? processError.message : 'Processing failed',
          });
        }
      }
      
      res.status(201).json(upload);
    } catch (error) {
      console.error("Error creating bank upload:", error);
      res.status(400).json({ message: "Failed to create bank upload" });
    }
  });

  // Dashboard routes
  app.get("/api/companies/:companyId/dashboard/metrics", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const metrics = await storage.getDashboardMetrics(companyId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/companies/:companyId/dashboard/recent-transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(companyId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/companies/:companyId/dashboard/outstanding-customers", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const customers = await storage.getOutstandingCustomers(companyId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching outstanding customers:", error);
      res.status(500).json({ message: "Failed to fetch outstanding customers" });
    }
  });

  // Chart of Accounts routes
  app.get("/api/companies/:companyId/chart-of-accounts", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const accounts = await storage.getChartOfAccounts(companyId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching chart of accounts:", error);
      res.status(500).json({ message: "Failed to fetch chart of accounts" });
    }
  });

  // P&L Report
  app.get("/api/companies/:companyId/reports/profit-loss", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const { startDate, endDate } = req.query;
      
      const report = await storage.getProfitLossReport(
        companyId,
        startDate as string,
        endDate as string
      );
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching P&L report:", error);
      res.status(500).json({ message: "Failed to fetch P&L report" });
    }
  });

  // Balance Sheet Report
  app.get("/api/companies/:companyId/reports/balance-sheet", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const { asOfDate } = req.query;
      
      const report = await storage.getBalanceSheetReport(
        companyId,
        asOfDate as string
      );
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching balance sheet report:", error);
      res.status(500).json({ message: "Failed to fetch balance sheet report" });
    }
  });

  // Revenue Upload routes
  app.get("/api/companies/:companyId/revenue-uploads", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const uploads = await storage.getRevenueUploads(companyId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching revenue uploads:", error);
      res.status(500).json({ message: "Failed to fetch revenue uploads" });
    }
  });

  app.get("/api/revenue-uploads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const upload = await storage.getRevenueUpload(id);
      if (!upload) {
        return res.status(404).json({ message: "Revenue upload not found" });
      }
      res.json(upload);
    } catch (error) {
      console.error("Error fetching revenue upload:", error);
      res.status(500).json({ message: "Failed to fetch revenue upload" });
    }
  });

  app.post("/api/revenue-uploads", async (req, res) => {
    try {
      const validatedData = insertRevenueUploadSchema.parse(req.body);
      const upload = await storage.createRevenueUpload(validatedData);
      res.status(201).json(upload);
    } catch (error) {
      console.error("Error creating revenue upload:", error);
      res.status(400).json({ message: "Failed to create revenue upload" });
    }
  });

  app.put("/api/revenue-uploads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRevenueUploadSchema.partial().parse(req.body);
      const upload = await storage.updateRevenueUpload(id, validatedData);
      res.json(upload);
    } catch (error) {
      console.error("Error updating revenue upload:", error);
      res.status(400).json({ message: "Failed to update revenue upload" });
    }
  });

  app.post("/api/revenue-uploads/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { csvData } = req.body;
      
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "CSV data is required" });
      }
      
      await storage.processRevenueUpload(id, csvData);
      res.json({ message: "Revenue upload processed successfully" });
    } catch (error) {
      console.error("Error processing revenue upload:", error);
      res.status(500).json({ message: "Failed to process revenue upload" });
    }
  });

  // Customer Statement Lines routes
  app.get("/api/companies/:companyId/customers/:customerId/statement-lines", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const customerId = parseInt(req.params.customerId);
      const { startDate, endDate } = req.query;
      
      const lines = await storage.getCustomerStatementLines(
        companyId,
        customerId,
        startDate as string,
        endDate as string
      );
      res.json(lines);
    } catch (error) {
      console.error("Error fetching customer statement lines:", error);
      res.status(500).json({ message: "Failed to fetch customer statement lines" });
    }
  });

  app.get("/api/companies/:companyId/customers/:customerId/statement-summary", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const customerId = parseInt(req.params.customerId);
      const { startDate, endDate } = req.query;
      
      const summary = await storage.getCustomerStatementSummary(
        companyId,
        customerId,
        startDate as string,
        endDate as string
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching customer statement summary:", error);
      res.status(500).json({ message: "Failed to fetch customer statement summary" });
    }
  });

  app.get("/api/customer-statement-lines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const line = await storage.getCustomerStatementLine(id);
      if (!line) {
        return res.status(404).json({ message: "Customer statement line not found" });
      }
      res.json(line);
    } catch (error) {
      console.error("Error fetching customer statement line:", error);
      res.status(500).json({ message: "Failed to fetch customer statement line" });
    }
  });

  app.post("/api/customer-statement-lines", async (req, res) => {
    try {
      const validatedData = insertCustomerStatementLineSchema.parse(req.body);
      const line = await storage.createCustomerStatementLine(validatedData);
      res.status(201).json(line);
    } catch (error) {
      console.error("Error creating customer statement line:", error);
      res.status(400).json({ message: "Failed to create customer statement line" });
    }
  });

  app.put("/api/customer-statement-lines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerStatementLineSchema.partial().parse(req.body);
      const line = await storage.updateCustomerStatementLine(id, validatedData);
      res.json(line);
    } catch (error) {
      console.error("Error updating customer statement line:", error);
      res.status(400).json({ message: "Failed to update customer statement line" });
    }
  });

  app.delete("/api/customer-statement-lines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomerStatementLine(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer statement line:", error);
      res.status(500).json({ message: "Failed to delete customer statement line" });
    }
  });

  // Bank Statement Transaction routes
  app.get("/api/companies/:companyId/bank-statement-transactions", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const uploadId = req.query.uploadId ? parseInt(req.query.uploadId as string) : undefined;
      const transactions = await storage.getBankStatementTransactions(companyId, uploadId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank statement transactions:", error);
      res.status(500).json({ message: "Failed to fetch bank statement transactions" });
    }
  });

  app.get("/api/bank-statement-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getBankStatementTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Bank statement transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching bank statement transaction:", error);
      res.status(500).json({ message: "Failed to fetch bank statement transaction" });
    }
  });

  app.post("/api/bank-statement-transactions", async (req, res) => {
    try {
      const validatedData = insertBankStatementTransactionSchema.parse(req.body);
      const transaction = await storage.createBankStatementTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating bank statement transaction:", error);
      res.status(400).json({ message: "Failed to create bank statement transaction" });
    }
  });

  app.put("/api/bank-statement-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBankStatementTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateBankStatementTransaction(id, validatedData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating bank statement transaction:", error);
      res.status(400).json({ message: "Failed to update bank statement transaction" });
    }
  });

  app.delete("/api/bank-statement-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBankStatementTransaction(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bank statement transaction:", error);
      res.status(500).json({ message: "Failed to delete bank statement transaction" });
    }
  });

  app.put("/api/bank-statement-transactions/:id/categorize", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { categoryId, customerId, vendorId, notes } = req.body;
      
      const transaction = await storage.categorizeBankTransaction(id, {
        categoryId,
        customerId,
        vendorId,
        notes
      });
      res.json(transaction);
    } catch (error) {
      console.error("Error categorizing bank statement transaction:", error);
      res.status(400).json({ message: "Failed to categorize bank statement transaction" });
    }
  });

  app.get("/api/companies/:companyId/bank-transactions/suggest-categorization", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const { description, amount } = req.query;
      
      if (!description || !amount) {
        return res.status(400).json({ message: "Description and amount are required" });
      }
      
      const suggestions = await storage.suggestTransactionCategorization(
        description as string,
        parseFloat(amount as string),
        companyId
      );
      res.json(suggestions);
    } catch (error) {
      console.error("Error suggesting categorization:", error);
      res.status(500).json({ message: "Failed to suggest categorization" });
    }
  });

  // Process bank statement upload
  app.post("/api/bank-statement-uploads/:id/process", async (req, res) => {
    try {
      const uploadId = parseInt(req.params.id);
      const { csvData } = req.body;
      
      if (!csvData || !Array.isArray(csvData)) {
        return res.status(400).json({ message: "CSV data is required" });
      }
      
      await storage.processBankStatementUpload(uploadId, csvData);
      res.json({ message: "Bank statement processed successfully" });
    } catch (error) {
      console.error("Error processing bank statement upload:", error);
      res.status(400).json({ message: "Failed to process bank statement upload" });
    }
  });

  // User Management Routes
  app.get("/api/users", requirePermission("users", "read"), async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requirePermission("users", "read"), async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requirePermission("users", "write"), async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requirePermission("users", "write"), async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requirePermission("users", "delete"), async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Role Management Routes
  app.get("/api/roles", requirePermission("roles", "read"), async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", requirePermission("roles", "read"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", requirePermission("roles", "write"), async (req, res) => {
    try {
      const validatedData = insertUserRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(400).json({ message: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", requirePermission("roles", "write"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, validatedData);
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(400).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", requirePermission("roles", "delete"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Permission Management Routes
  app.get("/api/permissions", requirePermission("roles", "read"), async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.get("/api/roles/:id/permissions", requirePermission("roles", "read"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/roles/:roleId/permissions/:permissionId", requirePermission("roles", "write"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      const rolePermission = await storage.assignPermissionToRole(roleId, permissionId);
      res.status(201).json(rolePermission);
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      res.status(400).json({ message: "Failed to assign permission to role" });
    }
  });

  app.delete("/api/roles/:roleId/permissions/:permissionId", requirePermission("roles", "write"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      await storage.removePermissionFromRole(roleId, permissionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing permission from role:", error);
      res.status(500).json({ message: "Failed to remove permission from role" });
    }
  });

  // User Role Assignment Routes
  app.get("/api/users/:id/roles", requirePermission("users", "read"), async (req, res) => {
    try {
      const userId = req.params.id;
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const roles = await storage.getUserRoles(userId, companyId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.post("/api/users/:userId/roles/:roleId", requirePermission("users", "write"), async (req, res) => {
    try {
      const userId = req.params.userId;
      const roleId = parseInt(req.params.roleId);
      const companyId = req.body.companyId ? parseInt(req.body.companyId) : undefined;
      const assignedBy = req.body.assignedBy;
      
      const roleAssignment = await storage.assignRoleToUser(userId, roleId, companyId, assignedBy);
      res.status(201).json(roleAssignment);
    } catch (error) {
      console.error("Error assigning role to user:", error);
      res.status(400).json({ message: "Failed to assign role to user" });
    }
  });

  app.delete("/api/users/:userId/roles/:roleId", requirePermission("users", "write"), async (req, res) => {
    try {
      const userId = req.params.userId;
      const roleId = parseInt(req.params.roleId);
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      
      await storage.removeRoleFromUser(userId, roleId, companyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing role from user:", error);
      res.status(500).json({ message: "Failed to remove role from user" });
    }
  });

  app.get("/api/users/:id/permissions", requirePermission("users", "read"), async (req, res) => {
    try {
      const userId = req.params.id;
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const permissions = await storage.getUserPermissions(userId, companyId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post("/api/users/:id/check-permission", requirePermission("users", "read"), async (req, res) => {
    try {
      const userId = req.params.id;
      const { resource, action, companyId } = req.body;
      const hasPermission = await storage.hasPermission(userId, resource, action, companyId);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking user permission:", error);
      res.status(500).json({ message: "Failed to check user permission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
