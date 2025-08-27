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
import { parseBankStatementCSV, validateCSVHeaders } from "@/lib/csv-parser";
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
    queryKey: [`/api/companies/${currentCompany?.id}/bank-accounts`],
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

      try {
        // Use FileReader for better browser compatibility
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error("Failed to read file content"));
            }
          };
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsText(selectedFile);
        });
        
        // Extract headers from the first line
        const lines = fileContent.trim().split('\n');
        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Validate CSV headers
        const validation = validateCSVHeaders(headers);
        if (!validation.isValid) {
          throw new Error("Invalid CSV format. Required columns: date, description, amount. " + validation.errors.join(', '));
        }

        // Parse CSV
        const transactions = parseBankStatementCSV(fileContent);
        
        // Create bank statement upload record with CSV data
        const uploadData = {
          ...data,
          companyId: currentCompany?.id || 0,
          fileName: selectedFile.name,
          totalRows: transactions.length,
          csvData: transactions, // Include parsed CSV data for processing
        };

        const response = await apiRequest(`/api/companies/${currentCompany?.id}/bank-uploads`, {
          method: "POST",
          body: uploadData
        });
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to process file");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/bank-uploads`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${currentCompany?.id}/bank-statement-transactions`] });
      toast({
        title: "Success",
        description: "Bank statement uploaded successfully",
      });
      handleCloseModal();
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

  const handleCloseModal = () => {
    form.reset();
    setSelectedFile(null);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      form.setValue("fileName", file.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Bank Statement</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="bankAccountId">Bank Account</Label>
            <Select 
              value={form.watch("bankAccountId")?.toString() || ""} 
              onValueChange={(value) => form.setValue("bankAccountId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account..." />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} - {account.bankName}
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
            <Select 
              value={form.watch("fileFormat") || "CSV"} 
              onValueChange={(value) => form.setValue("fileFormat", value)}
            >
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
            
            {/* Sample CSV Format */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Sample CSV Format:</h4>
              <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border">
                <div>Date       Description     Amount  Type</div>
                <div>7/10/25    NexoraTech - Refund     998     Credit</div>
                <div>7/6/25     DEF Enterprises - Internet Bill -307    Debit</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Required columns:</strong> Date, Description, Amount (or Debit/Credit)<br/>
                <strong>Optional:</strong> Type column for transaction classification<br/>
                <strong>Separators:</strong> Tab-separated or comma-separated values<br/>
                <strong>Date formats:</strong> MM/DD/YY, YYYY-MM-DD, DD/MM/YYYY
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
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
