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
import { insertBillSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { generateBillNumber } from "@/lib/accounting-utils";
import type { Vendor, Bill, InsertBill } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBillSchema.extend({
  billDate: z.string(),
  dueDate: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill?: Bill;
}

export function ExpenseFormModal({ isOpen, onClose, bill }: ExpenseFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/companies", currentCompany?.id, "vendors"],
    enabled: !!currentCompany?.id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      vendorId: bill?.vendorId || 0,
      billNumber: bill?.billNumber || generateBillNumber(),
      billDate: bill?.billDate || new Date().toISOString().split('T')[0],
      dueDate: bill?.dueDate || "",
      amount: bill?.amount || "0.00",
      status: bill?.status || "PENDING",
      notes: bill?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = bill ? `/api/bills/${bill.id}` : "/api/bills";
      const method = bill ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "bills"] });
      toast({
        title: "Success",
        description: `Bill ${bill ? 'updated' : 'created'} successfully`,
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${bill ? 'update' : 'create'} bill`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bill ? 'Edit Bill' : 'Record New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billNumber">Bill Number</Label>
              <Input
                id="billNumber"
                {...form.register("billNumber")}
                placeholder="BILL-2024-001"
              />
            </div>

            <div>
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select onValueChange={(value) => form.setValue("vendorId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.vendorId && (
                <p className="text-sm text-red-600">{form.formState.errors.vendorId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="billDate">Bill Date</Label>
              <Input
                id="billDate"
                type="date"
                {...form.register("billDate")}
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
              {mutation.isPending ? "Saving..." : bill ? "Update Bill" : "Record Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
