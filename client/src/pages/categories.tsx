import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
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

interface CategoriesResponse {
  categories: ExpenseCategory[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mainAccountType: "",
    detailType: "",
  });

  const { data: categoriesData, isLoading } = useQuery<CategoriesResponse>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`, currentPage, pageSize],
    enabled: !!currentCompany,
  });

  const categories = categoriesData?.categories || [];

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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-2">Manage your chart of accounts and expense categories</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{categoriesData?.totalCount || 0}</span> total categories
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{filteredCategories.length}</span> filtered
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-900">{MAIN_ACCOUNT_TYPES.length}</span> account types
              </div>
            </div>
          </div>
        <Dialog open={isCreateDialogOpen || !!editingCategory} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-3 h-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <p className="text-gray-600">
                {editingCategory ? "Update category information" : "Add a new category to your chart of accounts"}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name and Account Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mainAccountType" className="text-sm font-medium">Main Account Type *</Label>
                  <Select
                    value={formData.mainAccountType}
                    onValueChange={(value) => setFormData({ ...formData, mainAccountType: value, detailType: "" })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${type.color.split(' ')[0]}`}></div>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Detail Type */}
              {selectedDetailTypes.length > 0 && (
                <div>
                  <Label htmlFor="detailType" className="text-sm font-medium">Detail Type</Label>
                  <Select
                    value={formData.detailType}
                    onValueChange={(value) => setFormData({ ...formData, detailType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select detail type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDetailTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a specific detail type for better categorization
                  </p>
                </div>
              )}
              
              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description for this category..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add details about when to use this category
                </p>
              </div>
              
              {/* Preview Section */}
              {(formData.name || formData.mainAccountType) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{formData.name || "Category Name"}</span>
                    {formData.mainAccountType && (
                      <Badge className={getAccountTypeColor(formData.mainAccountType)}>
                        {getAccountTypeLabel(formData.mainAccountType)}
                      </Badge>
                    )}
                    {formData.detailType && (
                      <Badge variant="outline">{formData.detailType}</Badge>
                    )}
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingCategory ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingCategory ? "Update Category" : "Create Category"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-64 h-11">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Account Types</SelectItem>
              {MAIN_ACCOUNT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${type.color.split(' ')[0]}`}></div>
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg">Loading categories...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Categories Header */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Categories List</h2>
                <div className="text-sm text-gray-500">
                  Showing {filteredCategories.length} of {categories.length} categories
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            {category.mainAccountType && (
                              <Badge className={`${getAccountTypeColor(category.mainAccountType)} px-3 py-1 text-xs font-medium`}>
                                {getAccountTypeLabel(category.mainAccountType)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            {category.detailType && (
                              <Badge variant="outline" className="text-xs">
                                {category.detailType}
                              </Badge>
                            )}
                            {category.description && (
                              <p className="text-sm text-gray-600">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="px-3 py-2 h-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 h-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCategories.length === 0 && (
                <div className="p-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || filterType !== "all" 
                      ? "Try adjusting your search or filter criteria." 
                      : "Create your first category to get started."}
                  </p>
                  {(!searchTerm && filterType === "all") && (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Category
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {categoriesData && categoriesData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {((categoriesData.currentPage - 1) * pageSize) + 1} to {Math.min(categoriesData.currentPage * pageSize, categoriesData.totalCount)} of {categoriesData.totalCount} categories
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(categoriesData.currentPage - 1)}
                    disabled={categoriesData.currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, categoriesData.totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(categoriesData.currentPage - 2, categoriesData.totalPages - 4)) + i;
                      if (page > categoriesData.totalPages) return null;
                      return (
                        <Button
                          key={page}
                          variant={page === categoriesData.currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(categoriesData.currentPage + 1)}
                    disabled={categoriesData.currentPage >= categoriesData.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}