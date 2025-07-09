import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RevenueUploadModal } from "@/components/modals/revenue-upload-modal";
import { useToast } from "@/hooks/use-toast";
import type { RevenueUpload } from "@shared/schema";

export default function Revenue() {
  const { currentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: revenueUploads, isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "revenue-uploads"],
    enabled: !!currentCompany?.id,
  });

  const processUploadMutation = useMutation({
    mutationFn: async ({ uploadId, csvData }: { uploadId: number; csvData: any[] }) => {
      return await apiRequest(`/api/revenue-uploads/${uploadId}/process`, {
        method: "POST",
        body: { csvData },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/companies", currentCompany?.id, "revenue-uploads"] 
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UPLOADED":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Uploaded</Badge>;
      case "PROCESSED":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Processed</Badge>;
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReprocess = async (upload: RevenueUpload) => {
    if (!upload.csvData) {
      toast({
        title: "Error",
        description: "No CSV data available for reprocessing",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvData = JSON.parse(upload.csvData);
      await processUploadMutation.mutateAsync({ uploadId: upload.id, csvData });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV data",
        variant: "destructive",
      });
    }
  };

  if (!currentCompany) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Revenue Management</h1>
          <p className="text-muted-foreground">Please select a company to view revenue uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Revenue Management</h1>
          <p className="text-muted-foreground">
            Upload and manage revenue data for {currentCompany.name}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Revenue Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueUploads?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueUploads?.filter((u: RevenueUpload) => u.status === "PROCESSED").length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueUploads?.reduce((sum: number, u: RevenueUpload) => sum + (u.processedRows || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-900">
                <strong>Revenue Data Location:</strong> After uploading and processing your revenue CSV files, 
                the individual revenue entries will appear in the <strong>Customer Statement</strong> page. 
                Select a customer to view their revenue entries, costs, and account balance.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.href = '/customer-statement'}
              >
                View Customer Statements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Uploads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading uploads...</div>
          ) : !revenueUploads || revenueUploads.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No revenue uploads yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload your first revenue file to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">File Name</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Records</th>
                    <th className="text-left p-2">Uploaded</th>
                    <th className="text-left p-2">Processed</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueUploads.map((upload: RevenueUpload) => (
                    <tr key={upload.id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {upload.fileName}
                        </div>
                      </td>
                      <td className="p-2">{getStatusBadge(upload.status)}</td>
                      <td className="p-2">{upload.processedRows || 0}</td>
                      <td className="p-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(upload.createdAt), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="p-2">
                        {upload.processedDate ? (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(upload.processedDate), "MMM d, yyyy")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {upload.status === "UPLOADED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReprocess(upload)}
                              disabled={processUploadMutation.isPending}
                            >
                              Process
                            </Button>
                          )}
                          {upload.status === "FAILED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReprocess(upload)}
                              disabled={processUploadMutation.isPending}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Upload Modal */}
      <RevenueUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={currentCompany.id}
        onUploadSuccess={() => {
          queryClient.invalidateQueries({ 
            queryKey: ["/api/companies", currentCompany?.id, "revenue-uploads"] 
          });
        }}
      />
    </div>
  );
}