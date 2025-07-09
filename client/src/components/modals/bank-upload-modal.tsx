import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBankStatementUploadSchema } from "@shared/schema";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { parseCSV, validateCSVHeaders } from "@/lib/csv-parser";
import { Upload } from "lucide-react";
import type { BankAccount, InsertBankStatementUpload } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBankStatementUploadSchema.extend({
  file: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BankUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankUploadModal({ isOpen, onClose }: BankUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: bankAccounts = [] } = useQuery<BankAccount[]>({
    queryKey: ["/api/companies", currentCompany?.id, "bank-accounts"],
    enabled: !!currentCompany?.id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: currentCompany?.id || 0,
      bankAccountId: 0,
      fileName: "",
      fileFormat: "CSV",
      status: "PENDING",
      totalRows: 0,
      processedRows: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      const fileContent = await selectedFile.text();
      
      // Validate CSV headers
      if (!validateCSVHeaders(fileContent)) {
        throw new Error("Invalid CSV format. Required columns: date, description, amount");
      }

      // Parse CSV
      const transactions = parseCSV(fileContent);
      
      // Create bank statement upload record
      const uploadData = {
        ...data,
        companyId: currentCompany?.id || 0,
        fileName: selectedFile.name,
        totalRows: transactions.length,
      };

      const response = await apiRequest("POST", "/api/bank-uploads", uploadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", currentCompany?.id, "bank-uploads"] });
      toast({
        title: "Success",
        description: "Bank statement uploaded successfully",
      });
      onClose();
      form.reset();
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload bank statement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (!data.bankAccountId) {
      toast({
        title: "Error",
        description: "Please select a bank account",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("fileName", file.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Bank Statement</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="bankAccountId">Bank Account</Label>
            <Select onValueChange={(value) => form.setValue("bankAccountId", parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.bankAccountId && (
              <p className="text-sm text-red-600">{form.formState.errors.bankAccountId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="fileFormat">File Format</Label>
            <Select onValueChange={(value) => form.setValue("fileFormat", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSV">CSV</SelectItem>
                <SelectItem value="OFX">OFX</SelectItem>
                <SelectItem value="QIF">QIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Bank Statement File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Drop your file here or click to browse</p>
              <Input
                id="file"
                type="file"
                accept=".csv,.ofx,.qif"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
              >
                Select File
              </Button>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !selectedFile}>
              {mutation.isPending ? "Uploading..." : "Upload & Process"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
