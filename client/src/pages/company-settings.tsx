import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCurrentCompany } from "@/hooks/use-current-company";

const smtpConfigSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().optional(),
  smtpFromEmail: z.string().email().optional().or(z.literal("")),
  smtpFromName: z.string().optional(),
});

const emailTemplateSchema = z.object({
  paymentReminderSubject: z.string().min(1, "Subject is required"),
  paymentReminderTemplate: z.string().min(1, "Email template is required"),
});

type SmtpConfigData = z.infer<typeof smtpConfigSchema>;
type EmailTemplateData = z.infer<typeof emailTemplateSchema>;

function CompanySettings() {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("smtp");

  const { data: company, isLoading } = useQuery({
    queryKey: [`/api/companies/${currentCompany?.id}`],
    enabled: !!currentCompany?.id,
  });

  const { data: smtpDefaults } = useQuery({
    queryKey: [`/api/companies/${currentCompany?.id}/smtp-defaults`],
    enabled: !!currentCompany?.id,
  });

  const smtpForm = useForm<SmtpConfigData>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      smtpSecure: false,
      smtpFromEmail: "",
      smtpFromName: "",
    },
  });

  const templateForm = useForm<EmailTemplateData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      paymentReminderSubject: "Payment Reminder - Invoice Outstanding",
      paymentReminderTemplate: "Dear [CUSTOMER_NAME],\n\nWe hope this message finds you well. We wanted to remind you that you have an outstanding balance with us.\n\nAmount Due: $[AMOUNT_DUE]\nDue Date: [DUE_DATE]\n\nPlease remit payment at your earliest convenience. If you have already sent payment, please disregard this notice.\n\nThank you for your business.\n\nBest regards,\n[COMPANY_NAME]",
    },
  });

  // Set form values when company data loads
  React.useEffect(() => {
    if (company && smtpDefaults) {
      smtpForm.reset({
        smtpHost: (company as any).smtpHost || (smtpDefaults as any).smtpHost || "smtp.gmail.com",
        smtpPort: (company as any).smtpPort || (smtpDefaults as any).smtpPort || 587,
        smtpUser: (company as any).smtpUser || (smtpDefaults as any).smtpUser || "",
        smtpPassword: (company as any).smtpPassword || "", // Never pre-fill password
        smtpSecure: (company as any).smtpSecure || (smtpDefaults as any).smtpSecure || false,
        smtpFromEmail: (company as any).smtpFromEmail || (smtpDefaults as any).smtpFromEmail || "",
        smtpFromName: (company as any).smtpFromName || (smtpDefaults as any).smtpFromName || "",
      });

      templateForm.reset({
        paymentReminderSubject: (company as any).paymentReminderSubject || "Payment Reminder - Invoice Outstanding",
        paymentReminderTemplate: (company as any).paymentReminderTemplate || "Dear [CUSTOMER_NAME],\n\nWe hope this message finds you well. We wanted to remind you that you have an outstanding balance with us.\n\nAmount Due: $[AMOUNT_DUE]\nDue Date: [DUE_DATE]\n\nPlease remit payment at your earliest convenience. If you have already sent payment, please disregard this notice.\n\nThank you for your business.\n\nBest regards,\n[COMPANY_NAME]",
      });
    }
  }, [company, smtpDefaults, smtpForm, templateForm]);

  const updateSmtpMutation = useMutation({
    mutationFn: (data: SmtpConfigData) =>
      apiRequest(`/api/companies/${currentCompany?.id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      toast({ title: "SMTP configuration updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update SMTP configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (data: EmailTemplateData) =>
      apiRequest(`/api/companies/${currentCompany?.id}`, {
        method: "PATCH",
        body: data,
      }),
    onSuccess: () => {
      toast({ title: "Email templates updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update email templates",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/api/companies/${currentCompany?.id}/test-smtp`, {
        method: "POST",
      }),
    onSuccess: () => {
      toast({ title: "SMTP connection test successful!" });
    },
    onError: (error) => {
      toast({
        title: "SMTP connection test failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading company settings...</div>;
  }

  if (!currentCompany) {
    return <div>Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Settings</h1>
        <p className="text-muted-foreground">
          Configure SMTP settings and email templates for {currentCompany.name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>
                Configure your email server settings for sending payment reminders.
                {(smtpDefaults as any)?.hasSystemConfig && (
                  <div className="mt-2 text-sm text-blue-600">
                    System email configured: {(smtpDefaults as any).systemEmail}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...smtpForm}>
                <form onSubmit={smtpForm.handleSubmit((data) => updateSmtpMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={smtpForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.gmail.com" {...field} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Common: smtp.gmail.com (Google), smtp.outlook.com (Microsoft)
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@company.com" {...field} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Usually your full email address
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            For Gmail: Use App Password, not your regular password
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="smtpFromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smtpForm.control}
                      name="smtpFromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={smtpForm.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Use SSL/TLS</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable secure connection (recommended for port 465)
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateSmtpMutation.isPending}>
                      {updateSmtpMutation.isPending ? "Saving..." : "Save SMTP Settings"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => testConnectionMutation.mutate()}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize the subject and content of payment reminder emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...templateForm}>
                <form onSubmit={templateForm.handleSubmit((data) => updateTemplateMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={templateForm.control}
                    name="paymentReminderSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Payment Reminder - Invoice Outstanding" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={templateForm.control}
                    name="paymentReminderTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Template</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your email template..." 
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Available placeholders: [CUSTOMER_NAME], [AMOUNT_DUE], [DUE_DATE], [COMPANY_NAME]
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateTemplateMutation.isPending}>
                    {updateTemplateMutation.isPending ? "Saving..." : "Save Email Template"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CompanySettings;