import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, ChevronDown, Tag, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { ExpenseCategory, InsertExpenseCategory } from "@shared/schema";

const MAIN_ACCOUNT_TYPES = [
  { value: "cash_and_cash_equivalents", label: "Cash and Cash Equivalents", color: "bg-blue-100 text-blue-800", icon: Building2 },
  { value: "credit_card", label: "Credit Card", color: "bg-red-100 text-red-800", icon: DollarSign },
  { value: "current_assets", label: "Current Assets", color: "bg-green-100 text-green-800", icon: Building2 },
  { value: "fixed_assets", label: "Fixed Assets", color: "bg-purple-100 text-purple-800", icon: Building2 },
  { value: "non_current_assets", label: "Non-Current Assets", color: "bg-indigo-100 text-indigo-800", icon: Building2 },
  { value: "current_liabilities", label: "Current Liabilities", color: "bg-orange-100 text-orange-800", icon: DollarSign },
  { value: "non_current_liabilities", label: "Non-Current Liabilities", color: "bg-pink-100 text-pink-800", icon: DollarSign },
  { value: "owners_equity", label: "Owner's Equity", color: "bg-cyan-100 text-cyan-800", icon: Building2 },
  { value: "income", label: "Income", color: "bg-emerald-100 text-emerald-800", icon: DollarSign },
  { value: "cogs", label: "COGS (Cost of Goods Sold)", color: "bg-yellow-100 text-yellow-800", icon: DollarSign },
  { value: "expenses", label: "Expenses", color: "bg-gray-100 text-gray-800", icon: DollarSign },
  { value: "other_income", label: "Other Income", color: "bg-teal-100 text-teal-800", icon: DollarSign },
  { value: "other_expense", label: "Other Expense", color: "bg-slate-100 text-slate-800", icon: DollarSign },
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

interface EnhancedCategorySelectorProps {
  selectedCategoryId?: number;
  onCategorySelect: (category: ExpenseCategory) => void;
  placeholder?: string;
  className?: string;
}

interface CreateCategoryFormData {
  name: string;
  description: string;
  mainAccountType: string;
  detailType: string;
}

export function EnhancedCategorySelector({ 
  selectedCategoryId, 
  onCategorySelect, 
  placeholder = "Select or create category...",
  className 
}: EnhancedCategorySelectorProps) {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryFormData>({
    name: "",
    description: "",
    mainAccountType: "",
    detailType: "",
  });

  // Listen for custom event to open create dialog
  useEffect(() => {
    const handleOpenCreateDialog = () => {
      setCreateDialogOpen(true);
    };
    
    document.addEventListener('openCreateDialog', handleOpenCreateDialog);
    return () => document.removeEventListener('openCreateDialog', handleOpenCreateDialog);
  }, []);

  const { data: categoriesData, isLoading } = useQuery<{categories: ExpenseCategory[], totalCount: number}>({
    queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`, 1, 100], // Get first 100 categories
    enabled: !!currentCompany,
  });

  const categories = categoriesData?.categories || [];
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  
  // Debug log to see what categories are loaded
  console.log('Enhanced Category Selector - Categories loaded:', categories.length);

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertExpenseCategory) => {
      const categoryData = {
        ...data,
        companyId: currentCompany?.id
      };
      return await apiRequest(`/api/companies/${currentCompany?.id}/expense-categories`, {
        method: "POST",
        body: categoryData
      });
    },
    onSuccess: (newCategory) => {
      toast({
        title: "Category Created",
        description: `Category "${newCategory.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/expense-categories`] });
      onCategorySelect(newCategory);
      setCreateDialogOpen(false);
      setOpen(false);
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

    createCategoryMutation.mutate(formData);
  };

  const getAccountTypeColor = (accountType: string) => {
    const type = MAIN_ACCOUNT_TYPES.find(t => t.value === accountType);
    return type?.color || "bg-gray-100 text-gray-800";
  };

  const getAccountTypeLabel = (accountType: string) => {
    const type = MAIN_ACCOUNT_TYPES.find(t => t.value === accountType);
    return type?.label || accountType;
  };

  const selectedDetailTypes = formData.mainAccountType ? 
    ACCOUNT_DETAIL_TYPES[formData.mainAccountType as keyof typeof ACCOUNT_DETAIL_TYPES] || [] : [];

  // Group categories by main account type - normalize the types
  const groupedCategories = categories.reduce((acc, category) => {
    let type = category.mainAccountType || 'uncategorized';
    // Normalize case variations
    if (type.toLowerCase() === 'expense' || type.toLowerCase() === 'expenses') {
      type = 'expenses';
    }
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(category);
    return acc;
  }, {} as Record<string, ExpenseCategory[]>);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategory ? (
              <span>{selectedCategory.name}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>No categories found.</CommandEmpty>
              
              {Object.entries(groupedCategories).map(([type, typeCategories]) => (
                <CommandGroup key={type} heading={getAccountTypeLabel(type)}>
                  {typeCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        onCategorySelect(category);
                        setOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedCategoryId === category.id ? "opacity-100" : "opacity-0")} />
                      <Tag className="h-4 w-4 mr-2" />
                      {category.name}
                      {category.detailType && (
                        <span className="ml-2 text-xs text-gray-500">({category.detailType})</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              
              <CommandGroup>
                <CommandItem onSelect={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Category
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
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
                  <SelectValue placeholder="Select main account type" />
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
                placeholder="Enter category description (optional)"
                rows={3}
              />
            </div>
            
            {formData.mainAccountType && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Category Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{formData.name || "New Category"}</span>
                    <Badge className={getAccountTypeColor(formData.mainAccountType)}>
                      {getAccountTypeLabel(formData.mainAccountType)}
                    </Badge>
                    {formData.detailType && (
                      <Badge variant="outline">{formData.detailType}</Badge>
                    )}
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending}
              >
                Create Category
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}