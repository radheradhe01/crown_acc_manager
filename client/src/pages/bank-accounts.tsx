import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBankAccountSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Trash2, Building, CreditCard } from "lucide-react";
import type { BankAccount, InsertBankAccount } from "@shared/schema";
import { z } from "zod";
import Header from "@/components/layout/header";

const formSchema = insertBankAccountSchema.extend({
  openingBalance: z.coerce.number().default(0),
  currentBalance: z.coerce.number().default(0),
});

type FormData = z.infer<typeof formSchema>;

export default function BankAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const { data: bankAccounts = [], isLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/companies", currentCompany?.id, "bank-accounts"],
    enabled: !!currentCompany?.id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      accountName: "",
      accountNumber: "",
      bankName: "",
      accountType: "CHECKING",
      openingBalance: 0,
      currentBalance: 0,
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const accountData = {
        ...data,
        companyId: currentCompany?.id || 0,
        openingBalance: data.openingBalance.toString(),
        currentBalance: data.openingBalance.toString(), // Set current balance to opening balance for new accounts
      };

      console.log("Sending account data:", accountData);

      if (editingAccount) {
        const response = await apiRequest("PUT", `/api/bank-accounts/${editingAccount.id}`, accountData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/bank-accounts", accountData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "bank-accounts"] });
      toast({
        title: "Success",
        description: editingAccount ? "Bank account updated successfully" : "Bank account created successfully",
      });
      handleCloseModal();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save bank account",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bank-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "bank-accounts"] });
      toast({
        title: "Success",
        description: "Bank account deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete bank account",
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
      form.reset({
        ...account,
        openingBalance: account.openingBalance || 0,
      });
    } else {
      setEditingAccount(null);
      form.reset({
        companyId: currentCompany?.id || 0,
        accountName: "",
        accountNumber: "",
        bankName: "",
        accountType: "CHECKING",
        openingBalance: 0,
        currentBalance: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    mutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      deleteMutation.mutate(id);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return <Building className="h-4 w-4 text-green-600" />;
      case "CREDIT":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <Building className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "SAVINGS":
        return "bg-green-100 text-green-800";
      case "CREDIT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to manage bank accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Bank Accounts"
        description="Manage your company's bank accounts and financial connections"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Button>
        }
      />

      <div className="space-y-6">
        {/* QuickBooks-style action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Connect Bank Account</h3>
                  <p className="text-sm text-gray-600">Add your bank accounts for automatic transaction import</p>
                </div>
              </div>
            </div>
            <Button onClick={() => handleOpenModal()} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Total Accounts</h3>
                  <p className="text-2xl font-bold text-gray-900">{bankAccounts.length}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Active bank accounts connected</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Total Balance</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0))}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Combined account balances</p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Bank Accounts</h3>
            <p className="text-sm text-gray-600">Manage and connect your financial accounts</p>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading bank accounts...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No bank accounts found</p>
              <p className="text-sm text-gray-400 mb-6">Connect your first bank account to get started with transaction management</p>
              <Button onClick={() => handleOpenModal()} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Bank Account
              </Button>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Name</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Opening Balance</TableHead>
                <TableHead>Current Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell className="font-mono">
                    {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getAccountTypeIcon(account.accountType)}
                      <Badge className={getAccountTypeColor(account.accountType)}>
                        {account.accountType}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(account.openingBalance || 0)}</TableCell>
                  <TableCell>{formatCurrency(account.currentBalance || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  {...form.register("accountName")}
                  placeholder="Primary Checking"
                />
                {form.formState.errors.accountName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.accountName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...form.register("bankName")}
                  placeholder="Chase Bank"
                />
                {form.formState.errors.bankName && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.bankName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  {...form.register("accountNumber")}
                  placeholder="1234567890"
                />
                {form.formState.errors.accountNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select 
                  value={form.watch("accountType")} 
                  onValueChange={(value) => form.setValue("accountType", value as "CHECKING" | "SAVINGS" | "CREDIT")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.accountType && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.accountType.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                {...form.register("openingBalance")}
                placeholder="0.00"
              />
              {form.formState.errors.openingBalance && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.openingBalance.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                {...form.register("isActive")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : editingAccount ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}