import { useState } from "react";
import { Calendar } from "lucide-react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { MetricsCards } from "@/components/metrics-cards";
import { RecentTransactions } from "@/components/recent-transactions";
import { OutstandingCustomers } from "@/components/outstanding-customers";
import { QuickActions } from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { currentCompany } = useCurrentCompany();
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

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

  // Calculate date range based on selected period
  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case "current-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last-3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "last-6-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "current-year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "last-year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const dateRange = getDateRange(selectedPeriod);

  const periodOptions = [
    { value: "current-month", label: "Current Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "current-year", label: "Current Year" },
    { value: "last-year", label: "Last Year" },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Financial overview for {currentCompany.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MetricsCards dateRange={dateRange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <OutstandingCustomers />
      </div>

      <QuickActions />
    </div>
  );
}
