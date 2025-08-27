import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Upload, FileText, X, Users, AlertTriangle } from "lucide-react";
import { insertRevenueUploadSchema, insertCustomerSchema } from "@shared/schema";
import type { Customer } from "@shared/schema";
import { parseCsv } from "@/lib/csv-parser";

const formSchema = insertRevenueUploadSchema.extend({
  file: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RevenueUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  onUploadSuccess?: () => void;
}

export function RevenueUploadModal({
  isOpen,
  onClose,
  companyId,
  onUploadSuccess,
}: RevenueUploadModalProps) {
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [missingCustomers, setMissingCustomers] = useState<string[]>([]);
  const [showCustomerCreation, setShowCustomerCreation] = useState(false);
  const { toast } = useToast();

  // Query existing customers
  const { data: customers = [] } = useQuery({
    queryKey: [`/api/companies/${companyId}/customers`],
    enabled: !!companyId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId,
      fileName: "",
      status: "UPLOADED",
      totalRows: 0,
      processedRows: 0,
    },
  });

  const createUploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest(`/api/companies/${companyId}/revenue-uploads`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (upload) => {
      // Invalidate revenue uploads query
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${companyId}/revenue-uploads`] 
      });
      
      // Auto-process the upload if CSV data is available
      if (csvPreview.length > 0 && upload.id) {
        processUploadMutation.mutate({
          uploadId: upload.id,
          csvData: csvPreview,
        });
      }
      onUploadSuccess?.();
      onClose();
      form.reset();
      setCsvPreview([]);
      setFileName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create revenue upload",
        variant: "destructive",
      });
    },
  });

  const processUploadMutation = useMutation({
    mutationFn: async ({ uploadId, csvData }: { uploadId: number; csvData: any[] }) => {
      return await apiRequest(`/api/revenue-uploads/${uploadId}/process`, {
        method: "POST",
        body: { csvData },
      });
    },
    onSuccess: () => {
      // Invalidate revenue uploads query
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${companyId}/revenue-uploads`] 
      });
      toast({
        title: "Success",
        description: "Revenue upload processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process revenue upload",
        variant: "destructive",
      });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: { name: string; companyId: number }) => {
      return await apiRequest(`/api/companies/${companyId}/customers`, {
        method: "POST",
        body: customerData,
      });
    },
    onSuccess: () => {
      // Invalidate customers query to refetch updated list
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/customers`] });
    },
    // Remove default error handler to prevent duplicate messages
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      console.log('Raw CSV text:', text.substring(0, 500) + '...');
      
      const parsedData = parseCsv(text);
      console.log('Parsed CSV data:', parsedData);
      console.log('Number of rows:', parsedData.length);
      if (parsedData.length > 0) {
        console.log('First row keys:', Object.keys(parsedData[0]));
        console.log('First row values:', parsedData[0]);
      }
      
      // Validate CSV structure (should have Date, Customer Name, Revenue, Cost columns)
      if (parsedData.length === 0) {
        toast({
          title: "Error", 
          description: "CSV file appears to be empty or has parsing issues. Please check the console for details and ensure your CSV has proper formatting.",
          variant: "destructive",
        });
        return;
      }

      const requiredColumns = ['date', 'customerName', 'revenue', 'cost'];
      const firstRow = parsedData[0];
      const hasRequiredColumns = requiredColumns.every(col => 
        firstRow.hasOwnProperty(col) || 
        firstRow.hasOwnProperty(col.toLowerCase()) ||
        Object.keys(firstRow).some(key => key.toLowerCase().includes(col.toLowerCase()))
      );

      if (!hasRequiredColumns) {
        toast({
          title: "Error",
          description: "CSV must contain columns: Date, Customer Name, Revenue, Cost",
          variant: "destructive",
        });
        return;
      }

      // Check for missing customers
      const existingCustomerNames = customers.map((c: Customer) => c.name.toLowerCase());
      const csvCustomerNames = parsedData.map(row => row.customerName?.toLowerCase()).filter(Boolean);
      const missing = csvCustomerNames.filter(name => !existingCustomerNames.includes(name));
      const uniqueMissing = [...new Set(missing)];
      
      if (uniqueMissing.length > 0) {
        setMissingCustomers(uniqueMissing);
        setShowCustomerCreation(true);
      }

      setCsvPreview(parsedData);
      setFileName(file.name);
      form.setValue("fileName", file.name);
      form.setValue("totalRows", parsedData.length);
      form.setValue("csvData", JSON.stringify(parsedData));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createUploadMutation.mutateAsync(data);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleCreateMissingCustomers = async () => {
    const results = [];
    const errors = [];
    
    for (const customerName of missingCustomers) {
      try {
        const result = await createCustomerMutation.mutateAsync({
          name: customerName,
          companyId: companyId,
        });
        results.push(result);
      } catch (error) {
        errors.push(customerName);
        console.error(`Failed to create customer ${customerName}:`, error);
      }
    }
    
    // Reset missing customers state
    setMissingCustomers([]);
    setShowCustomerCreation(false);
    
    if (errors.length === 0) {
      toast({
        title: "Success",
        description: `${results.length} customers created successfully`,
      });
    } else if (results.length > 0) {
      toast({
        title: "Partial Success",
        description: `${results.length} customers created, ${errors.length} failed`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create customers",
        variant: "destructive",
      });
    }
  };

  const handleSkipCustomerCreation = () => {
    setShowCustomerCreation(false);
    setMissingCustomers([]);
  };

  const handleClose = () => {
    form.reset();
    setCsvPreview([]);
    setFileName("");
    setMissingCustomers([]);
    setShowCustomerCreation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Revenue Data</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Missing Customers Alert */}
            {showCustomerCreation && missingCustomers.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>
                      The following customers are not in your database and need to be created:
                    </p>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      {missingCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center">
                          <Users className="h-3 w-3 mr-2 text-blue-600" />
                          <span className="capitalize">{customer}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateMissingCustomers}
                        disabled={createCustomerMutation.isPending}
                      >
                        {createCustomerMutation.isPending ? "Creating..." : "Create Customers"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSkipCustomerCreation}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">CSV File</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with columns: Date, Customer Name, Revenue, Cost
              </p>
            </div>

            {/* File Name */}
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter file name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="Enter description for this revenue upload"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <Label>CSV Preview ({csvPreview.length} rows)</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(csvPreview[0]).map((key) => (
                          <th key={key} className="text-left p-1">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="p-1">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {csvPreview.length - 5} more rows
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUploadMutation.isPending || processUploadMutation.isPending || !fileName}
              >
                {createUploadMutation.isPending || processUploadMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload & Process
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}