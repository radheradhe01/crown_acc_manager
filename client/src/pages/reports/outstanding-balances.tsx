import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate, calculateDaysOverdue, getAgingBucket } from "@/lib/accounting-utils";

export default function OutstandingBalances() {
  const { currentCompany } = useCurrentCompany();

  const { data: outstandingCustomers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "outstanding-customers"],
    enabled: !!currentCompany?.id,
  });

  const { data: outstandingVendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "dashboard", "outstanding-vendors"],
    enabled: !!currentCompany?.id,
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view outstanding balances.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Outstanding Balances"
        description="Track overdue customer payments and vendor bills"
        showActions={false}
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="customers" className="w-full">
          <TabsList>
            <TabsTrigger value="customers">Outstanding Customers</TabsTrigger>
            <TabsTrigger value="vendors">Outstanding Vendors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loadingCustomers ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading outstanding customers...</p>
                </div>
              ) : outstandingCustomers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No outstanding customer balances</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Invoice Count</TableHead>
                      <TableHead>Oldest Invoice</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Aging Bucket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingCustomers.map((customer: any) => {
                      const daysOverdue = calculateDaysOverdue(customer.oldestInvoiceDate);
                      const agingBucket = getAgingBucket(daysOverdue);
                      
                      return (
                        <TableRow key={customer.customerId}>
                          <TableCell className="font-medium">{customer.customerName}</TableCell>
                          <TableCell>{formatCurrency(customer.totalAmount)}</TableCell>
                          <TableCell>{customer.invoiceCount}</TableCell>
                          <TableCell>{formatDate(customer.oldestInvoiceDate)}</TableCell>
                          <TableCell>{daysOverdue} days</TableCell>
                          <TableCell>
                            <Badge variant={daysOverdue > 30 ? "destructive" : "outline"}>
                              {agingBucket}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loadingVendors ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Loading outstanding vendors...</p>
                </div>
              ) : outstandingVendors.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No outstanding vendor balances</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Bill Count</TableHead>
                      <TableHead>Oldest Bill</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Aging Bucket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingVendors.map((vendor: any) => {
                      const daysOverdue = calculateDaysOverdue(vendor.oldestBillDate);
                      const agingBucket = getAgingBucket(daysOverdue);
                      
                      return (
                        <TableRow key={vendor.vendorId}>
                          <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                          <TableCell>{formatCurrency(vendor.totalAmount)}</TableCell>
                          <TableCell>{vendor.billCount}</TableCell>
                          <TableCell>{formatDate(vendor.oldestBillDate)}</TableCell>
                          <TableCell>{daysOverdue} days</TableCell>
                          <TableCell>
                            <Badge variant={daysOverdue > 30 ? "destructive" : "outline"}>
                              {agingBucket}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
