import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Vendors from "@/pages/vendors";
import BankStatements from "@/pages/bank-statements";
import BankAccounts from "@/pages/bank-accounts";
import Revenue from "@/pages/revenue";
import Expenses from "@/pages/expenses";
import CustomerStatement from "@/pages/customer-statement";
import OutstandingBalances from "@/pages/reports/outstanding-balances";
import GeneralLedger from "@/pages/reports/general-ledger";
import TrialBalance from "@/pages/reports/trial-balance";
import ExpenseCategories from "@/pages/reports/expense-categories";
import ProfitLoss from "@/pages/reports/profit-loss";
import BalanceSheet from "@/pages/reports/balance-sheet";
import UserManagement from "@/pages/user-management";
import MainLayout from "@/components/layout/main-layout";

function Router() {
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
        <Route path="/customer-statement" component={CustomerStatement} />
        <Route path="/reports/outstanding-balances" component={OutstandingBalances} />
        <Route path="/reports/general-ledger" component={GeneralLedger} />
        <Route path="/reports/trial-balance" component={TrialBalance} />
        <Route path="/reports/expense-categories" component={ExpenseCategories} />
        <Route path="/reports/profit-loss" component={ProfitLoss} />
        <Route path="/reports/balance-sheet" component={BalanceSheet} />
        <Route path="/user-management" component={UserManagement} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
