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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCompanySchema } from "@shared/schema";
import type { Company, InsertCompany } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCompanySchema.extend({
  fiscalYearStart: z.string(),
  fiscalYearEnd: z.string(),
});

type FormData = z.infer<typeof formSchema>;

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (company: Company) => void;
}

export function CompanyFormModal({ isOpen, onClose, onSuccess }: CompanyFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      legalEntityType: "",
      taxId: "",
      registeredAddress: "",
      defaultCurrency: "USD",
      fiscalYearStart: "",
      fiscalYearEnd: "",
      email: "",
      phone: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("/api/companies", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      onSuccess(company);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Transform the data to handle empty date strings
    const transformedData = {
      ...data,
      fiscalYearStart: data.fiscalYearStart || "2024-01-01",
      fiscalYearEnd: data.fiscalYearEnd || "2024-12-31",
    };
    mutation.mutate(transformedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter company name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="legalEntityType">Legal Entity Type *</Label>
              <Select onValueChange={(value) => form.setValue("legalEntityType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="Corporation">Corporation</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.legalEntityType && (
                <p className="text-sm text-red-600">{form.formState.errors.legalEntityType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="taxId">Tax ID / EIN *</Label>
              <Input
                id="taxId"
                {...form.register("taxId")}
                placeholder="Enter tax ID or EIN"
              />
              {form.formState.errors.taxId && (
                <p className="text-sm text-red-600">{form.formState.errors.taxId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="company@example.com"
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
              <Label htmlFor="fiscalYearStart">Fiscal Year Start *</Label>
              <Input
                id="fiscalYearStart"
                type="date"
                {...form.register("fiscalYearStart")}
              />
            </div>

            <div>
              <Label htmlFor="fiscalYearEnd">Fiscal Year End *</Label>
              <Input
                id="fiscalYearEnd"
                type="date"
                {...form.register("fiscalYearEnd")}
              />
            </div>

            <div>
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select onValueChange={(value) => form.setValue("defaultCurrency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="registeredAddress">Registered Address *</Label>
              <Textarea
                id="registeredAddress"
                {...form.register("registeredAddress")}
                placeholder="Enter full registered address"
                rows={3}
              />
              {form.formState.errors.registeredAddress && (
                <p className="text-sm text-red-600">{form.formState.errors.registeredAddress.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Add Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
