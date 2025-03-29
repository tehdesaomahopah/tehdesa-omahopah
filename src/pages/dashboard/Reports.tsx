import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarIcon, FileDown, Loader2 } from "lucide-react";
import { format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getBusinesses, getIncomesByDateRange, getExpensesByDateRange } from "@/services/businessService";
import { Business, Income, Expense } from "@/types/supabase";
import { useIsMobile } from "@/hooks/use-mobile";

const FinancialReports = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  const { data: businesses = [], isLoading: isLoadingBusinesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses
  });
  
  const businessOptions = [
    { id: "all", name: "Semua Usaha" },
    ...businesses
  ];
  
  const { 
    data: incomes = [], 
    isLoading: isLoadingIncomes 
  } = useQuery({
    queryKey: ['incomes', selectedBusiness, dateRange.from, dateRange.to],
    queryFn: () => getIncomesByDateRange(dateRange.from, dateRange.to, selectedBusiness),
    enabled: businessOptions.length > 1
  });
  
  const { 
    data: expenses = [], 
    isLoading: isLoadingExpenses 
  } = useQuery({
    queryKey: ['expenses', selectedBusiness, dateRange.from, dateRange.to],
    queryFn: () => getExpensesByDateRange(dateRange.from, dateRange.to, selectedBusiness),
    enabled: businessOptions.length > 1
  });
  
  const isLoading = isLoadingBusinesses || isLoadingIncomes || isLoadingExpenses;
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;
  
  const chartData = [
    { name: "Pendapatan", amount: totalIncome },
    { name: "Pengeluaran", amount: totalExpense },
    { name: "Saldo", amount: balance },
  ];
  
  const incomeByBusiness: Record<string, number> = {};
  const expenseByBusiness: Record<string, number> = {};
  
  incomes.forEach((income) => {
    if (!incomeByBusiness[income.businessId]) {
      incomeByBusiness[income.businessId] = 0;
    }
    incomeByBusiness[income.businessId] += income.amount;
  });
  
  expenses.forEach((expense) => {
    if (!expenseByBusiness[expense.businessId]) {
      expenseByBusiness[expense.businessId] = 0;
    }
    expenseByBusiness[expense.businessId] += expense.amount;
  });
  
  const businessSummary = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    income: incomeByBusiness[business.id] || 0,
    expense: expenseByBusiness[business.id] || 0,
    balance: (incomeByBusiness[business.id] || 0) - (expenseByBusiness[business.id] || 0),
  }));
  
  const handleDownloadReport = () => {
    const reportData = [
      ...incomes.map(income => ({
        date: format(income.date, "yyyy-MM-dd"),
        business: businesses.find(b => b.id === income.businessId)?.name || 'Unknown',
        type: 'Income',
        category: income.type,
        description: income.description,
        amount: income.amount
      })),
      ...expenses.map(expense => ({
        date: format(expense.date, "yyyy-MM-dd"),
        business: businesses.find(b => b.id === expense.businessId)?.name || 'Unknown',
        type: 'Expense',
        category: expense.type,
        description: expense.description,
        amount: -expense.amount
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const headers = ['Date', 'Business', 'Type', 'Category', 'Description', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...reportData.map(row => [
        row.date,
        `"${row.business}"`,
        row.type,
        `"${row.category}"`,
        `"${row.description}"`,
        row.amount
      ].join(','))
    ];
    const csvContent = csvRows.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `financial-report-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Laporan Diunduh",
      description: `File ${fileName} berhasil diunduh.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-gray-600">Analisis dan ringkasan keuangan usaha Anda</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Filter Laporan</CardTitle>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownloadReport}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              <span>Unduh Laporan</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usaha</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                disabled={isLoadingBusinesses}
              >
                {businessOptions.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      format(dateRange.from, "PPP")
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      format(dateRange.to, "PPP")
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
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
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <span className="ml-2 text-xl text-gray-600">Memuat data...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Keuangan</CardTitle>
              <CardDescription>
                Periode {format(dateRange.from, "d MMMM yyyy")} - {format(dateRange.to, "d MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {totalIncome.toLocaleString('id-ID')}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                  <p className="text-xl font-bold text-red-600">
                    Rp {totalExpense.toLocaleString('id-ID')}
                  </p>
                </div>
                
                <div className={`text-center p-3 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    Rp {balance.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan per Usaha</CardTitle>
              <CardDescription>Performa masing-masing usaha</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usaha</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                      <TableHead className="text-right">Pengeluaran</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessSummary.length > 0 ? (
                      businessSummary.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell className="text-right text-green-600">
                            Rp {business.income.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            Rp {business.expense.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-medium",
                            business.balance >= 0 ? "text-blue-600" : "text-red-600"
                          )}>
                            Rp {business.balance.toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Tidak ada data usaha.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Laporan Transaksi Detail</CardTitle>
              <CardDescription>
                Total {incomes.length + expenses.length} transaksi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Usaha</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ...incomes.map(income => ({
                        ...income,
                        transactionType: 'income' as const
                      })),
                      ...expenses.map(expense => ({
                        ...expense,
                        transactionType: 'expense' as const
                      }))
                    ]
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map((transaction) => {
                        const businessName = businesses.find(b => b.id === transaction.businessId)?.name || '';
                        
                        return (
                          <TableRow key={`${transaction.transactionType}-${transaction.id}`}>
                            <TableCell>{format(transaction.date, "dd/MM/yyyy")}</TableCell>
                            <TableCell>{businessName}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-block px-2 py-1 rounded text-xs font-medium",
                                transaction.transactionType === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              )}>
                                {transaction.transactionType === "income" ? "Pendapatan" : "Pengeluaran"}
                              </span>
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell className={`text-right font-medium ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.transactionType === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {(incomes.length + expenses.length) === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          Tidak ada data transaksi untuk filter yang dipilih.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FinancialReports;
