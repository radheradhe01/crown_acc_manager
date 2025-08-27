import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './accounting-utils';

export interface ExportData {
  filename: string;
  data: any[];
  headers?: string[];
}

export function exportToExcel(exportData: ExportData): void {
  const { filename, data, headers } = exportData;
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  let worksheet: XLSX.WorkSheet;
  
  if (headers && headers.length > 0) {
    // Use custom headers
    worksheet = XLSX.utils.aoa_to_sheet([headers, ...data.map(row => headers.map(header => getValueByHeader(row, header)))]);
  } else {
    // Use data keys as headers
    worksheet = XLSX.utils.json_to_sheet(data);
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate and download file
  const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

function getValueByHeader(row: any, header: string): any {
  // Map display headers to actual data properties
  const headerMap: { [key: string]: string } = {
    'Customer Name': 'name',
    'Email': 'email',
    'Phone': 'phone',
    'Payment Terms': 'paymentTerms',
    'Opening Balance': 'openingBalance',
    'Total Revenue': 'totalRevenue',
    'Total Cost': 'totalCost',
    'Total Credits': 'totalCredits',
    'Total Debits': 'totalDebits',
    'Closing Balance': 'closingBalance',
    'Outstanding Balance': 'balanceDue',
    'Days Overdue': 'daysOverdue',
    'Invoice Count': 'invoiceCount',
    'Last Invoice Date': 'oldestDueDate',
    'Transaction Date': 'transactionDate',
    'Description': 'description',
    'Amount': 'amount',
    'Type': 'type',
    'Category': 'category',
    'Running Balance': 'runningBalance',
    'Status': 'status',
    'Vendor Name': 'vendorName',
    'Customer': 'customerName',
    'Revenue': 'revenue',
    'Cost': 'cost',
    'Line Date': 'lineDate',
    'Line Type': 'lineType',
    'Debit Amount': 'debitAmount',
    'Credit Amount': 'creditAmount',
    'Netting Balance': 'nettingBalance'
  };
  
  const property = headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
  let value = row[property];
  
  // Format common data types
  if (value === null || value === undefined) {
    return '';
  }
  
  // Format currency values
  if (header.includes('Balance') || header.includes('Amount') || header.includes('Revenue') || header.includes('Cost')) {
    return typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
  }
  
  // Format dates
  if (header.includes('Date')) {
    return value ? formatDate(value) : '';
  }
  
  return value;
}

// Specific export functions for different data types
export function exportCustomerStatements(customers: any[]): void {
  const headers = [
    'Customer Name',
    'Email',
    'Phone',
    'Payment Terms',
    'Opening Balance',
    'Total Revenue',
    'Total Cost',
    'Total Credits',
    'Total Debits',
    'Closing Balance'
  ];
  
  const data = customers.map(customer => ({
    name: customer.customer?.name || customer.name || '',
    email: customer.customer?.email || customer.email || '',
    phone: customer.customer?.phone || customer.phone || '',
    paymentTerms: customer.customer?.paymentTerms || customer.paymentTerms || '',
    openingBalance: customer.summary?.openingBalance || customer.openingBalance || 0,
    totalRevenue: customer.summary?.totalRevenue || customer.totalRevenue || 0,
    totalCost: customer.summary?.totalCost || customer.totalCost || 0,
    totalCredits: customer.summary?.totalCredits || customer.totalCredits || 0,
    totalDebits: customer.summary?.totalDebits || customer.totalDebits || 0,
    closingBalance: customer.summary?.closingBalance || customer.closingBalance || customer.totalBalance || 0
  }));
  
  exportToExcel({
    filename: 'customer_statements',
    data,
    headers
  });
}

export function exportOutstandingBalances(customers: any[]): void {
  const headers = [
    'Customer Name',
    'Outstanding Balance',
    'Days Overdue',
    'Invoice Count',
    'Last Invoice Date',
    'Email',
    'Payment Terms'
  ];
  
  const data = customers.map(customer => ({
    name: customer.customer?.name || customer.name || '',
    balanceDue: customer.summary?.closingBalance || customer.balanceDue || customer.totalBalance || 0,
    daysOverdue: customer.daysOverdue || 0,
    invoiceCount: customer.invoiceCount || 0,
    oldestDueDate: customer.oldestDueDate || customer.oldestInvoiceDate || '',
    email: customer.customer?.email || customer.email || '',
    paymentTerms: customer.customer?.paymentTerms || customer.paymentTerms || ''
  }));
  
  exportToExcel({
    filename: 'outstanding_balances',
    data,
    headers
  });
}

export function exportBankTransactions(transactions: any[]): void {
  const headers = [
    'Transaction Date',
    'Description',
    'Debit Amount',
    'Credit Amount',
    'Running Balance',
    'Category',
    'Status'
  ];
  
  const data = transactions.map(transaction => ({
    transactionDate: transaction.transactionDate || '',
    description: transaction.description || '',
    debitAmount: parseFloat(transaction.debitAmount || '0'),
    creditAmount: parseFloat(transaction.creditAmount || '0'),
    runningBalance: parseFloat(transaction.runningBalance || '0'),
    category: transaction.categoryName || 'Uncategorized',
    status: (transaction.categoryId || transaction.customerId || transaction.vendorId) ? 'Categorized' : 'Uncategorized'
  }));
  
  exportToExcel({
    filename: 'bank_transactions',
    data,
    headers
  });
}

export function exportExpenseTransactions(transactions: any[]): void {
  const headers = [
    'Transaction Date',
    'Description',
    'Total Amount',
    'Sales Tax',
    'Category',
    'Vendor Name',
    'Transaction Type',
    'Status'
  ];
  
  const data = transactions.map(transaction => ({
    transactionDate: transaction.transactionDate || '',
    description: transaction.description || '',
    totalAmount: parseFloat(transaction.totalAmount || '0'),
    salesTax: parseFloat(transaction.salesTax || '0'),
    category: transaction.categoryName || '',
    vendorName: transaction.vendorName || '',
    transactionType: transaction.transactionType || '',
    status: transaction.status || 'Active'
  }));
  
  exportToExcel({
    filename: 'expense_transactions',
    data,
    headers
  });
}

export function exportRevenueData(data: any[]): void {
  const headers = [
    'Customer',
    'Line Date',
    'Line Type',
    'Description',
    'Revenue',
    'Cost',
    'Debit Amount',
    'Credit Amount',
    'Netting Balance',
    'Running Balance'
  ];
  
  const exportData = data.map(line => ({
    customerName: line.customer?.name || '',
    lineDate: line.lineDate || '',
    lineType: line.lineType || '',
    description: line.description || '',
    revenue: line.revenue || 0,
    cost: line.cost || 0,
    debitAmount: line.debitAmount || 0,
    creditAmount: line.creditAmount || 0,
    nettingBalance: line.nettingBalance || 0,
    runningBalance: line.runningBalance || 0
  }));
  
  exportToExcel({
    filename: 'revenue_data',
    data: exportData,
    headers
  });
}