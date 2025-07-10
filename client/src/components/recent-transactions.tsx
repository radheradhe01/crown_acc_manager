import { useQuery } from "@tanstack/react-query";
import { Clock, TrendingDown, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";

export function RecentTransactions() {
  const { currentCompany } = useCurrentCompany();

  const { data: recentTransactions = [], isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "recent-transactions"],
    enabled: !!currentCompany?.id,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'revenue':
        return <TrendingDown className="h-4 w-4 text-green-500 rotate-180" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVendorIcon = (name: string | null) => {
    if (!name) return <User className="h-4 w-4 text-gray-600" />;
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('inc') || lowerName.includes('corp') || lowerName.includes('llc')) {
      return <Building className="h-4 w-4 text-gray-600" />;
    }
    return <User className="h-4 w-4 text-gray-600" />;
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="w-40 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction: any) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {transaction.description || 'Transaction'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      {transaction.vendorName && (
                        <>
                          {getVendorIcon(transaction.vendorName)}
                          <span className="ml-1 mr-2">{transaction.vendorName}</span>
                        </>
                      )}
                      {transaction.categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {transaction.categoryName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}