import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import { Upload, FileText, X } from "lucide-react";
import { insertRevenueUploadSchema } from "@shared/schema";
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
  const { toast } = useToast();

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
      return await apiRequest("/api/revenue-uploads", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (upload) => {
      // Auto-process the upload if CSV data is available
      if (csvPreview.length > 0) {
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
      const parsedData = parseCsv(text);
      
      // Validate CSV structure (should have Date, Customer Name, Revenue, Cost columns)
      if (parsedData.length === 0) {
        toast({
          title: "Error",
          description: "CSV file is empty",
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

  const handleClose = () => {
    form.reset();
    setCsvPreview([]);
    setFileName("");
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