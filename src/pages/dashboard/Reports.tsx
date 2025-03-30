
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format, isAfter, isBefore } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart } from "@/components/ui/charts";
import { useIncomeData } from "@/hooks/income/useIncomeData";
import { useExpenseData } from "@/hooks/expense/useExpenseData";
import { useToast } from "@/hooks/use-toast";
import { Expense, Income } from "@/types/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Reports = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { toast } = useToast();
  
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>(() => {
    const now = new Date();
    const from = new Date();
    from.setMonth(now.getMonth() - 1); // Default: last month
    return { from, to: now };
  });
  
  // Chart data
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Get income and expense data
  const { 
    incomes, 
    isLoading: isLoadingIncome 
  } = useIncomeData(businessId);
  
  const { 
    expenses, 
    isLoading: isLoadingExpenses 
  } = useExpenseData(businessId);
  
  // Table data and pagination state for transaction details
  const [transactions, setTransactions] = useState<(Income | Expense & { transactionType: 'income' | 'expense' })[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter data by date range
  useEffect(() => {
    // Skip if still loading
    if (isLoadingIncome || isLoadingExpenses) return;
    
    // Filter income in date range
    const filteredIncomes = incomes.filter(income => 
      !isBefore(new Date(income.date), dateRange.from) && 
      !isAfter(new Date(income.date), dateRange.to)
    ).map(income => ({
      ...income,
      transactionType: 'income' as const
    }));
    
    // Filter expenses in date range
    const filteredExpenses = expenses.filter(expense => 
      !isBefore(new Date(expense.date), dateRange.from) && 
      !isAfter(new Date(expense.date), dateRange.to)
    ).map(expense => ({
      ...expense,
      transactionType: 'expense' as const
    }));
    
    // Combine and prepare data for chart
    const incomesByDate = filteredIncomes.reduce((acc: Record<string, number>, income) => {
      const dateKey = format(new Date(income.date), 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + income.amount;
      return acc;
    }, {});
    
    const expensesByDate = filteredExpenses.reduce((acc: Record<string, number>, expense) => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + expense.amount;
      return acc;
    }, {});
    
    // Get all unique dates
    const allDates = [...new Set([
      ...Object.keys(incomesByDate),
      ...Object.keys(expensesByDate)
    ])].sort();
    
    // Create chart data with running balance
    let balance = 0;
    const chartData = allDates.map(date => {
      const income = incomesByDate[date] || 0;
      const expense = expensesByDate[date] || 0;
      balance += income - expense;
      
      return {
        name: format(new Date(date), 'dd/MM'),
        Pendapatan: income,
        Pengeluaran: expense,
        Saldo: balance
      };
    });
    
    setChartData(chartData);
    
    // Set combined data for table
    const combinedTransactions = [...filteredIncomes, ...filteredExpenses];
    setTransactions(combinedTransactions);
    
  }, [incomes, expenses, dateRange, isLoadingIncome, isLoadingExpenses]);
  
  // Apply sorting to transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === 'ascending' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    
    if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Calculate total transactions
  const totalTransactions = transactions.length;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle sorting
  const handleSort = (key: string) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending';
    
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Handle downloading data as CSV
  const downloadCSV = () => {
    // CSV headers
    const headers = ['Tanggal', 'Jenis Transaksi', 'Kategori', 'Deskripsi', 'Jumlah'];
    
    // Format data
    const rows = transactions.map(transaction => {
      const type = 'transactionType' in transaction && transaction.transactionType === 'income' ? 'Pendapatan' : 'Pengeluaran';
      return [
        format(new Date(transaction.date), 'dd/MM/yyyy'),
        type,
        transaction.type,
        transaction.description,
        transaction.amount.toString()
      ];
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const fileName = `laporan_${format(dateRange.from, 'dd-MM-yyyy')}_hingga_${format(dateRange.to, 'dd-MM-yyyy')}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Laporan Diunduh",
      description: `File ${fileName} berhasil diunduh.`,
    });
  };

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      setDateRange({ ...dateRange, from: date });
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      setDateRange({ ...dateRange, to: date });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-gray-600">Lihat laporan keuangan usaha Anda</p>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Rentang Waktu:</span>
          
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
                onSelect={handleFromDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <span>—</span>
          
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
                onSelect={handleToDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="ml-auto"
          onClick={downloadCSV}
        >
          <Download className="mr-2 h-4 w-4" />
          Unduh Laporan CSV
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
            <CardDescription>Grafik pendapatan dan pengeluaran dalam periode yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoadingIncome || isLoadingExpenses ? (
                <div className="flex items-center justify-center h-full">
                  <p>Memuat data...</p>
                </div>
              ) : chartData.length > 0 ? (
                <BarChart 
                  data={chartData} 
                  dataKeys={["Pendapatan", "Pengeluaran", "Saldo"]}
                  colors={["#10b981", "#ef4444", "#3b82f6"]} 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Tidak ada data dalam periode yang dipilih.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-4 gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Pendapatan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Pengeluaran</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Saldo</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
            <CardDescription>Rangkuman statistik keuangan pada periode yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isLoadingIncome || isLoadingExpenses ? (
                <div className="flex items-center justify-center h-60">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Total Pendapatan</p>
                      <p className="text-2xl font-bold text-green-700">
                        Rp {transactions
                          .filter(t => 'transactionType' in t && t.transactionType === 'income')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-red-800">Total Pengeluaran</p>
                      <p className="text-2xl font-bold text-red-700">
                        Rp {transactions
                          .filter(t => 'transactionType' in t && t.transactionType === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Saldo</p>
                    <p className="text-2xl font-bold text-blue-700">
                      Rp {(
                        transactions
                          .filter(t => 'transactionType' in t && t.transactionType === 'income')
                          .reduce((sum, t) => sum + t.amount, 0) -
                        transactions
                          .filter(t => 'transactionType' in t && t.transactionType === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0)
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">Jumlah Transaksi</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {transactions.length}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">Periode</p>
                      <p className="text-lg font-medium text-gray-700">
                        {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Laporan Transaksi Detail</CardTitle>
          <CardDescription>
            Daftar seluruh transaksi pada periode yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center">
                      Tanggal
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('transactionType')}>
                    <div className="flex items-center">
                      Jenis
                      {getSortIcon('transactionType')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center">
                      Kategori
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                    <div className="flex items-center">
                      Deskripsi
                      {getSortIcon('description')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">
                      Jumlah
                      {getSortIcon('amount')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => {
                    const isIncome = 'transactionType' in transaction && transaction.transactionType === 'income';
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(transaction.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          )}>
                            {isIncome ? "Pendapatan" : "Pengeluaran"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded text-xs font-medium",
                            transaction.type === "Omset Usaha" && "bg-green-100 text-green-800",
                            transaction.type === "Konsinyasi Usaha" && "bg-blue-100 text-blue-800",
                            transaction.type === "Belanja Bahan" && "bg-amber-100 text-amber-800",
                            transaction.type === "Upah Pegawai" && "bg-blue-100 text-blue-800",
                            transaction.type === "Marketing" && "bg-purple-100 text-purple-800",
                            transaction.type === "Maintenance" && "bg-cyan-100 text-cyan-800",
                            transaction.type === "Bagi Hasil" && "bg-pink-100 text-pink-800",
                            transaction.type === "Iuran" && "bg-indigo-100 text-indigo-800",
                            transaction.type === "Lainnya" && "bg-gray-100 text-gray-800"
                          )}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={isIncome ? "text-green-600" : "text-red-600"}>
                            {isIncome ? "+ " : "- "}
                            Rp {transaction.amount.toLocaleString('id-ID')}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Tidak ada transaksi dalam periode yang dipilih.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first page, current page, last page, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } 
                  // Show ellipsis
                  else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <PaginationEllipsis key={`ellipsis-${page}`} />;
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Reports;
