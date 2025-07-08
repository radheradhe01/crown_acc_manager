import { useState } from "react";
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
      name: customer?.name || "",
      contactPerson: customer?.contactPerson || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      billingAddress: customer?.billingAddress || "",
      shippingAddress: customer?.shippingAddress || "",
      paymentTerms: customer?.paymentTerms || "Net 30",
      openingBalance: customer?.openingBalance || "0.00",
      openingBalanceDate: customer?.openingBalanceDate || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = customer ? `/api/customers/${customer.id}` : "/api/customers";
      const method = customer ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "customers"] });
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
    mutation.mutate({
      ...data,
      companyId: currentCompany?.id || 0,
    });
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
