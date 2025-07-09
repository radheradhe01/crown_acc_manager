import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, FileText, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import type { Customer, CustomerStatementLine } from "@shared/schema";

export default function CustomerStatement() {
  const { currentCompany } = useCurrentCompany();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: customers } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "customers"],
    enabled: !!currentCompany?.id,
  });

  const { data: statementSummary, isLoading } = useQuery({
    queryKey: ["/api/companies", currentCompany?.id, "customers", selectedCustomerId, "statement-summary"],
    enabled: !!currentCompany?.id && !!selectedCustomerId,
  });

  const getLineTypeIcon = (lineType: string) => {
    switch (lineType) {
      case "REVENUE":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "BANK_DEBIT":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "BANK_CREDIT":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLineTypeBadge = (lineType: string) => {
    switch (lineType) {
      case "REVENUE":
        return <Badge variant="default">Revenue</Badge>;
      case "BANK_DEBIT":
        return <Badge variant="destructive">Bank Debit</Badge>;
      case "BANK_CREDIT":
        return <Badge variant="secondary">Bank Credit</Badge>;
      default:
        return <Badge variant="outline">{lineType}</Badge>;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (!currentCompany) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Customer Statement</h1>
          <p className="text-muted-foreground">Please select a company to view customer statements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Statement</h1>
          <p className="text-muted-foreground">
            View detailed statement of account for customers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Statement Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer: Customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  // Refresh statement with filters
                  // This will be handled by the query key change
                }}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Statement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Summary */}
      {selectedCustomerId && statementSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(statementSummary.openingBalance)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(statementSummary.totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(statementSummary.totalCost)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(statementSummary.totalDebits)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(statementSummary.totalCredits)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  statementSummary.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(statementSummary.closingBalance)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statement Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Statement Lines</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading statement...</div>
              ) : !statementSummary.lines || statementSummary.lines.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No statement lines found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload revenue data or bank statements to see entries
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Cost</th>
                        <th className="text-right p-2">Netting</th>
                        <th className="text-right p-2">Debit</th>
                        <th className="text-right p-2">Credit</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementSummary.lines.map((line: CustomerStatementLine) => (
                        <tr key={line.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {format(new Date(line.lineDate), "MMM d, yyyy")}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              {getLineTypeIcon(line.lineType)}
                              <span className="ml-2">{getLineTypeBadge(line.lineType)}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{line.description}</span>
                          </td>
                          <td className="p-2 text-right">
                            {line.revenue !== "0.00" ? (
                              <span className="text-green-600 font-medium">
                                {formatCurrency(line.revenue)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {line.cost !== "0.00" ? (
                              <span className="text-red-600 font-medium">
                                {formatCurrency(line.cost)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {line.nettingBalance !== "0.00" ? (
                              <span className={`font-medium ${
                                parseFloat(line.nettingBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(line.nettingBalance)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {line.debitAmount !== "0.00" ? (
                              <span className="text-red-600 font-medium">
                                {formatCurrency(line.debitAmount)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            {line.creditAmount !== "0.00" ? (
                              <span className="text-blue-600 font-medium">
                                {formatCurrency(line.creditAmount)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <span className={`font-bold ${
                              parseFloat(line.runningBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(line.runningBalance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* No Customer Selected */}
      {!selectedCustomerId && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please select a customer to view their statement</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}