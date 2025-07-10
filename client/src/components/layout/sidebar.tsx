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
  Shield
} from "lucide-react";
import { CompanySelector } from "../company-selector";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: ChartLine },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/vendors", label: "Vendors", icon: Truck },
  { path: "/bank-accounts", label: "Bank Accounts", icon: CreditCard },
  { path: "/bank-statements", label: "Bank Statements", icon: Upload },
  { path: "/revenue", label: "Revenue", icon: DollarSign },
  { path: "/expenses", label: "Expenses", icon: Receipt },
  { path: "/customer-statement", label: "Customer Statement", icon: User },
  { path: "/user-management", label: "User Management", icon: Shield },
];

const reportItems = [
  { path: "/reports/outstanding-balances", label: "Outstanding Balances", icon: FileText },
  { path: "/reports/general-ledger", label: "General Ledger", icon: Book },
  { path: "/reports/trial-balance", label: "Trial Balance", icon: Calculator },
  { path: "/reports/expense-categories", label: "Expense Categories", icon: PieChart },
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">John Smith</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
