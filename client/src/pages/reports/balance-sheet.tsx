import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Building, CreditCard, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";

export default function BalanceSheet() {
  const { currentCompany } = useCurrentCompany();
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState<'specific' | 'all'>('specific');

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "reports", "balance-sheet", dateFilter, asOfDate],
    queryFn: async () => {
      const queryParams = dateFilter === 'all' ? '' : `?asOfDate=${asOfDate}`;
      const response = await fetch(`/api/companies/${currentCompany?.id}/reports/balance-sheet${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance sheet report');
      }
      return response.json();
    },
    enabled: !!currentCompany?.id,
  });

  const handleExportToPDF = () => {
    // This would implement PDF export functionality
    console.log('Exporting balance sheet report to PDF');
  };

  if (!currentCompany) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a company to view the Balance Sheet report.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error loading balance sheet report. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Balance Sheet</h1>
          <p className="text-gray-600">{currentCompany.name}</p>
        </div>
        <Button onClick={handleExportToPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            As Of Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <div>
              <Label htmlFor="dateFilter">Date Filter</Label>
              <Select value={dateFilter} onValueChange={(value: 'specific' | 'all') => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific">Specific Date</SelectItem>
                  <SelectItem value="all">All Dates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateFilter === 'specific' && (
              <div>
                <Label htmlFor="asOfDate">Report Date</Label>
                <Input
                  id="asOfDate"
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet Report */}
      {report && (
        <>
          {/* Show note if all balances are zero */}
          {(report.assets.total === 0 && report.liabilities.total === 0 && report.equity.total === 0) && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <Building className="h-5 w-5" />
                  <span className="font-medium">Balance Sheet Information</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  This balance sheet shows zero balances because there are no journal entries in the system yet. 
                  Journal entries are created when you process transactions, invoices, or bills through the accounting system.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Building className="h-5 w-5" />
                Assets
              </CardTitle>
              <p className="text-sm text-gray-600">
                {dateFilter === 'all' ? 'All Dates' : `As of ${formatDate(report.asOfDate)}`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.assets.accounts.map((account: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">{account.accountName}</span>
                      <div className="text-sm text-gray-500">{account.accountType}</div>
                    </div>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total Assets</span>
                    <span className="text-blue-600">
                      {formatCurrency(report.assets.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities & Equity */}
          <div className="space-y-6">
            {/* Liabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <CreditCard className="h-5 w-5" />
                  Liabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.liabilities.accounts.map((account: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium">{account.accountName}</span>
                        <div className="text-sm text-gray-500">{account.accountType}</div>
                      </div>
                      <span className="font-medium text-red-600">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Liabilities</span>
                      <span className="text-red-600">
                        {formatCurrency(report.liabilities.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <PiggyBank className="h-5 w-5" />
                  Equity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.equity.accounts.map((account: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-medium">{account.accountName}</span>
                        <div className="text-sm text-gray-500">{account.accountType}</div>
                      </div>
                      <span className="font-medium text-green-600">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Equity</span>
                      <span className="text-green-600">
                        {formatCurrency(report.equity.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Balance Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Assets</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(report.assets.total)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Liabilities</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(report.liabilities.total)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Equity</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.equity.total)}
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Balance Check:</span>
                <span className={`font-bold ${
                  Math.abs(report.assets.total - report.totalLiabilitiesAndEquity) < 0.01 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {Math.abs(report.assets.total - report.totalLiabilitiesAndEquity) < 0.01 
                    ? '✓ Balanced' 
                    : '✗ Not Balanced'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Assets should equal Liabilities + Equity
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}