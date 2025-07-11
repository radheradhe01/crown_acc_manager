import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  FileText,
  CreditCard
} from "lucide-react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { format } from "date-fns";

interface CustomerStatement {
  id: number;
  name: string;
  email: string;
  phone: string;
  paymentTerms: string;
  openingBalance: number;
  receivableAmount: number;
  paidAmount: number;
  totalInvoiced: number;
  invoiceCount: number;
  outstandingBalance: number;
  totalBalance: number;
  lastInvoiceDate: string;
}

interface CustomerStatementsResponse {
  customers: CustomerStatement[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface CustomerStatementLine {
  id: number;
  lineDate: string;
  lineType: string;
  description: string;
  revenue: number;
  cost: number;
  nettingBalance: number;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  referenceNumber: string;
}

interface CustomerStatementSummary {
  openingBalance: number;
  totalRevenue: number;
  totalCost: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
  lines: CustomerStatementLine[];
}

export default function CustomerStatements() {
  const { currentCompany } = useCurrentCompany();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStatement | null>(null);

  const { data: statementsData, isLoading, error } = useQuery<CustomerStatementsResponse>({
    queryKey: [`/api/companies/${currentCompany?.id}/customer-statements`, currentPage, pageSize],
    enabled: !!currentCompany?.id,
  });

  // Get detailed customer statement lines for selected customer
  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery<CustomerStatementSummary>({
    queryKey: [`/api/companies/${currentCompany?.id}/customers/${selectedCustomer?.id}/statement-summary`],
    enabled: !!currentCompany?.id && !!selectedCustomer?.id,
  });

  const filteredCustomers = statementsData?.customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalReceivables = filteredCustomers.reduce((sum, customer) => sum + customer.receivableAmount, 0);
  const totalPaid = filteredCustomers.reduce((sum, customer) => sum + customer.paidAmount, 0);
  const totalOutstanding = filteredCustomers.reduce((sum, customer) => sum + customer.outstandingBalance, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="w-4 h-4" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  const handleCustomerSelect = (customer: CustomerStatement) => {
    setSelectedCustomer(customer);
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
  };

  const getLineTypeIcon = (lineType: string) => {
    switch (lineType) {
      case 'REVENUE':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'COST':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'BANK_TRANSACTION':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLineTypeColor = (lineType: string) => {
    switch (lineType) {
      case 'REVENUE':
        return 'bg-green-100 text-green-800';
      case 'COST':
        return 'bg-red-100 text-red-800';
      case 'BANK_TRANSACTION':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Statements</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !statementsData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error loading customer statements. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If a customer is selected, show detailed view
  if (selectedCustomer) {
    return (
      <div className="p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Customer List
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
              <p className="text-gray-600">Statement of Account</p>
            </div>
          </div>
        </div>

        {/* Customer Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opening Balance</p>
                  <p className="text-xl font-bold">
                    ${customerDetails?.openingBalance.toLocaleString() || selectedCustomer.openingBalance.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    ${customerDetails?.totalRevenue.toLocaleString() || selectedCustomer.receivableAmount.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-xl font-bold text-red-600">
                    ${customerDetails?.totalCost.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Closing Balance</p>
                  <p className={`text-xl font-bold ${getBalanceColor(customerDetails?.closingBalance || selectedCustomer.totalBalance)}`}>
                    ${customerDetails?.closingBalance.toLocaleString() || selectedCustomer.totalBalance.toLocaleString()}
                  </p>
                </div>
                {getBalanceIcon(customerDetails?.closingBalance || selectedCustomer.totalBalance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Netting</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerDetails?.lines?.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{format(new Date(line.lineDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getLineTypeColor(line.lineType)}>
                            <div className="flex items-center gap-1">
                              {getLineTypeIcon(line.lineType)}
                              {line.lineType.replace('_', ' ')}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{line.description}</TableCell>
                        <TableCell className="text-right">
                          {line.revenue > 0 && (
                            <span className="text-green-600">${line.revenue.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.cost > 0 && (
                            <span className="text-red-600">${line.cost.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.nettingBalance !== 0 && (
                            <span className={getBalanceColor(line.nettingBalance)}>
                              ${line.nettingBalance.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.debitAmount > 0 && (
                            <span className="text-red-600">${line.debitAmount.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.creditAmount > 0 && (
                            <span className="text-green-600">${line.creditAmount.toLocaleString()}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${getBalanceColor(line.runningBalance)}`}>
                            ${line.runningBalance.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Statements</h1>
        <Badge variant="outline" className="px-3 py-1">
          {statementsData.totalCount} Total Customers
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receivables</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalReceivables.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalPaid.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${totalOutstanding.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-3 py-2 border rounded-md"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Customer Statements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-right">Receivables</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Total Balance</TableHead>
                  <TableHead>Last Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <TableCell>
                      <div className="font-medium text-blue-600 hover:text-blue-800">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-32">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.paymentTerms}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getBalanceIcon(customer.receivableAmount)}
                        <span className={getBalanceColor(customer.receivableAmount)}>
                          ${customer.receivableAmount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-blue-600">
                        ${customer.paidAmount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getBalanceIcon(customer.outstandingBalance)}
                        <span className={getBalanceColor(customer.outstandingBalance)}>
                          ${customer.outstandingBalance.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getBalanceIcon(customer.totalBalance)}
                        <span className={`font-semibold ${getBalanceColor(customer.totalBalance)}`}>
                          ${customer.totalBalance.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.lastInvoiceDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(customer.lastInvoiceDate), 'MMM dd, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No invoices</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found matching your search.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((statementsData.currentPage - 1) * pageSize) + 1} to {Math.min(statementsData.currentPage * pageSize, statementsData.totalCount)} of {statementsData.totalCount} customers
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(statementsData.currentPage - 1)}
                disabled={statementsData.currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, statementsData.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === statementsData.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(statementsData.currentPage + 1)}
                disabled={statementsData.currentPage >= statementsData.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}