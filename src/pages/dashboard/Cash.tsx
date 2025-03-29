
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Income, Expense } from "@/types/business";
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Wallet } from "lucide-react";

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

const CashSummary = () => {
  const { businessId } = useParams<{ businessId: string }>();
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Get month range for filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Filter transactions for the selected business and month
  const filteredIncomes = useMemo(() => {
    return dummyIncomes.filter(
      (income) => 
        income.businessId === businessId &&
        isWithinInterval(income.date, { start: monthStart, end: monthEnd })
    );
  }, [businessId, monthStart, monthEnd]);

  const filteredExpenses = useMemo(() => {
    return dummyExpenses.filter(
      (expense) => 
        expense.businessId === businessId &&
        isWithinInterval(expense.date, { start: monthStart, end: monthEnd })
    );
  }, [businessId, monthStart, monthEnd]);

  // Calculate totals
  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  }, [filteredIncomes]);

  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const balance = totalIncome - totalExpense;

  // Group incomes by type
  const incomeByType = useMemo(() => {
    return filteredIncomes.reduce((acc, income) => {
      if (!acc[income.type]) {
        acc[income.type] = 0;
      }
      acc[income.type] += income.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredIncomes]);

  // Group expenses by type
  const expenseByType = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.type]) {
        acc[expense.type] = 0;
      }
      acc[expense.type] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredExpenses]);

  // Recent transactions (combined and sorted)
  const recentTransactions = useMemo(() => {
    const incomes = filteredIncomes.map(income => ({
      ...income,
      transactionType: 'income' as const
    }));
    
    const expenses = filteredExpenses.map(expense => ({
      ...expense,
      transactionType: 'expense' as const
    }));
    
    return [...incomes, ...expenses].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    ).slice(0, 5);
  }, [filteredIncomes, filteredExpenses]);

  const handlePreviousMonth = () => {
    setSelectedMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prevMonth => subMonths(prevMonth, -1));
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">KasKu</h1>
        <p className="text-gray-600">Ringkasan kas untuk usaha Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Ringkasan Kas</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  &lt;
                </Button>
                <span className="px-2">
                  {format(selectedMonth, "MMMM yyyy")}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  &gt;
                </Button>
              </div>
            </div>
            <CardDescription>
              Periode {format(monthStart, "d MMMM")} - {format(monthEnd, "d MMMM yyyy")}
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
              
              <Card className={`border-${balance >= 0 ? 'blue' : 'red'}-100`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Saldo</p>
                      <p className={`text-2xl font-bold text-${balance >= 0 ? 'blue' : 'red'}-600`}>
                        Rp {balance.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className={`h-10 w-10 rounded-full bg-${balance >= 0 ? 'blue' : 'red'}-100 flex items-center justify-center`}>
                      <Wallet className={`h-6 w-6 text-${balance >= 0 ? 'blue' : 'red'}-600`} />
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
            <CardDescription>5 transaksi terakhir bulan ini</CardDescription>
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
                        <div className="flex items-center text-xs text-gray-500">
                          {format(transaction.date, "dd MMM yyyy")} · {transaction.type}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transactionType === 'income' ? '+' : '-'} Rp {transaction.amount.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6">Tidak ada transaksi pada bulan ini.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CashSummary;
