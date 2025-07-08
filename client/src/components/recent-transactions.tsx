import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";
import type { Transaction } from "@shared/schema";

export function RecentTransactions() {
  const { currentCompany } = useCurrentCompany();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "recent-transactions"],
    enabled: !!currentCompany?.id,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return <ArrowDown className="h-5 w-5 text-green-600" />;
      case "EXPENSE":
        return <ArrowUp className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return "text-green-600";
      case "EXPENSE":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "PAYMENT":
      case "REVENUE":
        return "+";
      case "EXPENSE":
        return "-";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0">
            View All
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    {getTransactionIcon(transaction.transactionType)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.transactionDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getTransactionColor(transaction.transactionType)}`}>
                    {getAmountPrefix(transaction.transactionType)}{formatCurrency(Number(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.transactionType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
