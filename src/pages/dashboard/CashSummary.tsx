
import { useState, useMemo } from "react";
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <CardTitle>Ringkasan Kas</CardTitle>
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
                        className="p-3 pointer-events-auto"
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
                        className="p-3 pointer-events-auto"
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
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Pendapatan per Kategori</h3>
                <div className="space-y-3">
                  {Object.entries(incomeByType).map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">{type}</span>
                      <span className="text-green-600 font-medium">
                        Rp {amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                  {Object.keys(incomeByType).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Tidak ada data pendapatan.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Pengeluaran per Kategori</h3>
                <div className="space-y-3">
                  {Object.entries(expenseByType).map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">{type}</span>
                      <span className="text-red-600 font-medium">
                        Rp {amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                  {Object.keys(expenseByType).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Tidak ada data pengeluaran.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi terakhir pada periode ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center">
                      {transaction.transactionType === 'income' ? (
                        <ArrowUpCircle className="w-8 h-8 mr-3 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="w-8 h-8 mr-3 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="text-xs text-gray-500">
                          {format(transaction.date, "dd MMM yyyy")} · {transaction.type}
                        </div>
                      </div>
                    </div>
                    <div className={transaction.transactionType === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {transaction.transactionType === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">Tidak ada transaksi pada periode ini.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CashSummary;
