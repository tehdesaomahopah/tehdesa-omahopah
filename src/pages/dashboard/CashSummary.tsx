
import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, CalendarIcon } from "lucide-react";
import { useCashData } from "@/hooks/cash/useCashData";
import { useBusinessResolver } from "@/hooks/business/useBusinessResolver";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CashSummary = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { business, isLoading: isLoadingBusiness } = useBusinessResolver(businessId);
  const isMobile = useIsMobile();
  
  // Custom date range filter
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(1)), // First day of current month
    to: new Date(), // Today
  });

  const {
    isLoading: isLoadingCashData,
    error,
    totalIncome,
    totalExpense,
    balance,
    incomeByType,
    expenseByType,
    recentTransactions
  } = useCashData(businessId, dateRange.from, dateRange.to);

  const isLoading = isLoadingBusiness || isLoadingCashData;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Memuat data kas...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  const isPositiveBalance = balance >= 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">KasKu</h1>
        <p className="text-gray-600">Ringkasan kas untuk usaha {business?.name || businessId}</p>
      </div>

      {/* Summary Cards with full width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full">
        <Card className="border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={isPositiveBalance ? "border-blue-100" : "border-red-100"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <p className={`text-2xl font-bold ${isPositiveBalance ? "text-blue-600" : "text-red-600"}`}>
                  Rp {balance.toLocaleString('id-ID')}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isPositiveBalance ? "bg-blue-100" : "bg-red-100"}`}>
                <Wallet className={`h-6 w-6 ${isPositiveBalance ? "text-blue-600" : "text-red-600"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-8 w-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle>Filter Periode</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, "dd MMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span>-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.to, "dd MMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <CardDescription>
            Periode {format(dateRange.from, "d MMMM")} - {format(dateRange.to, "d MMMM yyyy")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Income Category Table - Full Width */}
      <Card className="mb-8 w-full">
        <CardHeader>
          <CardTitle>Pendapatan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(incomeByType).map(([type, amount]) => (
                <TableRow key={type}>
                  <TableCell className="font-medium">{type}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    Rp {amount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(incomeByType).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                    Tidak ada data pendapatan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Category Table - Full Width */}
      <Card className="mb-8 w-full">
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(expenseByType).map(([type, amount]) => (
                <TableRow key={type}>
                  <TableCell className="font-medium">{type}</TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    Rp {amount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(expenseByType).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                    Tidak ada data pengeluaran.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions - Full Width */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>5 transaksi terakhir pada periode ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(transaction.date, "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className={`text-right ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'} font-medium`}>
                    {transaction.transactionType === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {recentTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                    Tidak ada transaksi pada periode ini.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CashSummary;
