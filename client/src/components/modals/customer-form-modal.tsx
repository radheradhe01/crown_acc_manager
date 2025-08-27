import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import type { Customer, InsertCustomer } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCustomerSchema.extend({
  openingBalanceDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

export function CustomerFormModal({ isOpen, onClose, customer }: CustomerFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
      paymentTerms: "Net 30",
      openingBalance: "0.00",
      openingBalanceDate: "",
    },
  });

  // Reset form when customer changes (for editing existing customers)
  useEffect(() => {
    if (customer) {
      form.reset({
        companyId: currentCompany?.id || 0,
        name: customer.name || "",
        contactPerson: customer.contactPerson || "",
        email: customer.email || "",
        phone: customer.phone || "",
        billingAddress: customer.billingAddress || "",
        shippingAddress: customer.shippingAddress || "",
        paymentTerms: customer.paymentTerms || "Net 30",
        openingBalance: customer.openingBalance || "0.00",
        openingBalanceDate: customer.openingBalanceDate || "",
        enablePaymentReminders: customer.enablePaymentReminders ?? true,
        reminderDays: customer.reminderDays || "0,7,15,30",
        reminderFrequency: customer.reminderFrequency || 30,
      });
    } else {
      // Reset to default values for new customer
      form.reset({
        companyId: currentCompany?.id || 0,
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        billingAddress: "",
        shippingAddress: "",
        paymentTerms: "Net 30",
        openingBalance: "0.00",
        openingBalanceDate: "",
        enablePaymentReminders: true,
        reminderDays: "0,7,15,30",
        reminderFrequency: 30,
      });
    }
  }, [customer, currentCompany?.id, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = customer ? `/api/customers/${customer.id}` : "/api/customers";
      const method = customer ? "PUT" : "POST";
      const response = await apiRequest(url, {
        method,
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/customers`] });
      toast({
        title: "Success",
        description: `Customer ${customer ? 'updated' : 'created'} successfully`,
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${customer ? 'update' : 'create'} customer`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Convert empty date strings to null to avoid database errors
    const cleanedData = {
      ...data,
      companyId: currentCompany?.id || 0,
      openingBalanceDate: data.openingBalanceDate?.trim() || undefined,
    };
    mutation.mutate(cleanedData);
  };

  const handleSameAsBilling = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      form.setValue("shippingAddress", form.getValues("billingAddress"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Company or individual name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...form.register("contactPerson")}
                placeholder="John Smith"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="john@company.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select onValueChange={(value) => form.setValue("paymentTerms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                  <SelectItem value="15 EOM">15 EOM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Textarea
                id="billingAddress"
                {...form.register("billingAddress")}
                placeholder="Street address, city, state, ZIP"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <div className="flex items-center mb-2">
                <Checkbox
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onCheckedChange={handleSameAsBilling}
                />
                <Label htmlFor="sameAsBilling" className="ml-2 text-sm">
                  Same as billing address
                </Label>
              </div>
              <Textarea
                id="shippingAddress"
                {...form.register("shippingAddress")}
                placeholder="Street address, city, state, ZIP"
                rows={3}
                disabled={sameAsBilling}
              />
            </div>

            <div>
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                {...form.register("openingBalance")}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="openingBalanceDate">Opening Balance Date</Label>
              <Input
                id="openingBalanceDate"
                type="date"
                {...form.register("openingBalanceDate")}
              />
            </div>
          </div>

          {/* Payment Reminder Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <Label className="font-medium">Payment Reminder Settings</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableReminders"
                {...form.register("enablePaymentReminders")}
              />
              <Label htmlFor="enableReminders" className="text-sm">
                Enable automatic payment reminders for this customer
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminderDays" className="text-sm">Reminder Days</Label>
                <Input
                  id="reminderDays"
                  {...form.register("reminderDays")}
                  placeholder="0,7,15,30"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Days after due date (comma-separated)
                </p>
              </div>
              
              <div>
                <Label htmlFor="reminderFrequency" className="text-sm">Recurring Frequency (days)</Label>
                <Input
                  id="reminderFrequency"
                  type="number"
                  {...form.register("reminderFrequency", { valueAsNumber: true })}
                  placeholder="30"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
