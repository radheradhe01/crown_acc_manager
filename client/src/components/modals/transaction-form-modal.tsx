import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest } from "@/lib/queryClient";
import { EnhancedCategorySelector } from "@/components/enhanced-category-selector";
import { DollarSign, Receipt, CreditCard, Plus } from "lucide-react";
import type { ExpenseCategory, Customer, Vendor } from "@shared/schema";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionFormModal({ isOpen, onClose }: TransactionFormModalProps) {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("expense");
  
  const [expenseForm, setExpenseForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    payee: "",
    description: "",
    amountBeforeTax: "",
    salesTax: "0.00",
    expenseCategoryId: 0,
    vendorId: 0,
    transactionType: "EXPENSE",
    notes: ""
  });

  const [incomeForm, setIncomeForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    customerName: "",
    description: "",
    amount: "",
    customerId: 0,
    invoiceNumber: "",
    dueDate: "",
    notes: ""
  });

  const [transferForm, setTransferForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    fromAccount: "",
    toAccount: "",
    notes: ""
  });

  const { data: categoriesData } = useQuery<{categories: ExpenseCategory[], totalCount: number}>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`, 1, 100],
    enabled: !!currentCompany?.id && activeTab === "expense",
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers`],
    enabled: !!currentCompany?.id && activeTab === "income",
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/vendors`],
    enabled: !!currentCompany?.id && activeTab === "expense",
  });

  const expenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const expenseData = {
        ...data,
        companyId: currentCompany?.id,
        totalAmount: (parseFloat(data.amountBeforeTax) + parseFloat(data.salesTax)).toFixed(2)
      };
      return await apiRequest(`/api/companies/${currentCompany?.id}/expense-transactions`, {
        method: "POST",
        body: expenseData
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-transactions`] });
      resetForms();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const incomeMutation = useMutation({
    mutationFn: async (data: any) => {
      const invoiceData = {
        companyId: currentCompany?.id,
        customerId: data.customerId,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.transactionDate,
        dueDate: data.dueDate,
        subtotal: parseFloat(data.amount),
        taxAmount: 0,
        totalAmount: parseFloat(data.amount),
        status: "PAID",
        notes: data.notes
      };
      return await apiRequest(`/api/companies/${currentCompany?.id}/invoices`, {
        method: "POST",
        body: invoiceData
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/invoices`] });
      resetForms();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      const transactionData = {
        companyId: currentCompany?.id,
        transactionDate: data.transactionDate,
        description: data.description,
        amount: parseFloat(data.amount),
        transactionType: "TRANSFER",
        notes: data.notes
      };
      return await apiRequest(`/api/companies/${currentCompany?.id}/transactions`, {
        method: "POST",
        body: transactionData
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transfer transaction created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/transactions`] });
      resetForms();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForms = () => {
    setExpenseForm({
      transactionDate: new Date().toISOString().split('T')[0],
      payee: "",
      description: "",
      amountBeforeTax: "",
      salesTax: "0.00",
      expenseCategoryId: 0,
      vendorId: 0,
      transactionType: "EXPENSE",
      notes: ""
    });
    setIncomeForm({
      transactionDate: new Date().toISOString().split('T')[0],
      customerName: "",
      description: "",
      amount: "",
      customerId: 0,
      invoiceNumber: "",
      dueDate: "",
      notes: ""
    });
    setTransferForm({
      transactionDate: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      fromAccount: "",
      toAccount: "",
      notes: ""
    });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    expenseMutation.mutate(expenseForm);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    incomeMutation.mutate(incomeForm);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    transferMutation.mutate(transferForm);
  };

  const categories = categoriesData?.categories || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Transaction
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Expense
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Income
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expense-date">Date *</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={expenseForm.transactionDate}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="payee">Payee *</Label>
                      <Input
                        id="payee"
                        placeholder="Enter payee name"
                        value={expenseForm.payee}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, payee: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expense-category">Category *</Label>
                    <EnhancedCategorySelector
                      selectedCategoryId={expenseForm.expenseCategoryId > 0 ? expenseForm.expenseCategoryId : undefined}
                      onCategorySelect={(category) => setExpenseForm(prev => ({ ...prev, expenseCategoryId: category.id || 0 }))}
                      placeholder="Select or create category..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="vendor">Vendor (Optional)</Label>
                    <Select value={expenseForm.vendorId.toString()} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, vendorId: parseInt(value) }))}>
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

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter description"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount Before Tax *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseForm.amountBeforeTax}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, amountBeforeTax: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax">Sales Tax</Label>
                      <Input
                        id="tax"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseForm.salesTax}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, salesTax: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes..."
                      value={expenseForm.notes}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={expenseMutation.isPending}>
                      {expenseMutation.isPending ? "Creating..." : "Create Expense"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Income</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="income-date">Date *</Label>
                      <Input
                        id="income-date"
                        type="date"
                        value={incomeForm.transactionDate}
                        onChange={(e) => setIncomeForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoice-number">Invoice Number</Label>
                      <Input
                        id="invoice-number"
                        placeholder="INV-001"
                        value={incomeForm.invoiceNumber}
                        onChange={(e) => setIncomeForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={incomeForm.customerId.toString()} onValueChange={(value) => setIncomeForm(prev => ({ ...prev, customerId: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Customer</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="income-description">Description</Label>
                    <Input
                      id="income-description"
                      placeholder="Enter description"
                      value={incomeForm.description}
                      onChange={(e) => setIncomeForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="income-amount">Amount *</Label>
                      <Input
                        id="income-amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={incomeForm.amount}
                        onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={incomeForm.dueDate}
                        onChange={(e) => setIncomeForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="income-notes">Notes</Label>
                    <Textarea
                      id="income-notes"
                      placeholder="Additional notes..."
                      value={incomeForm.notes}
                      onChange={(e) => setIncomeForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={incomeMutation.isPending}>
                      {incomeMutation.isPending ? "Creating..." : "Create Income"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="transfer-date">Date *</Label>
                    <Input
                      id="transfer-date"
                      type="date"
                      value={transferForm.transactionDate}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="transfer-description">Description</Label>
                    <Input
                      id="transfer-description"
                      placeholder="Enter description"
                      value={transferForm.description}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transfer-amount">Amount *</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-account">From Account</Label>
                      <Input
                        id="from-account"
                        placeholder="Source account"
                        value={transferForm.fromAccount}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, fromAccount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="to-account">To Account</Label>
                      <Input
                        id="to-account"
                        placeholder="Destination account"
                        value={transferForm.toAccount}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, toAccount: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="transfer-notes">Notes</Label>
                    <Textarea
                      id="transfer-notes"
                      placeholder="Additional notes..."
                      value={transferForm.notes}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={transferMutation.isPending}>
                      {transferMutation.isPending ? "Creating..." : "Create Transfer"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}