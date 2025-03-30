
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { id } from 'date-fns/locale'; 
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, Download } from "lucide-react";
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
  
  // Filter state (month or year)
  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
  
  // Month and year state
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(format(new Date(), 'yyyy'));
  
  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    if (filterType === 'month') {
      const firstDayOfMonth = startOfMonth(new Date(`${selectedYear}-${selectedMonth}-01`));
      const lastDayOfMonth = endOfMonth(firstDayOfMonth);
      return { from: firstDayOfMonth, to: lastDayOfMonth };
    } else {
      const firstDayOfYear = startOfYear(new Date(`${selectedYear}-01-01`));
      const lastDayOfYear = endOfYear(firstDayOfYear);
      return { from: firstDayOfYear, to: lastDayOfYear };
    }
  }, [filterType, selectedMonth, selectedYear]);
  
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
  
  // Available years and months for selection
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  }, []);
  
  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];
  
  // Filter data by date range
  useEffect(() => {
    // Skip if still loading
    if (isLoadingIncome || isLoadingExpenses) return;
    
    // Filter income in date range
    const filteredIncomes = incomes.filter(income => 
      isWithinInterval(new Date(income.date), { 
        start: dateRange.from, 
        end: dateRange.to 
      })
    ).map(income => ({
      ...income,
      transactionType: 'income' as const
    }));
    
    // Filter expenses in date range
    const filteredExpenses = expenses.filter(expense => 
      isWithinInterval(new Date(expense.date), { 
        start: dateRange.from, 
        end: dateRange.to 
      })
    ).map(expense => ({
      ...expense,
      transactionType: 'expense' as const
    }));
    
    // Combine and prepare data for chart
    if (filterType === 'month') {
      // Group by day for monthly view
      const dailyData: Record<string, { Pendapatan: number, Pengeluaran: number, Saldo: number }> = {};
      
      // Initialize all days of the month
      const daysInMonth = Array.from(
        { length: dateRange.to.getDate() },
        (_, i) => format(new Date(selectedYear, parseInt(selectedMonth) - 1, i + 1), 'dd')
      );
      
      daysInMonth.forEach(day => {
        dailyData[day] = { Pendapatan: 0, Pengeluaran: 0, Saldo: 0 };
      });
      
      // Aggregate income by day
      filteredIncomes.forEach(income => {
        const day = format(new Date(income.date), 'dd');
        if (dailyData[day]) {
          dailyData[day].Pendapatan += income.amount;
        }
      });
      
      // Aggregate expenses by day
      filteredExpenses.forEach(expense => {
        const day = format(new Date(expense.date), 'dd');
        if (dailyData[day]) {
          dailyData[day].Pengeluaran += expense.amount;
        }
      });
      
      // Calculate running balance
      let balance = 0;
      const chartDataArray = Object.entries(dailyData)
        .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
        .map(([day, data]) => {
          balance += data.Pendapatan - data.Pengeluaran;
          return {
            name: day,
            Pendapatan: data.Pendapatan,
            Pengeluaran: data.Pengeluaran,
            Saldo: balance
          };
        });
      
      setChartData(chartDataArray);
    } else {
      // Group by month for yearly view
      const monthlyData: Record<string, { Pendapatan: number, Pengeluaran: number, Saldo: number }> = {};
      
      // Initialize all months
      months.forEach(month => {
        monthlyData[month.label] = { Pendapatan: 0, Pengeluaran: 0, Saldo: 0 };
      });
      
      // Aggregate income by month
      filteredIncomes.forEach(income => {
        const monthIndex = new Date(income.date).getMonth();
        const monthName = months[monthIndex].label;
        if (monthlyData[monthName]) {
          monthlyData[monthName].Pendapatan += income.amount;
        }
      });
      
      // Aggregate expenses by month
      filteredExpenses.forEach(expense => {
        const monthIndex = new Date(expense.date).getMonth();
        const monthName = months[monthIndex].label;
        if (monthlyData[monthName]) {
          monthlyData[monthName].Pengeluaran += expense.amount;
        }
      });
      
      // Calculate running balance
      let balance = 0;
      const chartDataArray = Object.entries(monthlyData)
        .map(([month, data]) => {
          balance += data.Pendapatan - data.Pengeluaran;
          return {
            name: month,
            Pendapatan: data.Pendapatan,
            Pengeluaran: data.Pengeluaran,
            Saldo: balance
          };
        });
      
      setChartData(chartDataArray);
    }
    
    // Set combined data for table
    const combinedTransactions = [...filteredIncomes, ...filteredExpenses];
    setTransactions(combinedTransactions);
    
  }, [incomes, expenses, dateRange, isLoadingIncome, isLoadingExpenses, filterType, selectedMonth, selectedYear, months]);
  
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
    const fileName = filterType === 'month' 
      ? `laporan_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}.csv`
      : `laporan_tahun_${selectedYear}.csv`;
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

  // Calculate totals for statistics
  const totalIncome = transactions
    .filter(t => 'transactionType' in t && t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => 'transactionType' in t && t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const periodText = filterType === 'month' 
    ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    : `Tahun ${selectedYear}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-gray-600">Lihat laporan keuangan usaha Anda</p>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <span className="text-sm font-medium">Tampilkan:</span>
          <Select 
            value={filterType}
            onValueChange={(value) => setFilterType(value as 'month' | 'year')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih tampilan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Bulanan</SelectItem>
              <SelectItem value="year">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType === 'month' ? (
            <>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
      
      {/* Chart Section - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grafik Pendapatan dan Pengeluaran</CardTitle>
          <CardDescription>
            Periode: {periodText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
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
      
      {/* Statistics Section - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistik Keuangan</CardTitle>
          <CardDescription>
            Rangkuman statistik keuangan pada periode {periodText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-700">
                Rp {totalIncome.toLocaleString('id-ID')}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-800">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-700">
                Rp {totalExpense.toLocaleString('id-ID')}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Saldo</p>
              <p className="text-2xl font-bold text-blue-700">
                Rp {balance.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-gray-700">
                {totalTransactions}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-800">Periode</p>
              <p className="text-lg font-medium text-gray-700">
                {periodText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions Table - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaksi Detail</CardTitle>
          <CardDescription>
            Daftar seluruh transaksi pada periode {periodText}
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
