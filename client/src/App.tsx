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
import Analytics from "@/pages/analytics";
import PaymentReminders from "@/pages/payment-reminders";
import MainLayout from "@/components/layout/main-layout";

function AuthWrapper() {
  const { user, setUser, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if user is authenticated on app start
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !user && location !== "/login",
  });

  useEffect(() => {
    if (currentUser && !user) {
      setUser(currentUser);
    }
  }, [currentUser, user, setUser]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      setLocation("/login");
    } else if (isAuthenticated && location === "/login") {
      setLocation("/");
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        {isAuthenticated ? <AuthenticatedRoutes /> : <Login />}
      </Route>
    </Switch>
  );
}

function AuthenticatedRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/customers" component={Customers} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/bank-statements" component={BankStatements} />
        <Route path="/bank-accounts" component={BankAccounts} />
        <Route path="/revenue" component={Revenue} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/customer-statements" component={CustomerStatements} />
        <Route path="/reports/outstanding-balances" component={OutstandingBalances} />
        <Route path="/reports/general-ledger" component={GeneralLedger} />
        <Route path="/reports/trial-balance" component={TrialBalance} />
        <Route path="/reports/expense-categories" component={ExpenseCategories} />
        <Route path="/reports/profit-loss" component={ProfitLoss} />
        <Route path="/reports/balance-sheet" component={BalanceSheet} />
        <Route path="/user-management" component={UserManagement} />
        <Route path="/categories" component={Categories} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/payment-reminders" component={PaymentReminders} />
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
