import { useQuery } from "@tanstack/react-query";
import { Building, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, calculateDaysOverdue } from "@/lib/accounting-utils";

export function OutstandingCustomers() {
  const { currentCompany } = useCurrentCompany();

  const { data: outstandingBalances, isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "customer-statements"],
    enabled: !!currentCompany?.id,
  });

  // Extract customers with outstanding balances for payment reminders
  const outstandingCustomers = outstandingBalances?.customers?.filter((customer: any) => 
    customer.summary.closingBalance > 0
  ) || [];

  const getCustomerIcon = (name: string | undefined | null) => {
    if (!name) return <User className="h-5 w-5 text-gray-600" />;
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('inc') || lowerName.includes('corp') || lowerName.includes('llc')) {
      return <Building className="h-5 w-5 text-gray-600" />;
    }
    if (lowerName.includes('store') || lowerName.includes('shop')) {
      return <Store className="h-5 w-5 text-gray-600" />;
    }
    return <User className="h-5 w-5 text-gray-600" />;
  };

  const getOverdueStatus = (oldestInvoiceDate: string) => {
    const daysOverdue = calculateDaysOverdue(oldestInvoiceDate);
    if (daysOverdue === 0) {
      return { text: "Current", variant: "outline" as const };
    }
    return { text: `${daysOverdue} days overdue`, variant: "destructive" as const };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Payment Reminders</h3>
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0">
            View All Receivables
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Customers with outstanding balances requiring payment follow-up</p>
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
        ) : outstandingCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No customers with outstanding balances</p>
            <p className="text-xs text-gray-400 mt-1">All receivables are current</p>
          </div>
        ) : (
          <div className="space-y-4">
            {outstandingCustomers.slice(0, 5).map((customer: any, index: number) => {
              const closingBalance = customer.summary.closingBalance;
              const oldestInvoiceDate = customer.lines?.find((line: any) => line.lineType === 'REVENUE')?.lineDate;
              const overdueStatus = oldestInvoiceDate ? getOverdueStatus(oldestInvoiceDate) : { text: "Current", variant: "outline" as const };
              
              return (
                <div key={`outstanding-${customer.customer.id}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      {getCustomerIcon(customer.customer.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.customer.name}</p>
                      <Badge variant={overdueStatus.variant} className="text-xs">
                        {overdueStatus.text}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      {formatCurrency(closingBalance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Outstanding Balance
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
