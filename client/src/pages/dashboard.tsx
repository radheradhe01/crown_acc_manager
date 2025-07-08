import { useQuery } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { Header } from "@/components/layout/header";
import { MetricsCards } from "@/components/metrics-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { OutstandingCustomers } from "@/components/outstanding-customers";
import { QuickActions } from "@/components/quick-actions";

export default function Dashboard() {
  const { currentCompany } = useCurrentCompany();

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="space-y-8">
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions />
          <OutstandingCustomers />
        </div>

        <QuickActions />
      </div>
    </>
  );
}
