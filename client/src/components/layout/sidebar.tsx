import { Link, useLocation } from "wouter";
import { 
  ChartLine, 
  Users, 
  Truck, 
  Upload, 
  DollarSign, 
  Receipt, 
  FileText, 
  Book, 
  Calculator, 
  PieChart,
  User,
  TrendingUp,
  Building,
  CreditCard,
  Shield,
  Tags,
  LogOut,
  ChevronUp
} from "lucide-react";
import { CompanySelector } from "../company-selector";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: ChartLine },
  { path: "/analytics", label: "Analytics", icon: TrendingUp },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/vendors", label: "Vendors", icon: Truck },
  { path: "/bank-accounts", label: "Bank Accounts", icon: CreditCard },
  { path: "/bank-statements", label: "Bank Statements", icon: Upload },
  { path: "/revenue", label: "Revenue", icon: DollarSign },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/customer-statements", label: "Customer Statements", icon: Users },
  { path: "/payment-reminders", label: "Payment Reminders", icon: Receipt },
  { path: "/categories", label: "Categories", icon: Tags },
  { path: "/user-management", label: "User Management", icon: Shield },
];

const reportItems = [
  { path: "/reports/outstanding-balances", label: "Outstanding Balances", icon: FileText },
  { path: "/reports/general-ledger", label: "General Ledger", icon: Book },
  { path: "/reports/trial-balance", label: "Trial Balance", icon: Calculator },
  { path: "/reports/profit-loss", label: "Profit & Loss", icon: TrendingUp },
  { path: "/reports/balance-sheet", label: "Balance Sheet", icon: Building },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Company Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-blue-600">AccountingPro</h1>
        </div>
        <CompanySelector />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          
          <div className="border-t border-gray-200 my-3"></div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Reports
          </div>
          
          {reportItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <UserProfile />
    </aside>
  );
}

function UserProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email;

  return (
    <div className="p-4 border-t border-gray-200">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="ml-3 text-left">
                <div className="text-sm font-medium truncate max-w-[120px]">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
