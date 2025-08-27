import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, DollarSign, Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";
import { exportOutstandingBalances, exportCustomerStatements } from "@/lib/excel-export";

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

export default function OutstandingBalances() {
  const { currentCompany } = useCurrentCompany();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("balance-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: customerStatementsData, isLoading: loadingCustomers } = useQuery<CustomerStatementsResponse>({
    queryKey: [`/api/companies/${currentCompany?.id}/customer-statements`],
    enabled: !!currentCompany?.id,
  });

  const customers = customerStatementsData?.customers || [];
  
  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filteredCustomers = customers;
    
    // Apply search filter
    if (searchTerm) {
      filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    return [...filteredCustomers].sort((a, b) => {
      switch (sortBy) {
        case 'balance-desc':
          return Math.abs(b.totalBalance) - Math.abs(a.totalBalance);
        case 'balance-asc':
          return Math.abs(a.totalBalance) - Math.abs(b.totalBalance);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return Math.abs(b.totalBalance) - Math.abs(a.totalBalance);
      }
    });
  }, [customers, searchTerm, sortBy]);
  
  // Split customers into receivables (positive balance) and payables (negative balance)
  const allReceivableCustomers = filteredAndSortedCustomers.filter(customer => customer.totalBalance > 0);
  const allPayableCustomers = filteredAndSortedCustomers.filter(customer => customer.totalBalance < 0);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const receivableCustomers = allReceivableCustomers.slice(startIndex, endIndex);
  const payableCustomers = allPayableCustomers.slice(startIndex, endIndex);
  
  const receivablesTotalPages = Math.ceil(allReceivableCustomers.length / pageSize);
  const payablesTotalPages = Math.ceil(allPayableCustomers.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const totalReceivables = allReceivableCustomers.reduce((sum, customer) => sum + customer.totalBalance, 0);
  const totalPayables = Math.abs(allPayableCustomers.reduce((sum, customer) => sum + customer.totalBalance, 0));

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
        description="Customer receivables and payables from customer statements"
        showActions={false}
      />
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                Total Receivables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalReceivables)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                Total Payables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPayables)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                Customers w/ Receivables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {allReceivableCustomers.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                Customers w/ Payables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {allPayableCustomers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => exportOutstandingBalances(allReceivableCustomers)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Receivables
          </Button>
          
          <Button
            variant="outline"
            onClick={() => exportCustomerStatements(customers)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export All Customers
          </Button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md min-w-[180px]"
          >
            <option value="balance-desc">Highest Balance First</option>
            <option value="balance-asc">Lowest Balance First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <Tabs defaultValue="receivables" className="w-full">
          <TabsList>
            <TabsTrigger value="receivables">Customer Receivables</TabsTrigger>
            <TabsTrigger value="payables">Customer Payables</TabsTrigger>
          </TabsList>
          
          <TabsContent value="receivables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Customer Receivables (Money Owed to You)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCustomers ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Loading customer statements...</p>
                  </div>
                ) : receivableCustomers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No customer receivables found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead className="text-right">Outstanding Balance</TableHead>
                        <TableHead>Last Invoice Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivableCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(customer.totalBalance)}
                            </span>
                          </TableCell>
                          <TableCell>{customer.lastInvoiceDate ? formatDate(customer.lastInvoiceDate) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Receivables Pagination */}
                {receivableCustomers.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, allReceivableCustomers.length)} of {allReceivableCustomers.length} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, receivablesTotalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= receivablesTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                  Customer Payables (Money You Owe)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCustomers ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">Loading customer statements...</p>
                  </div>
                ) : payableCustomers.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500">No customer payables found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead className="text-right">Outstanding Balance</TableHead>
                        <TableHead>Last Invoice Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payableCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-red-600">
                              {formatCurrency(Math.abs(customer.totalBalance))}
                            </span>
                          </TableCell>
                          <TableCell>{customer.lastInvoiceDate ? formatDate(customer.lastInvoiceDate) : 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Payables Pagination */}
                {payableCustomers.length > 0 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, allPayableCustomers.length)} of {allPayableCustomers.length} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, payablesTotalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= payablesTotalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
