import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertVendorSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import type { Vendor, InsertVendor } from "@shared/schema";
import { z } from "zod";

const formSchema = insertVendorSchema.extend({
  openingBalanceDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Vendor;
}

export function VendorFormModal({ isOpen, onClose, vendor }: VendorFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      billingAddress: "",
      defaultPaymentMethod: "Bank Transfer",
      openingBalance: "0.00",
      openingBalanceDate: "",
    },
  });

  // Reset form when vendor changes (for editing existing vendors)
  useEffect(() => {
    if (vendor) {
      form.reset({
        companyId: currentCompany?.id || 0,
        name: vendor.name || "",
        contactPerson: vendor.contactPerson || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        billingAddress: vendor.billingAddress || "",
        defaultPaymentMethod: vendor.defaultPaymentMethod || "Bank Transfer",
        openingBalance: vendor.openingBalance || "0.00",
        openingBalanceDate: vendor.openingBalanceDate || "",
      });
    } else {
      // Reset to default values for new vendor
      form.reset({
        companyId: currentCompany?.id || 0,
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        billingAddress: "",
        defaultPaymentMethod: "Bank Transfer",
        openingBalance: "0.00",
        openingBalanceDate: "",
      });
    }
  }, [vendor, currentCompany?.id, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = vendor ? `/api/vendors/${vendor.id}` : "/api/vendors";
      const method = vendor ? "PUT" : "POST";
      const response = await apiRequest(url, {
        method,
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/vendors`] });
      toast({
        title: "Success",
        description: `Vendor ${vendor ? 'updated' : 'created'} successfully`,
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${vendor ? 'update' : 'create'} vendor`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Vendor Name *</Label>
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
              <Label htmlFor="defaultPaymentMethod">Default Payment Method</Label>
              <Select onValueChange={(value) => form.setValue("defaultPaymentMethod", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
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
              {mutation.isPending ? "Saving..." : vendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
