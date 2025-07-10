import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, XCircle, Clock, List, Tag, DollarSign, Calendar, Lightbulb, Zap, Users, Truck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BankUploadModal } from "@/components/modals/bank-upload-modal";
import { EnhancedCategorySelector } from "@/components/enhanced-category-selector";
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
    queryKey: [`/api/companies/${currentCompany?.id}/bank-uploads`],
    enabled: !!currentCompany?.id,
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<BankStatementTransaction[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/bank-statement-transactions`],
    enabled: !!currentCompany?.id,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers`],
    enabled: !!currentCompany?.id,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/vendors`],
    enabled: !!currentCompany?.id,
  });

  const { data: expenseCategories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`],
    enabled: !!currentCompany?.id,
  });

  const categorizeMutation = useMutation({
    mutationFn: async ({ id, categorization }: { id: number; categorization: any }) => {
      await apiRequest("PUT", `/api/bank-statement-transactions/${id}/categorize`, categorization);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/bank-statement-transactions`] });
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
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              {transaction.customerId ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {customers.find(c => c.id === transaction.customerId)?.name || 'Customer'}
                                </Badge>
                              ) : transaction.vendorId ? (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  {vendors.find(v => v.id === transaction.vendorId)?.name || 'Vendor'}
                                </Badge>
                              ) : transaction.categoryId ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  {expenseCategories.find(c => c.id === transaction.categoryId)?.name || 'Category'}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Uncategorized</Badge>
                              )}
                            </div>
                            {(transaction.suggestedCustomerId || transaction.suggestedVendorId || transaction.suggestedCategoryId) && (
                              <Badge variant="outline" className="text-blue-600 bg-blue-50 text-xs">
                                <Lightbulb className="h-3 w-3 mr-1" />
                                {transaction.suggestedCustomerId && customers.find(c => c.id === transaction.suggestedCustomerId)?.name}
                                {transaction.suggestedVendorId && vendors.find(v => v.id === transaction.suggestedVendorId)?.name}
                                {transaction.suggestedCategoryId && expenseCategories.find(c => c.id === transaction.suggestedCategoryId)?.name}
                              </Badge>
                            )}
                          </div>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Categorize Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Transaction Summary Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(transaction.transactionDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold">
                      {transaction.debitAmount !== "0" && (
                        <span className="text-red-600">
                          -{formatCurrency(parseFloat(transaction.debitAmount))}
                        </span>
                      )}
                      {transaction.creditAmount !== "0" && (
                        <span className="text-green-600">
                          +{formatCurrency(parseFloat(transaction.creditAmount))}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-semibold text-sm truncate" title={transaction.description}>
                      {transaction.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Suggestions */}
          {(transaction.suggestedCustomerId || transaction.suggestedVendorId || transaction.suggestedCategoryId) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Smart Suggestions</h3>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {transaction.suggestedCustomerId && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Suggested Customer</p>
                        <p className="font-medium">
                          {customers.find(c => c.id === transaction.suggestedCustomerId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCategorization({...categorization, customerId: transaction.suggestedCustomerId!.toString(), vendorId: ""})}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  )}
                  
                  {transaction.suggestedVendorId && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Suggested Vendor</p>
                        <p className="font-medium">
                          {vendors.find(v => v.id === transaction.suggestedVendorId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCategorization({...categorization, vendorId: transaction.suggestedVendorId!.toString(), customerId: ""})}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  )}
                  
                  {transaction.suggestedCategoryId && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="text-sm text-gray-600">Suggested Category</p>
                        <p className="font-medium">
                          {expenseCategories.find(c => c.id === transaction.suggestedCategoryId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCategorization({...categorization, categoryId: transaction.suggestedCategoryId!.toString()})}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categorization Form */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Categorization Details</h3>
              <p className="text-sm text-gray-600">Choose how to categorize this transaction</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <Label htmlFor="customer" className="font-medium">Customer</Label>
                  </div>
                  <Select 
                    value={categorization.customerId} 
                    onValueChange={(value) => setCategorization({...categorization, customerId: value, vendorId: ""})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span>{customer.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">For income transactions</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-orange-600" />
                    <Label htmlFor="vendor" className="font-medium">Vendor</Label>
                  </div>
                  <Select 
                    value={categorization.vendorId} 
                    onValueChange={(value) => setCategorization({...categorization, vendorId: value, customerId: ""})}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Truck className="h-4 w-4 text-orange-600" />
                            <span>{vendor.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">For expense transactions</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="category" className="font-medium">Category</Label>
                  </div>
                  <EnhancedCategorySelector
                    selectedCategoryId={categorization.categoryId ? parseInt(categorization.categoryId) : undefined}
                    onCategorySelect={(category) => setCategorization({...categorization, categoryId: category.id.toString()})}
                    placeholder="Select or create category..."
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Create new or select existing</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="notes" className="font-medium">Additional Notes</Label>
                </div>
                <Textarea 
                  id="notes"
                  placeholder="Add any additional notes or details about this transaction..."
                  value={categorization.notes}
                  onChange={(e) => setCategorization({...categorization, notes: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Categorization
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
