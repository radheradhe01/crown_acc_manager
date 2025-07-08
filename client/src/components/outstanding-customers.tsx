import { useQuery } from "@tanstack/react-query";
import { Building, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, calculateDaysOverdue } from "@/lib/accounting-utils";

export function OutstandingCustomers() {
  const { currentCompany } = useCurrentCompany();

  const { data: outstandingCustomers = [], isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "outstanding-customers"],
    enabled: !!currentCompany?.id,
  });

  const getCustomerIcon = (name: string) => {
    if (name.toLowerCase().includes('inc') || name.toLowerCase().includes('corp') || name.toLowerCase().includes('llc')) {
      return <Building className="h-5 w-5 text-gray-600" />;
    }
    if (name.toLowerCase().includes('store') || name.toLowerCase().includes('shop')) {
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
          <h3 className="text-lg font-semibold text-gray-900">Outstanding Customers</h3>
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0">
            View Report
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
        ) : outstandingCustomers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No outstanding customer balances</p>
          </div>
        ) : (
          <div className="space-y-4">
            {outstandingCustomers.slice(0, 5).map((customer: any) => {
              const overdueStatus = getOverdueStatus(customer.oldestInvoiceDate);
              
              return (
                <div key={customer.customerId} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {getCustomerIcon(customer.customerName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.customerName}</p>
                      <Badge variant={overdueStatus.variant} className="text-xs">
                        {overdueStatus.text}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      {formatCurrency(customer.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}
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
