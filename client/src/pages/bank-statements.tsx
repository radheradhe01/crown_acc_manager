import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BankUploadModal } from "@/components/modals/bank-upload-modal";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatDate } from "@/lib/accounting-utils";
import type { BankStatementUpload } from "@shared/schema";

export default function BankStatements() {
  const { currentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: uploads = [], isLoading } = useQuery<BankStatementUpload[]>({
    queryKey: ["/api/companies", currentCompany?.id, "bank-uploads"],
    enabled: !!currentCompany?.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to manage bank statements.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Bank Statements"
        description="Upload and process bank statement files for transaction reconciliation"
        showActions={false}
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Statement Uploads</h2>
            <p className="text-sm text-gray-600">Upload CSV, OFX, or QIF bank statement files</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Statement
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading bank statement uploads...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No bank statements uploaded yet</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Statement
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Total Rows</TableHead>
                  <TableHead>Processed Rows</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">{upload.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.fileFormat}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(upload.uploadDate!)}</TableCell>
                    <TableCell>{upload.totalRows || 0}</TableCell>
                    <TableCell>{upload.processedRows || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(upload.status)}
                        <Badge className={getStatusColor(upload.status)}>
                          {upload.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <BankUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
