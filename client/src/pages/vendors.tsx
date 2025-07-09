import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VendorFormModal } from "@/components/modals/vendor-form-modal";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency } from "@/lib/accounting-utils";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const { currentCompany } = useCurrentCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>();

  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: [`/api/companies/${currentCompany?.id}/vendors`],
    enabled: !!currentCompany?.id,
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendor(undefined);
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to manage vendors.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vendor List</h2>
            <p className="text-sm text-gray-600">Track and manage all your vendors</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No vendors found</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Vendor
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.contactPerson || "-"}</TableCell>
                    <TableCell>{vendor.email || "-"}</TableCell>
                    <TableCell>{vendor.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.defaultPaymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Number(vendor.openingBalance || 0))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <VendorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vendor={editingVendor}
      />
    </>
  );
}
