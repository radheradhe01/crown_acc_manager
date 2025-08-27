import { useQuery } from "@tanstack/react-query";
import { Building, User, Store, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, calculateDaysOverdue, formatDate } from "@/lib/accounting-utils";
import { useLocation } from "wouter";

export function OutstandingCustomers() {
  const { currentCompany } = useCurrentCompany();
  const [, setLocation] = useLocation();

  const { data: outstandingBalances, isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "customer-statements"],
    enabled: !!currentCompany?.id,
  });

  // Get customers with outstanding balances and reminder information
  const { data: customersWithBalance, isLoading: isLoadingReminders } = useQuery({
    queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`],
    enabled: !!currentCompany?.id,
  });

  // Extract customers with outstanding balances for payment reminders
  const outstandingCustomers = customersWithBalance || [];

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

  const getOverdueStatus = (daysOverdue: number) => {
    if (daysOverdue === 0) {
      return { text: "Current", variant: "outline" as const };
    }
    if (daysOverdue <= 7) {
      return { text: `${daysOverdue} days overdue`, variant: "secondary" as const };
    }
    if (daysOverdue <= 30) {
      return { text: `${daysOverdue} days overdue`, variant: "default" as const };
    }
    return { text: `${daysOverdue} days overdue`, variant: "destructive" as const };
  };

  const getReminderStatus = (customer: any) => {
    if (!customer.hasEmail) {
      return { text: "No Email", icon: null, variant: "outline" as const, color: "text-gray-500" };
    }
    if (!customer.enablePaymentReminders) {
      return { text: "Disabled", icon: null, variant: "outline" as const, color: "text-gray-500" };
    }
    if (customer.lastReminderSent) {
      const daysSinceReminder = Math.floor((new Date().getTime() - new Date(customer.lastReminderSent).getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `Sent ${daysSinceReminder}d ago`, 
        icon: <Mail className="h-3 w-3" />, 
        variant: "secondary" as const, 
        color: "text-green-600" 
      };
    }
    return { 
      text: "Ready to Send", 
      icon: <Clock className="h-3 w-3" />, 
      variant: "default" as const, 
      color: "text-blue-600" 
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Payment Reminders</h3>
          <Button 
            variant="link" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium p-0"
            onClick={() => setLocation("/reports/outstanding-balances")}
          >
            View All Receivables
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Customers with outstanding balances requiring payment follow-up</p>
      </div>
      
      <div className="p-6">
        {(isLoading || isLoadingReminders) ? (
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
              const overdueStatus = getOverdueStatus(customer.daysOverdue || 0);
              const reminderStatus = getReminderStatus(customer);
              
              return (
                <div key={`outstanding-${customer.id}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      {getCustomerIcon(customer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={overdueStatus.variant} className="text-xs">
                          {overdueStatus.text}
                        </Badge>
                        <div className={`flex items-center gap-1 text-xs ${reminderStatus.color}`}>
                          {reminderStatus.icon}
                          <span>{reminderStatus.text}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-orange-600">
                      {formatCurrency(customer.balanceDue)}
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
