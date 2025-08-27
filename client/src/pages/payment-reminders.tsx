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
import { AlertCircle, Mail, Send, Settings, TestTube, Clock, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerWithBalance {
  id: number;
  name: string;
  email: string;
  balanceDue: number;
  daysOverdue: number;
  invoiceCount: number;
  oldestDueDate: string;
}

export default function PaymentReminders() {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);

  const { data: customersWithBalance = [], isLoading } = useQuery<CustomerWithBalance[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`],
    enabled: !!currentCompany?.id,
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/email/test-connection", {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      setEmailConfigured(data.connected);
      toast({
        title: data.connected ? "Success" : "Failed",
        description: data.connected 
          ? "Email connection is working properly" 
          : "Email connection failed - please check your configuration",
        variant: data.connected ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to test email connection",
        variant: "destructive",
      });
    },
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

      {/* Email Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure and test your email settings for sending payment reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To configure email settings, you need to set up your Google Workspace credentials in the environment variables:
              <br />
              • GOOGLE_WORKSPACE_EMAIL: Your email address
              <br />
              • GOOGLE_WORKSPACE_APP_PASSWORD: Your app-specific password
              <br />
              • SMTP_FROM_EMAIL: The from email address for reminders
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => testEmailMutation.mutate()}
            disabled={testEmailMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {testEmailMutation.isPending ? "Testing..." : "Test Email Connection"}
          </Button>
          
          {emailConfigured && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                Email is configured and working properly!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
            Select customers to send payment reminders to
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
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="font-medium">{customer.name}</Label>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-500">Balance Due</Label>
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
                        <Label className="text-sm text-gray-500">Invoices</Label>
                        <p className="text-sm">{customer.invoiceCount} invoice(s)</p>
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

      {/* Automatic Scheduling Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Automatic Reminder Schedule
          </CardTitle>
          <CardDescription>
            Information about when automatic reminders are sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>On due date:</strong> Initial reminder
              </div>
              <div>
                <strong>7 days overdue:</strong> First follow-up
              </div>
              <div>
                <strong>15 days overdue:</strong> Second follow-up
              </div>
              <div>
                <strong>30 days overdue:</strong> Final notice
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              After 30 days, reminders are sent every 30 days until the balance is paid.
              Reminders are only sent to customers with valid email addresses.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}