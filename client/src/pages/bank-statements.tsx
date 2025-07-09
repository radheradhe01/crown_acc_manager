import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, XCircle, Clock, List, Tag, DollarSign, Calendar } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BankUploadModal } from "@/components/modals/bank-upload-modal";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatDate, formatCurrency } from "@/lib/accounting-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BankStatementUpload, BankStatementTransaction, Customer, Vendor, ExpenseCategory } from "@shared/schema";

export default function BankStatements() {
  const { currentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<BankStatementUpload | null>(null);
  const [categorizationDialog, setCategorizationDialog] = useState<{
    transaction: BankStatementTransaction | null;
    isOpen: boolean;
  }>({ transaction: null, isOpen: false });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: uploads = [], isLoading } = useQuery<BankStatementUpload[]>({
    queryKey: ["/api/companies", currentCompany?.id, "bank-uploads"],
    enabled: !!currentCompany?.id,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<BankStatementTransaction[]>({
    queryKey: ["/api/companies", currentCompany?.id, "bank-statement-transactions"],
    enabled: !!currentCompany?.id,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/companies", currentCompany?.id, "customers"],
    enabled: !!currentCompany?.id,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/companies", currentCompany?.id, "vendors"],
    enabled: !!currentCompany?.id,
  });

  const { data: expenseCategories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/companies", currentCompany?.id, "expense-categories"],
    enabled: !!currentCompany?.id,
  });

  const categorizeMutation = useMutation({
    mutationFn: async ({ id, categorization }: { id: number; categorization: any }) => {
      await apiRequest(`/api/bank-statement-transactions/${id}/categorize`, {
        method: "PUT",
        body: JSON.stringify(categorization),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "bank-statement-transactions"] });
      toast({ title: "Transaction categorized successfully" });
      setCategorizationDialog({ transaction: null, isOpen: false });
    },
    onError: (error) => {
      toast({ title: "Error categorizing transaction", description: error.message, variant: "destructive" });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to manage bank statements.</p>
        </div>
      </div>
    );
  }

  const openCategorizationDialog = (transaction: BankStatementTransaction) => {
    setCategorizationDialog({ transaction, isOpen: true });
  };

  const handleCategorization = (categorization: any) => {
    if (categorizationDialog.transaction) {
      categorizeMutation.mutate({
        id: categorizationDialog.transaction.id,
        categorization,
      });
    }
  };

  return (
    <>
      <Header
        title="Bank Statements"
        description="Upload and process bank statement files for transaction reconciliation"
        showActions={false}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="uploads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uploads">Statement Uploads</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="uploads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Statement Uploads</h2>
                <p className="text-sm text-gray-600">Upload CSV, OFX, or QIF bank statement files</p>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Statement
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {isLoading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading bank statement uploads...</p>
                </div>
              ) : uploads.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No bank statements uploaded yet</p>
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your First Statement
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Total Rows</TableHead>
                      <TableHead>Processed Rows</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="font-medium">{upload.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{upload.fileFormat}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(upload.uploadDate!)}</TableCell>
                        <TableCell>{upload.totalRows || 0}</TableCell>
                        <TableCell>{upload.processedRows || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(upload.status)}
                            <Badge className={getStatusColor(upload.status)}>
                              {upload.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bank Statement Transactions</h2>
                <p className="text-sm text-gray-600">Review and categorize imported bank transactions</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {isLoadingTransactions ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <p className="text-sm text-gray-400">Upload bank statements to see transactions here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell className="text-red-600">
                          {transaction.debitAmount !== "0" && formatCurrency(parseFloat(transaction.debitAmount))}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {transaction.creditAmount !== "0" && formatCurrency(parseFloat(transaction.creditAmount))}
                        </TableCell>
                        <TableCell>{formatCurrency(parseFloat(transaction.runningBalance))}</TableCell>
                        <TableCell>
                          {transaction.customerId ? (
                            <Badge variant="secondary">Customer</Badge>
                          ) : transaction.vendorId ? (
                            <Badge variant="secondary">Vendor</Badge>
                          ) : transaction.categoryId ? (
                            <Badge variant="secondary">Category</Badge>
                          ) : (
                            <Badge variant="outline">Uncategorized</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openCategorizationDialog(transaction)}
                          >
                            <Tag className="mr-2 h-4 w-4" />
                            Categorize
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BankUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CategorizationDialog
        isOpen={categorizationDialog.isOpen}
        transaction={categorizationDialog.transaction}
        customers={customers}
        vendors={vendors}
        expenseCategories={expenseCategories}
        onClose={() => setCategorizationDialog({ transaction: null, isOpen: false })}
        onSave={handleCategorization}
        isLoading={categorizeMutation.isPending}
      />
    </>
  );
}

// Categorization Dialog Component
function CategorizationDialog({
  isOpen,
  transaction,
  customers,
  vendors,
  expenseCategories,
  onClose,
  onSave,
  isLoading,
}: {
  isOpen: boolean;
  transaction: BankStatementTransaction | null;
  customers: Customer[];
  vendors: Vendor[];
  expenseCategories: ExpenseCategory[];
  onClose: () => void;
  onSave: (categorization: any) => void;
  isLoading: boolean;
}) {
  const [categorization, setCategorization] = useState({
    customerId: "",
    vendorId: "",
    categoryId: "",
    notes: "",
  });

  const handleSave = () => {
    const payload: any = {
      notes: categorization.notes,
    };

    if (categorization.customerId) {
      payload.customerId = parseInt(categorization.customerId);
    }
    if (categorization.vendorId) {
      payload.vendorId = parseInt(categorization.vendorId);
    }
    if (categorization.categoryId) {
      payload.categoryId = parseInt(categorization.categoryId);
    }

    onSave(payload);
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Transaction Details</span>
              <span className="text-sm text-gray-500">{formatDate(transaction.transactionDate)}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{transaction.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Amount: {transaction.debitAmount !== "0" 
                  ? `-${formatCurrency(parseFloat(transaction.debitAmount))}` 
                  : `+${formatCurrency(parseFloat(transaction.creditAmount))}`}
              </span>
              <span className="text-sm text-gray-500">
                Balance: {formatCurrency(parseFloat(transaction.runningBalance))}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer</label>
              <Select value={categorization.customerId} onValueChange={(value) => 
                setCategorization({ ...categorization, customerId: value, vendorId: "", categoryId: "" })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vendor</label>
              <Select value={categorization.vendorId} onValueChange={(value) => 
                setCategorization({ ...categorization, vendorId: value, customerId: "", categoryId: "" })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expense Category</label>
              <Select value={categorization.categoryId} onValueChange={(value) => 
                setCategorization({ ...categorization, categoryId: value, customerId: "", vendorId: "" })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={categorization.notes}
                onChange={(e) => setCategorization({ ...categorization, notes: e.target.value })}
                placeholder="Add any notes about this transaction..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Categorization"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
