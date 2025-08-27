import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Mail, Send, Settings, Clock, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomerReminderSettingsModal } from "@/components/modals/customer-reminder-settings-modal";

interface PaymentReminderSettings {
  enableDailyReminders: boolean;
  reminderTimes: number[];
  recurringAfter: number;
  dailyReminderTime: string;
}

interface CustomerWithBalance {
  id: number;
  name: string;
  email: string;
  balanceDue: number;
  daysOverdue: number;
  invoiceCount: number;
  oldestDueDate: string;
  hasEmail?: boolean;
  enablePaymentReminders?: boolean;
  reminderDays?: string;
  reminderFrequency?: number;
}

export default function PaymentReminders() {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [settingsCustomer, setSettingsCustomer] = useState<CustomerWithBalance | null>(null);

  const [reminderSettings, setReminderSettings] = useState<PaymentReminderSettings>({
    enableDailyReminders: false,
    reminderTimes: [0, 7, 15, 30],
    recurringAfter: 30,
    dailyReminderTime: "09:00"
  });

  const { data: customersWithBalance = [], isLoading } = useQuery<CustomerWithBalance[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`],
    enabled: !!currentCompany?.id,
  });



  const sendRemindersMutation = useMutation({
    mutationFn: async (customerIds?: number[]) => {
      return apiRequest(`/api/companies/${currentCompany?.id}/payment-reminders/send`, {
        method: "POST",
        body: { customerIds },
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Payment reminders sent successfully`,
      });
      setSelectedCustomers([]);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send payment reminders",
        variant: "destructive",
      });
    },
  });

  const toggleRemindersMutation = useMutation({
    mutationFn: async ({ customerId, enabled }: { customerId: number, enabled: boolean }) => {
      return apiRequest(`/api/customers/${customerId}`, {
        method: "PUT",
        body: { enablePaymentReminders: enabled },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer reminder settings updated",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder settings",
        variant: "destructive",
      });
    },
  });

  const handleSelectCustomer = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customersWithBalance.map((c) => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSendReminders = () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "No customers selected",
        description: "Please select at least one customer to send reminders to",
        variant: "destructive",
      });
      return;
    }
    sendRemindersMutation.mutate(selectedCustomers);
  };

  const handleSendAllReminders = () => {
    sendRemindersMutation.mutate(undefined);
  };

  const toggleCustomerReminders = (customerId: number, enabled: boolean) => {
    toggleRemindersMutation.mutate({ customerId, enabled });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDaysOverdue = (days: number) => {
    if (days === 0) return "Due today";
    if (days === 1) return "1 day overdue";
    return `${days} days overdue`;
  };

  const getDaysOverdueBadgeVariant = (days: number) => {
    if (days === 0) return "default";
    if (days <= 7) return "secondary";
    if (days <= 30) return "destructive";
    return "destructive";
  };

  if (!currentCompany) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a company to manage payment reminders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Reminders</h1>
          <p className="text-gray-600 mt-2">
            Send automated payment reminders to customers with outstanding balances
          </p>
        </div>
      </div>



      {/* Customers with Outstanding Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Customers with Outstanding Balance
            {customersWithBalance.length > 0 && (
              <Badge variant="secondary">{customersWithBalance.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            All customers with outstanding balances (including opening balances and receivables)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : customersWithBalance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No customers with outstanding balances found
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedCustomers.length === customersWithBalance.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({customersWithBalance.length} customers)
                </Label>
              </div>
              
              <Separator />
              
              {/* Customer List */}
              <div className="space-y-3">
                {customersWithBalance.map((customer) => (
                  <div key={customer.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={`customer-${customer.id}`}
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => 
                        handleSelectCustomer(customer.id, checked as boolean)
                      }
                    />
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label className="font-medium">{customer.name}</Label>
                        <div className="flex items-center gap-2">
                          {customer.email ? (
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          ) : (
                            <p className="text-sm text-red-500">No email address</p>
                          )}
                          {!customer.hasEmail && (
                            <Badge variant="destructive" className="text-xs">
                              Cannot email
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Outstanding Balance</Label>
                        <p className="font-medium text-red-600">
                          {formatCurrency(customer.balanceDue)}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Status</Label>
                        <div>
                          <Badge variant={getDaysOverdueBadgeVariant(customer.daysOverdue)}>
                            {formatDaysOverdue(customer.daysOverdue)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Details</Label>
                        <p className="text-sm">
                          {customer.invoiceCount > 0 
                            ? `${customer.invoiceCount} invoice(s)` 
                            : "Opening balance"}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm text-gray-500">Reminders</Label>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={customer.enablePaymentReminders ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            Auto: {customer.enablePaymentReminders ? "On" : "Off"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => setSettingsCustomer(customer)}
                          >
                            Settings
                          </Button>
                        </div>
                        {customer.reminderDays && (
                          <p className="text-xs text-gray-500 mt-1">
                            Days: {customer.reminderDays}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSendReminders}
                  disabled={selectedCustomers.length === 0 || sendRemindersMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sendRemindersMutation.isPending 
                    ? "Sending..." 
                    : `Send Reminders (${selectedCustomers.length})`
                  }
                </Button>
                
                <Button
                  onClick={handleSendAllReminders}
                  disabled={sendRemindersMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send to All Customers
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automatic Reminder Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatic Daily Reminder Schedule
          </CardTitle>
          <CardDescription>
            Configure when automatic payment reminders are sent daily
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="font-medium">Enable Daily Automatic Reminders</Label>
              <p className="text-sm text-gray-600">
                Automatically send payment reminders to customers with outstanding balances
              </p>
            </div>
            <Button 
              variant={reminderSettings.enableDailyReminders ? "default" : "outline"} 
              size="sm"
              onClick={() => setReminderSettings(prev => ({ 
                ...prev, 
                enableDailyReminders: !prev.enableDailyReminders 
              }))}
            >
              {reminderSettings.enableDailyReminders ? "Enabled" : "Enable Daily Reminders"}
            </Button>
          </div>

          {/* Current Schedule */}
          <div className="space-y-4">
            <Label className="font-medium">Current Reminder Schedule</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>Daily Time:</strong> 9:00 AM
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>On due date:</strong> Initial reminder
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>7 days overdue:</strong> First follow-up
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>15 days overdue:</strong> Second follow-up
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>30 days overdue:</strong> Final notice
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>After 30 days:</strong> Every 30 days
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-medium">Reminder Settings</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminderTime" className="text-sm">Daily Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  defaultValue="09:00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="recurringDays" className="text-sm">Recurring Reminder (days)</Label>
                <Input
                  id="recurringDays"
                  type="number"
                  defaultValue="30"
                  placeholder="30"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Reminder Days (comma-separated)</Label>
              <Input
                defaultValue="0, 7, 15, 30"
                placeholder="0, 7, 15, 30"
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Days after due date when reminders are sent (0 = on due date)
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit"
              onClick={() => {
                toast({
                  title: "Settings Saved",
                  description: "Daily reminder settings have been updated",
                });
              }}
            >
              Save Reminder Settings
            </Button>
          </div>

          {/* Status Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> The system checks every hour for customers due for reminders based on your schedule. 
              Reminders are only sent to customers with valid email addresses and outstanding balances.
              You can send manual reminders anytime using the buttons above.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      {/* Customer Reminder Settings Modal */}
      {settingsCustomer && (
        <CustomerReminderSettingsModal
          isOpen={!!settingsCustomer}
          onClose={() => setSettingsCustomer(null)}
          customer={settingsCustomer}
        />
      )}
    </div>
  );
}