
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Income, Expense } from "@/types/business";
import { CalendarIcon, FileDown, Filter } from "lucide-react";
import { format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

// Dummy data for incomes and expenses (reusing from other components)
const dummyIncomes: Income[] = [
  { 
    id: "1", 
    businessId: "cijati", 
    date: new Date(2023, 5, 15), 
    type: "Omset Usaha", 
    description: "Penjualan Toko", 
    amount: 850000 
  },
  { 
    id: "2", 
    businessId: "cijati", 
    date: new Date(2023, 5, 13), 
    type: "Konsinyasi Usaha", 
    description: "Konsinyasi Toko Jaya", 
    amount: 540000 
  },
  { 
    id: "3", 
    businessId: "cijati", 
    date: new Date(2023, 5, 10), 
    type: "Omset Usaha", 
    description: "Penjualan Online", 
    amount: 320000 
  },
  { 
    id: "4", 
    businessId: "shaquilla", 
    date: new Date(2023, 5, 15), 
    type: "Omset Usaha", 
    description: "Penjualan Toko", 
    amount: 750000 
  },
  { 
    id: "5", 
    businessId: "kartini", 
    date: new Date(2023, 5, 14), 
    type: "Lainnya", 
    description: "Keuntungan Investasi", 
    amount: 250000 
  },
];

const dummyExpenses: Expense[] = [
  { 
    id: "1", 
    businessId: "cijati", 
    date: new Date(2023, 5, 14), 
    type: "Belanja Bahan", 
    description: "Pembelian teh", 
    amount: 350000 
  },
  { 
    id: "2", 
    businessId: "cijati", 
    date: new Date(2023, 5, 12), 
    type: "Upah Pegawai", 
    description: "Gaji pegawai", 
    amount: 450000 
  },
  { 
    id: "3", 
    businessId: "cijati", 
    date: new Date(2023, 5, 8), 
    type: "Marketing", 
    description: "Promosi online", 
    amount: 100000 
  },
  { 
    id: "4", 
    businessId: "shaquilla", 
    date: new Date(2023, 5, 13), 
    type: "Maintenance", 
    description: "Perbaikan mesin", 
    amount: 200000 
  },
  { 
    id: "5", 
    businessId: "kartini", 
    date: new Date(2023, 5, 11), 
    type: "Bagi Hasil", 
    description: "Pembagian hasil usaha", 
    amount: 300000 
  },
];

const businesses = [
  { id: "all", name: "Semua Usaha" },
  { id: "cijati", name: "Teh Desa Cijati" },
  { id: "shaquilla", name: "Teh Desa Shaquilla" },
  { id: "kartini", name: "Teh Desa Kartini" },
];

const FinancialReports = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  
  // Filter transactions based on selected filters
  const filteredIncomes = dummyIncomes.filter((income) => {
    const matchesBusiness = selectedBusiness === "all" || income.businessId === selectedBusiness;
    const matchesDateRange = isWithinInterval(income.date, {
      start: dateRange.from,
      end: dateRange.to,
    });
    return matchesBusiness && matchesDateRange;
  });
  
  const filteredExpenses = dummyExpenses.filter((expense) => {
    const matchesBusiness = selectedBusiness === "all" || expense.businessId === selectedBusiness;
    const matchesDateRange = isWithinInterval(expense.date, {
      start: dateRange.from,
      end: dateRange.to,
    });
    return matchesBusiness && matchesDateRange;
  });
  
  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;
  
  // Prepare data for charts
  const chartData = [
    { name: "Pendapatan", amount: totalIncome },
    { name: "Pengeluaran", amount: totalExpense },
    { name: "Saldo", amount: balance },
  ];
  
  // Group transactions by business
  const incomeByBusiness: Record<string, number> = {};
  const expenseByBusiness: Record<string, number> = {};
  
  filteredIncomes.forEach((income) => {
    if (!incomeByBusiness[income.businessId]) {
      incomeByBusiness[income.businessId] = 0;
    }
    incomeByBusiness[income.businessId] += income.amount;
  });
  
  filteredExpenses.forEach((expense) => {
    if (!expenseByBusiness[expense.businessId]) {
      expenseByBusiness[expense.businessId] = 0;
    }
    expenseByBusiness[expense.businessId] += expense.amount;
  });
  
  // Prepare data for business summary
  const businessSummary = businesses.slice(1).map((business) => ({
    id: business.id,
    name: business.name,
    income: incomeByBusiness[business.id] || 0,
    expense: expenseByBusiness[business.id] || 0,
    balance: (incomeByBusiness[business.id] || 0) - (expenseByBusiness[business.id] || 0),
  }));
  
  // Function to download report (simplified - would generate a CSV in real app)
  const handleDownloadReport = () => {
    alert("Download report functionality would be implemented here.");
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
            >
              <FileDown className="h-4 w-4" />
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
              >
                {businesses.map((business) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
            <CardDescription>
              Periode {format(dateRange.from, "d MMMM yyyy")} - {format(dateRange.to, "d MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
            
            <div className="grid grid-cols-3 gap-4 mt-6">
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
                  {businessSummary.map((business) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan Transaksi Detail</CardTitle>
          <CardDescription>
            Total {filteredIncomes.length + filteredExpenses.length} transaksi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                  ...filteredIncomes.map(income => ({
                    ...income,
                    transactionType: 'income' as const
                  })),
                  ...filteredExpenses.map(expense => ({
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
                {(filteredIncomes.length + filteredExpenses.length) === 0 && (
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
    </DashboardLayout>
  );
};

export default FinancialReports;
