import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "./hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Vendors from "@/pages/vendors";
import BankStatements from "@/pages/bank-statements";
import BankAccounts from "@/pages/bank-accounts";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import CustomerStatements from "@/pages/customer-statements";
import OutstandingBalances from "@/pages/reports/outstanding-balances";
import GeneralLedger from "@/pages/reports/general-ledger";
import TrialBalance from "@/pages/reports/trial-balance";
import ExpenseCategories from "@/pages/reports/expense-categories";
import ProfitLoss from "@/pages/reports/profit-loss";
import BalanceSheet from "@/pages/reports/balance-sheet";
import UserManagement from "@/pages/user-management";
import Categories from "@/pages/categories";

import PaymentReminders from "@/pages/payment-reminders";
import AutomatedInvoices from "@/pages/automated-invoices";
import CompanySettings from "@/pages/company-settings";
import MainLayout from "@/components/layout/main-layout";

function AuthWrapper() {
  const { user, setUser, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if user is authenticated on app start - always verify with server
  const {
    data: currentUser,
    error: authError,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: location !== "/login",
    refetchOnMount: "always", // Always re-check auth on mount
    refetchOnWindowFocus: true, // Re-check when window regains focus
    staleTime: 0, // Always consider data stale to force fresh check
  });

  // Sync server auth state with client state
  useEffect(() => {
    if (isFetched && location !== "/login") {
      if (currentUser) {
        // Valid session - update user if needed
        if (!user || user.id !== (currentUser as any).id) {
          setUser(currentUser as any);
        }
      } else if (authError || !currentUser) {
        // Invalid/expired session - clear local auth state
        logout();
      }
    }
  }, [currentUser, authError, isFetched, user, setUser, logout, location]);

  // Redirect to login if session is invalid
  useEffect(() => {
    if (location !== "/login" && isFetched && !isLoading) {
      if (authError || !currentUser) {
        setLocation("/login");
      }
    }
  }, [authError, currentUser, isFetched, isLoading, location, setLocation]);

  // Redirect authenticated users away from login page (only after server verification)
  useEffect(() => {
    if (location === "/login" && isFetched && currentUser) {
      setLocation("/dashboard");
    }
  }, [currentUser, isFetched, location, setLocation]);

  // Redirect root path to dashboard for authenticated users
  useEffect(() => {
    if (location === "/" && isFetched && currentUser) {
      setLocation("/dashboard");
    }
  }, [currentUser, isFetched, location, setLocation]);

  // Show loading state while checking authentication
  if (location !== "/login" && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthenticatedRoutes />
      </Route>
    </Switch>
  );
}

function AuthenticatedRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/customers" component={Customers} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/bank-statements" component={BankStatements} />
        <Route path="/bank-accounts" component={BankAccounts} />
        <Route path="/revenue" component={Revenue} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/customer-statements" component={CustomerStatements} />
        <Route
          path="/reports/outstanding-balances"
          component={OutstandingBalances}
        />
        <Route path="/reports/general-ledger" component={GeneralLedger} />
        <Route path="/reports/trial-balance" component={TrialBalance} />
        <Route
          path="/reports/expense-categories"
          component={ExpenseCategories}
        />
        <Route path="/reports/profit-loss" component={ProfitLoss} />
        <Route path="/reports/balance-sheet" component={BalanceSheet} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/categories" component={Categories} />

        <Route path="/payment-reminders" component={PaymentReminders} />
        <Route path="/automated-invoices" component={AutomatedInvoices} />
        <Route path="/company-settings" component={CompanySettings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthWrapper />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
