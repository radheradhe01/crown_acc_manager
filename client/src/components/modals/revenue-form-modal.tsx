import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInvoiceSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { generateInvoiceNumber, calculateDueDate } from "@/lib/accounting-utils";
import type { Customer, Invoice, InsertInvoice } from "@shared/schema";
import { z } from "zod";

const formSchema = insertInvoiceSchema.extend({
  invoiceDate: z.string(),
  dueDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface RevenueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice;
}

export function RevenueFormModal({ isOpen, onClose, invoice }: RevenueFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/companies", currentCompany?.id, "customers"],
    enabled: !!currentCompany?.id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      customerId: invoice?.customerId || 0,
      invoiceNumber: invoice?.invoiceNumber || generateInvoiceNumber(),
      invoiceDate: invoice?.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoice?.dueDate || "",
      amount: invoice?.amount || "0.00",
      status: invoice?.status || "PENDING",
      notes: invoice?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = invoice ? `/api/invoices/${invoice.id}` : "/api/invoices";
      const method = invoice ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "invoices"] });
      toast({
        title: "Success",
        description: `Invoice ${invoice ? 'updated' : 'created'} successfully`,
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${invoice ? 'update' : 'create'} invoice`,
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

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
      form.setValue("customerId", parseInt(customerId));
      // Calculate due date based on payment terms
      const invoiceDate = form.getValues("invoiceDate");
      const dueDate = calculateDueDate(invoiceDate, customer.paymentTerms);
      form.setValue("dueDate", dueDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                {...form.register("invoiceNumber")}
                placeholder="INV-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="customerId">Customer *</Label>
              <Select onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.customerId && (
                <p className="text-sm text-red-600">{form.formState.errors.customerId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...form.register("invoiceDate")}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...form.register("amount")}
                placeholder="0.00"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => form.setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Additional notes or description..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
