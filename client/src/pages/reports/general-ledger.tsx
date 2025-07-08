import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";

export default function GeneralLedger() {
  const { currentCompany } = useCurrentCompany();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: generalLedger = [], isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "general-ledger", startDate, endDate],
    enabled: !!currentCompany?.id,
  });

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view the general ledger.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="General Ledger"
        description="Detailed record of all financial transactions"
        showActions={false}
      />
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading general ledger...</p>
            </div>
          ) : generalLedger.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No ledger entries found for the selected period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Transaction #</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalLedger.map((entry: any, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(entry.entryDate)}</TableCell>
                    <TableCell className="font-mono">{entry.accountCode}</TableCell>
                    <TableCell>{entry.accountName}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="font-mono">{entry.transactionNumber}</TableCell>
                    <TableCell className="text-right">
                      {entry.debitAmount ? formatCurrency(Number(entry.debitAmount)) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.creditAmount ? formatCurrency(Number(entry.creditAmount)) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
