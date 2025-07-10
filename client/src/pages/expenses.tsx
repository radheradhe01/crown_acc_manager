import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Eye, Trash2, Filter, Calendar, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";
import { apiRequest } from "@/lib/queryClient";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { EnhancedCategorySelector } from "@/components/enhanced-category-selector";
import type { ExpenseTransaction, ExpenseCategory, Vendor } from "@shared/schema";

export default function Expenses() {
  const { currentCompany } = useCurrentCompany();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | undefined>();
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("12_months");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expenses = [], isLoading } = useQuery<ExpenseTransaction[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-transactions`],
    enabled: !!currentCompany?.id,
  });

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`],
    enabled: !!currentCompany?.id,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/vendors`],
    enabled: !!currentCompany?.id,
  });

  const handleEdit = (expense: ExpenseTransaction) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterType !== "all" && expense.transactionType !== filterType) {
      return false;
    }
    
    // Date filter logic
    const expenseDate = new Date(expense.transactionDate);
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    
    if (dateRange === "12_months" && expenseDate < monthsAgo) {
      return false;
    }
    
    return true;
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to manage expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Expense Management"
        description="Record and track business expenses with detailed categorization"
        showActions={false}
      />
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(filteredExpenses
                  .filter(exp => new Date(exp.transactionDate).getMonth() === new Date().getMonth())
                  .reduce((sum, exp) => sum + parseFloat(exp.totalAmount), 0))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Total Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.salesTax), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Label htmlFor="filter-type" className="text-sm font-medium">Type:</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="EXPENSE">Expenses</SelectItem>
                  <SelectItem value="BILL">Bills</SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Label htmlFor="date-range" className="text-sm font-medium">Period:</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12_months">Last 12 Months</SelectItem>
                  <SelectItem value="6_months">Last 6 Months</SelectItem>
                  <SelectItem value="3_months">Last 3 Months</SelectItem>
                  <SelectItem value="1_month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={() => setIsExpenseModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Expense
          </Button>
        </div>

        {/* Expense Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Expense Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No expenses found</p>
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Your First Expense
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount Before Tax</TableHead>
                    <TableHead>Sales Tax</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{formatDate(expense.transactionDate)}</TableCell>
                      <TableCell>
                        <Badge variant={expense.transactionType === "EXPENSE" ? "default" : "secondary"}>
                          {expense.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.payee}</TableCell>
                      <TableCell>
                        {categories.find(cat => cat.id === expense.expenseCategoryId)?.name || "Unknown"}
                      </TableCell>
                      <TableCell>{formatCurrency(parseFloat(expense.amountBeforeTax))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(expense.salesTax))}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(parseFloat(expense.totalAmount))}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </>
  );
}

// Expense Form Modal Component
function ExpenseFormModal({ 
  isOpen, 
  onClose, 
  expense 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  expense?: ExpenseTransaction;
}) {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    transactionDate: expense?.transactionDate || new Date().toISOString().split('T')[0],
    payee: expense?.payee || "",
    transactionType: expense?.transactionType || "EXPENSE",
    description: expense?.description || "",
    amountBeforeTax: expense?.amountBeforeTax || "",
    salesTax: expense?.salesTax || "0.00",
    expenseCategoryId: expense?.expenseCategoryId || 0,
    vendorId: expense?.vendorId || 0,
    notes: expense?.notes || ""
  });

  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`],
    enabled: !!currentCompany?.id,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/vendors`],
    enabled: !!currentCompany?.id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const totalAmount = parseFloat(data.amountBeforeTax) + parseFloat(data.salesTax);
      const expenseData = {
        ...data,
        companyId: currentCompany?.id,
        totalAmount: totalAmount.toFixed(2),
        expenseCategoryId: data.expenseCategoryId > 0 ? data.expenseCategoryId : null,
        vendorId: data.vendorId > 0 ? data.vendorId : null
      };

      if (expense) {
        return await apiRequest("PUT", `/api/companies/${currentCompany?.id}/expense-transactions/${expense.id}`, expenseData);
      } else {
        return await apiRequest("POST", `/api/companies/${currentCompany?.id}/expense-transactions`, expenseData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-transactions`] });
      toast({ title: expense ? "Expense updated successfully" : "Expense created successfully" });
      onClose();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpenseMutation.mutate(formData);
  };

  const handleCategorySelect = (category: ExpenseCategory) => {
    setFormData(prev => ({ ...prev, expenseCategoryId: category.id }));
  };

  const totalAmount = parseFloat(formData.amountBeforeTax || "0") + parseFloat(formData.salesTax || "0");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.transactionType} onValueChange={(value) => setFormData(prev => ({ ...prev, transactionType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="BILL">Bill</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payee">Payee *</Label>
            <Input
              id="payee"
              placeholder="Enter payee name..."
              value={formData.payee}
              onChange={(e) => setFormData(prev => ({ ...prev, payee: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Expense Category *</Label>
            <EnhancedCategorySelector
              selectedCategoryId={formData.expenseCategoryId > 0 ? formData.expenseCategoryId : undefined}
              onCategorySelect={handleCategorySelect}
              placeholder="Select or create category..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor (Optional)</Label>
            <Select value={formData.vendorId.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Vendor</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Before Tax *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amountBeforeTax}
                onChange={(e) => setFormData(prev => ({ ...prev, amountBeforeTax: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax">Sales Tax</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.salesTax}
                onChange={(e) => setFormData(prev => ({ ...prev, salesTax: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="flex items-center h-10 px-3 py-2 text-sm bg-gray-100 rounded-md border font-semibold">
                {formatCurrency(totalAmount)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpenseMutation.isPending}>
              {createExpenseMutation.isPending ? "Saving..." : (expense ? "Update Expense" : "Create Expense")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}