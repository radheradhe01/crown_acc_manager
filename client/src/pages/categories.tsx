import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest } from "@/lib/queryClient";
import type { ExpenseCategory, InsertExpenseCategory } from "@shared/schema";

const MAIN_ACCOUNT_TYPES = [
  { value: "cash_and_cash_equivalents", label: "Cash and Cash Equivalents", color: "bg-blue-100 text-blue-800" },
  { value: "credit_card", label: "Credit Card", color: "bg-red-100 text-red-800" },
  { value: "current_assets", label: "Current Assets", color: "bg-green-100 text-green-800" },
  { value: "fixed_assets", label: "Fixed Assets", color: "bg-purple-100 text-purple-800" },
  { value: "non_current_assets", label: "Non-Current Assets", color: "bg-indigo-100 text-indigo-800" },
  { value: "current_liabilities", label: "Current Liabilities", color: "bg-orange-100 text-orange-800" },
  { value: "non_current_liabilities", label: "Non-Current Liabilities", color: "bg-pink-100 text-pink-800" },
  { value: "owners_equity", label: "Owner's Equity", color: "bg-cyan-100 text-cyan-800" },
  { value: "income", label: "Income", color: "bg-emerald-100 text-emerald-800" },
  { value: "cogs", label: "COGS (Cost of Goods Sold)", color: "bg-yellow-100 text-yellow-800" },
  { value: "expenses", label: "Expenses", color: "bg-gray-100 text-gray-800" },
  { value: "other_income", label: "Other Income", color: "bg-teal-100 text-teal-800" },
  { value: "other_expense", label: "Other Expense", color: "bg-slate-100 text-slate-800" },
];

const ACCOUNT_DETAIL_TYPES = {
  cash_and_cash_equivalents: ["Bank", "Cash on hand", "Trust accounts", "Undeposited Funds"],
  credit_card: ["Credit Card"],
  current_assets: ["Accounts Receivable", "Inventory Asset", "Prepaid Expenses", "Employee Cash Advances", "Investments", "Allowance for Bad Debts"],
  fixed_assets: ["Buildings", "Furniture & Fixtures", "Machinery & Equipment", "Vehicles", "Land", "Accumulated Depreciation", "Intangible Assets"],
  non_current_assets: ["Goodwill", "Lease Buyout", "Licenses", "Organizational Costs", "Security Deposits", "Accumulated Amortization"],
  current_liabilities: ["Accounts Payable", "Credit Card", "Loan Payable", "Sales Tax Payable", "Payroll Liabilities", "Deferred Revenue", "Insurance Payable", "Line of Credit"],
  non_current_liabilities: ["Notes Payable", "Shareholder Notes Payable", "Other Long Term Liabilities"],
  owners_equity: ["Owner's Equity", "Retained Earnings", "Opening Balance Equity", "Partner Contributions", "Partner Distributions", "Draws"],
  income: ["Service/Fee Income", "Sales of Product Income", "Non-Profit Income", "Discounts/Refunds Given", "Unapplied Cash Payment Income"],
  cogs: ["Cost of Labor", "Supplies & Materials", "Shipping", "Freight & Delivery", "Equipment Rental"],
  expenses: ["Advertising/Promotional", "Auto", "Bank Charges", "Insurance", "Legal & Professional Fees", "Office/General Administrative Expenses", "Rent and Lease", "Salaries & Wages", "Utilities", "Travel", "Dues & Subscriptions", "Meals & Entertainment"],
  other_income: ["Interest Earned", "Dividend Income", "Other Investment Income", "Tax-Exempt Interest"],
  other_expense: ["Amortization", "Depreciation", "Exchange Gain or Loss", "Penalties & Settlements"],
};

export default function Categories() {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mainAccountType: "",
    detailType: "",
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`],
    enabled: !!currentCompany,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertExpenseCategory) => {
      return await apiRequest(`/api/companies/${currentCompany?.id}/expense-categories`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<ExpenseCategory> }) => {
      return await apiRequest(`/api/companies/${currentCompany?.id}/expense-categories/${data.id}`, "PATCH", data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`] });
      setEditingCategory(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/companies/${currentCompany?.id}/expense-categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      mainAccountType: "",
      detailType: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;

    const categoryData = {
      name: formData.name,
      description: formData.description,
      mainAccountType: formData.mainAccountType,
      detailType: formData.detailType,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        updates: categoryData,
      });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      mainAccountType: category.mainAccountType || "",
      detailType: category.detailType || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || category.mainAccountType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getAccountTypeColor = (accountType: string) => {
    const type = MAIN_ACCOUNT_TYPES.find(t => t.value === accountType);
    return type?.color || "bg-gray-100 text-gray-800";
  };

  const getAccountTypeLabel = (accountType: string) => {
    const type = MAIN_ACCOUNT_TYPES.find(t => t.value === accountType);
    return type?.label || accountType;
  };

  const selectedDetailTypes = formData.mainAccountType ? ACCOUNT_DETAIL_TYPES[formData.mainAccountType as keyof typeof ACCOUNT_DETAIL_TYPES] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Manage your chart of accounts and expense categories</p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingCategory} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mainAccountType">Main Account Type</Label>
                  <Select
                    value={formData.mainAccountType}
                    onValueChange={(value) => setFormData({ ...formData, mainAccountType: value, detailType: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedDetailTypes.length > 0 && (
                <div>
                  <Label htmlFor="detailType">Detail Type</Label>
                  <Select
                    value={formData.detailType}
                    onValueChange={(value) => setFormData({ ...formData, detailType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select detail type" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDetailTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MAIN_ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading categories...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {category.mainAccountType && (
                        <Badge className={getAccountTypeColor(category.mainAccountType)}>
                          {getAccountTypeLabel(category.mainAccountType)}
                        </Badge>
                      )}
                      {category.detailType && (
                        <Badge variant="outline">{category.detailType}</Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredCategories.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No categories found. Create your first category to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}