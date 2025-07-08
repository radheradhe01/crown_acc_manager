import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency } from "@/lib/accounting-utils";

export default function ExpenseCategories() {
  const { currentCompany } = useCurrentCompany();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: expenseReport = [], isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "expense-category-report", startDate, endDate],
    enabled: !!currentCompany?.id,
  });

  const totalExpenses = expenseReport.reduce((sum: number, category: any) => sum + Number(category.totalAmount || 0), 0);

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Company Selected</h2>
          <p className="text-gray-600">Please select a company to view expense categories.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Expense Categories"
        description="Breakdown of expenses by category"
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
              <p className="text-gray-500">Loading expense categories...</p>
            </div>
          ) : expenseReport.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No expense data found for the selected period</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Transaction Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseReport.map((category: any) => {
                    const percentage = totalExpenses > 0 ? (Number(category.totalAmount) / totalExpenses) * 100 : 0;
                    
                    return (
                      <TableRow key={category.categoryId}>
                        <TableCell className="font-medium">{category.categoryName}</TableCell>
                        <TableCell className="text-right">{category.transactionCount}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(category.totalAmount))}
                        </TableCell>
                        <TableCell className="text-right">
                          {percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {expenseReport.reduce((sum: number, cat: any) => sum + Number(cat.transactionCount || 0), 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalExpenses)}
                    </TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
