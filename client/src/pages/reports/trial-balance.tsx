import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency } from "@/lib/accounting-utils";

export default function TrialBalance() {
  const { currentCompany } = useCurrentCompany();
  const [asOfDate, setAsOfDate] = useState("");

  const { data: trialBalance = [], isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "trial-balance", asOfDate],
    enabled: !!currentCompany?.id,
  });

  const totalDebits = trialBalance.reduce((sum: number, account: any) => sum + Number(account.totalDebits || 0), 0);
  const totalCredits = trialBalance.reduce((sum: number, account: any) => sum + Number(account.totalCredits || 0), 0);

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view the trial balance.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Trial Balance"
        description="Summary of all ledger accounts with debit and credit balances"
        showActions={false}
      />
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">As of Date</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asOfDate">As of Date</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setAsOfDate("")}
                variant="outline"
              >
                Show All Periods
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading trial balance...</p>
            </div>
          ) : trialBalance.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No accounts found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance.map((account: any) => (
                    <TableRow key={account.accountId}>
                      <TableCell className="font-mono">{account.accountCode}</TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell>{account.accountType}</TableCell>
                      <TableCell className="text-right">
                        {account.totalDebits ? formatCurrency(Number(account.totalDebits)) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {account.totalCredits ? formatCurrency(Number(account.totalCredits)) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalDebits)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalCredits)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalDebits - totalCredits)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              {Math.abs(totalDebits - totalCredits) > 0.01 && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <p className="text-red-800 font-medium">
                    ⚠️ Trial Balance is out of balance! 
                    Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
