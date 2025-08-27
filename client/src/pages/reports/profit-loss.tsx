import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";

export default function ProfitLoss() {
  const { currentCompany } = useCurrentCompany();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "reports", "profit-loss", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/companies/${currentCompany?.id}/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch P&L report');
      }
      return response.json();
    },
    enabled: !!currentCompany?.id,
  });

  const handleExportToPDF = () => {
    // This would implement PDF export functionality
    console.log('Exporting P&L report to PDF');
  };

  if (!currentCompany) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please select a company to view the Profit & Loss report.
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
          Error loading P&L report. Please try again.
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Profit & Loss Statement"
        description={`Financial performance report for ${currentCompany.name}`}
        showActions={false}
      />
      
      <div className="space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button onClick={handleExportToPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* P&L Report */}
      {report && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Profit & Loss Statement
              </CardTitle>
              <p className="text-sm text-gray-600">
                For the period from {formatDate(report.period.startDate)} to {formatDate(report.period.endDate)}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Section */}
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue
                  </h3>
                  <div className="pl-4 space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span>Total Revenue</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(report.revenue.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>Cost of Goods Sold</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(report.revenue.totalCost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t font-semibold">
                      <span>Gross Profit</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(report.revenue.grossProfit || (report.revenue.totalRevenue - (report.revenue.totalCost || 0)))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Expenses
                  </h3>
                  <div className="pl-4 space-y-2">
                    {report.expenses.categories.map((category: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-gray-700">{category.categoryName}</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(category.totalAmount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-2 border-t border-b font-semibold">
                      <span>Total Expenses</span>
                      <span className="text-red-600">
                        {formatCurrency(report.expenses.totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Income Section */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                    <span className="text-lg font-bold flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Net Income
                    </span>
                    <span className={`text-lg font-bold ${
                      report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(report.netIncome)}
                    </span>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.revenue.totalRevenue)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Cost of Goods</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(report.revenue.totalCost || 0)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Total Expenses</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(report.expenses.totalExpenses)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-600">Net Income</div>
                      <div className={`text-2xl font-bold ${
                        report.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(report.netIncome)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}