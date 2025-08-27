import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { formatCurrency, formatDate } from "@/lib/accounting-utils";

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

  const { data: customerStatementsData, isLoading: loadingCustomers } = useQuery<CustomerStatementsResponse>({
    queryKey: [`/api/companies/${currentCompany?.id}/customer-statements`],
    enabled: !!currentCompany?.id,
  });

  const customers = customerStatementsData?.customers || [];
  
  // Debug logging to see customer data
  console.log('All customers data:', customers);
  
  // Split customers into receivables (positive balance) and payables (negative balance)
  const receivableCustomers = customers.filter(customer => customer.totalBalance > 0);
  const payableCustomers = customers.filter(customer => customer.totalBalance < 0);
  
  console.log('Receivable customers:', receivableCustomers);
  console.log('Payable customers:', payableCustomers);
  
  const totalReceivables = receivableCustomers.reduce((sum, customer) => sum + customer.totalBalance, 0);
  const totalPayables = Math.abs(payableCustomers.reduce((sum, customer) => sum + customer.totalBalance, 0));

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
                {receivableCustomers.length}
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
                {payableCustomers.length}
              </div>
            </CardContent>
          </Card>
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
                        <TableHead>Contact</TableHead>
                        <TableHead>Payment Terms</TableHead>
                        <TableHead>Total Invoiced</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Outstanding Balance</TableHead>
                        <TableHead>Last Invoice Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivableCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{customer.email}</div>
                              <div className="text-gray-500">{customer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.paymentTerms}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(customer.totalInvoiced)}</TableCell>
                          <TableCell>{formatCurrency(customer.paidAmount)}</TableCell>
                          <TableCell>
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
                        <TableHead>Contact</TableHead>
                        <TableHead>Payment Terms</TableHead>
                        <TableHead>Total Invoiced</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Outstanding Balance</TableHead>
                        <TableHead>Last Invoice Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payableCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{customer.email}</div>
                              <div className="text-gray-500">{customer.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.paymentTerms}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(customer.totalInvoiced)}</TableCell>
                          <TableCell>{formatCurrency(customer.paidAmount)}</TableCell>
                          <TableCell>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
