import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Mail, 
  Calendar, 
  DollarSign,
  FileText,
  Users,
  Clock,
  Send
} from "lucide-react";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0, "Rate must be positive"),
  amount: z.coerce.number()
});

const recurringTemplateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  customerId: z.coerce.number().min(1, "Customer is required"),
  description: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  frequency: z.string().min(1, "Frequency is required"),
  paymentTerms: z.string().default("Net 30"),
  isActive: z.boolean().default(true),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  autoSendEmail: z.boolean().default(true),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

type RecurringTemplateFormData = z.infer<typeof recurringTemplateSchema>;

interface RecurringTemplate {
  id: number;
  templateName: string;
  description?: string;
  customerId: number;
  customerName?: string;
  frequency: string;
  totalAmount: string;
  isActive: boolean;
  nextGenerationDate: string;
  lastGeneratedDate?: string;
  autoSendEmail: boolean;
  createdAt: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

export default function AutomatedInvoices() {
  const { currentCompany } = useCurrentCompany();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RecurringTemplate | null>(null);

  // Fetch recurring templates
  const { data: templates = [], isLoading } = useQuery<RecurringTemplate[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/recurring-invoice-templates`],
    enabled: !!currentCompany?.id,
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers`],
    enabled: !!currentCompany?.id,
  });

  const form = useForm<RecurringTemplateFormData>({
    resolver: zodResolver(recurringTemplateSchema),
    defaultValues: {
      templateName: "",
      customerId: 0,
      description: "",
      lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      frequency: "monthly",
      paymentTerms: "Net 30",
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      autoSendEmail: true,
      taxRate: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  // Watch line items to calculate totals
  const watchedLineItems = form.watch("lineItems");
  const taxRate = form.watch("taxRate");

  const subtotal = watchedLineItems.reduce((sum, item) => {
    const amount = (item.quantity || 0) * (item.rate || 0);
    return sum + amount;
  }, 0);

  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // Update line item amounts when quantity or rate changes
  const updateLineItemAmount = (index: number) => {
    const quantity = form.getValues(`lineItems.${index}.quantity`) || 0;
    const rate = form.getValues(`lineItems.${index}.rate`) || 0;
    form.setValue(`lineItems.${index}.amount`, quantity * rate);
  };

  // Create/Update template mutation
  const templateMutation = useMutation({
    mutationFn: async (data: RecurringTemplateFormData) => {
      const payload = {
        ...data,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
      };

      if (editingTemplate) {
        return apiRequest(`/api/companies/${currentCompany?.id}/recurring-invoice-templates/${editingTemplate.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest(`/api/companies/${currentCompany?.id}/recurring-invoice-templates`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: editingTemplate ? "Template updated successfully" : "Template created successfully",
      });
      setIsDialogOpen(false);
      setEditingTemplate(null);
      form.reset();
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${currentCompany?.id}/recurring-invoice-templates`] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId: number) =>
      apiRequest(`/api/companies/${currentCompany?.id}/recurring-invoice-templates/${templateId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({ title: "Template deleted successfully" });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${currentCompany?.id}/recurring-invoice-templates`] 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  // Generate invoice mutation
  const generateMutation = useMutation({
    mutationFn: (templateId: number) =>
      apiRequest(`/api/companies/${currentCompany?.id}/recurring-invoice-templates/${templateId}/generate`, {
        method: "POST",
      }),
    onSuccess: () => {
      toast({ title: "Invoice generated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: RecurringTemplateFormData) => {
    templateMutation.mutate(data);
  };

  const handleEdit = (template: RecurringTemplate) => {
    setEditingTemplate(template);
    // Set form values for editing (you'd need to fetch full template data)
    setIsDialogOpen(true);
  };

  const handleDelete = (templateId: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleGenerateInvoice = (templateId: number) => {
    generateMutation.mutate(templateId);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (!currentCompany) {
    return <div>Please select a company first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automated Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage recurring invoice templates with automated generation and email sending
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Recurring Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation Status</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Invoice Templates</CardTitle>
              <CardDescription>
                Manage your automated invoice templates and their generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recurring templates yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first recurring invoice template to automate billing
                  </p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Next Generation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{template.templateName}</div>
                            {template.description && (
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {template.customerName || `Customer #${template.customerId}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {template.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {parseFloat(template.totalAmount).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(template.nextGenerationDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {template.autoSendEmail && (
                              <Badge variant="outline">
                                <Mail className="h-3 w-3 mr-1" />
                                Auto Email
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateInvoice(template.id)}
                              disabled={generateMutation.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(template.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Status</CardTitle>
              <CardDescription>
                Monitor automated invoice generation and email sending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Active Templates</p>
                        <p className="text-2xl font-bold">
                          {templates.filter(t => t.isActive).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Due Today</p>
                        <p className="text-2xl font-bold">
                          {templates.filter(t => 
                            t.isActive && 
                            new Date(t.nextGenerationDate).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Auto Email Enabled</p>
                        <p className="text-2xl font-bold">
                          {templates.filter(t => t.autoSendEmail).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Recurring Template" : "Create Recurring Template"}
            </DialogTitle>
            <DialogDescription>
              Set up automated invoice generation with customizable schedules and email delivery
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="templateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Monthly Service Invoice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Template description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-base font-semibold">Line Items</Label>
                <div className="space-y-4 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Service description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateLineItemAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`lineItems.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rate</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    updateLineItemAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                          ${((watchedLineItems[index]?.quantity || 0) * (watchedLineItems[index]?.rate || 0)).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Subtotal</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-medium">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label>Total Amount</Label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-bold text-lg">
                    ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                          <SelectItem value="Net 15">Net 15</SelectItem>
                          <SelectItem value="Net 30">Net 30</SelectItem>
                          <SelectItem value="Net 60">Net 60</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Active Template</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoSendEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Auto Send Emails</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={templateMutation.isPending}>
                  {templateMutation.isPending ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}