
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  getIncomesByDateRange, 
  getExpensesByDateRange, 
  getBusinessByName 
} from "@/services/businessService";
import { Business, Income, Expense } from "@/types/supabase";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

const Dashboard = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const toDate = endOfMonth(new Date());
  const fromDate = startOfMonth(subMonths(toDate, 6));

  // Format the data for charts
  const [chartData, setChartData] = useState({
    income: [] as any[],
    expense: [] as any[],
    cashFlow: [] as any[],
    summary: [] as any[]
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch business info if we have a name instead of ID
        let businessIdToUse = businessId;
        if (businessId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(businessId)) {
          const businessData = await getBusinessByName(businessId);
          if (businessData) {
            setBusiness(businessData);
            businessIdToUse = businessData.id;
          }
        }

        // Fetch incomes and expenses data
        const [incomesData, expensesData] = await Promise.all([
          getIncomesByDateRange(fromDate, toDate, businessIdToUse),
          getExpensesByDateRange(fromDate, toDate, businessIdToUse)
        ]);

        setIncomes(incomesData);
        setExpenses(expensesData);

        // Process data for charts
        const monthsMap = new Map();
        for (let i = 0; i <= 6; i++) {
          const date = subMonths(toDate, i);
          const monthKey = format(date, 'MMM');
          monthsMap.set(monthKey, { income: 0, expense: 0 });
        }

        // Aggregate income data by month
        incomesData.forEach(income => {
          const monthKey = format(new Date(income.date), 'MMM');
          if (monthsMap.has(monthKey)) {
            const monthData = monthsMap.get(monthKey);
            monthData.income += Number(income.amount);
            monthsMap.set(monthKey, monthData);
          }
        });

        // Aggregate expense data by month
        expensesData.forEach(expense => {
          const monthKey = format(new Date(expense.date), 'MMM');
          if (monthsMap.has(monthKey)) {
            const monthData = monthsMap.get(monthKey);
            monthData.expense += Number(expense.amount);
            monthsMap.set(monthKey, monthData);
          }
        });

        // Convert to arrays for charts
        const incomeData: any[] = [];
        const expenseData: any[] = [];
        const cashFlowData: any[] = [];
        
        // Reverse to show from oldest to newest
        const sortedMonths = Array.from(monthsMap.entries()).reverse();
        
        sortedMonths.forEach(([month, data]) => {
          incomeData.push({ name: month, value: data.income });
          expenseData.push({ name: month, value: data.expense });
          cashFlowData.push({ 
            name: month, 
            income: data.income, 
            expense: data.expense 
          });
        });

        // Calculate totals for summary pie chart
        const totalIncome = incomesData.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalExpense = expensesData.reduce((sum, item) => sum + Number(item.amount), 0);
        const netCash = totalIncome - totalExpense;

        const summaryData = [
          { name: 'Pendapatan', value: totalIncome },
          { name: 'Pengeluaran', value: totalExpense },
          { name: 'Kas Bersih', value: netCash > 0 ? netCash : 0 }
        ];

        setChartData({
          income: incomeData,
          expense: expenseData,
          cashFlow: cashFlowData,
          summary: summaryData
        });

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId) {
      fetchData();
    }
  }, [businessId, fromDate, toDate]);

  // Calculate total income, expense, and net cash
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpense = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const netCash = totalIncome - totalExpense;

  // Calculate month-over-month change
  const lastMonthIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate >= startOfMonth(subMonths(new Date(), 1)) && 
           incomeDate <= endOfMonth(subMonths(new Date(), 1));
  });
  
  const twoMonthsAgoIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate >= startOfMonth(subMonths(new Date(), 2)) && 
           incomeDate <= endOfMonth(subMonths(new Date(), 2));
  });

  const lastMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(subMonths(new Date(), 1)) && 
           expenseDate <= endOfMonth(subMonths(new Date(), 1));
  });
  
  const twoMonthsAgoExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(subMonths(new Date(), 2)) && 
           expenseDate <= endOfMonth(subMonths(new Date(), 2));
  });

  const lastMonthTotalIncome = lastMonthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const twoMonthsAgoTotalIncome = twoMonthsAgoIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const incomeChangePercent = twoMonthsAgoTotalIncome === 0 
    ? 100 
    : Math.round((lastMonthTotalIncome - twoMonthsAgoTotalIncome) / twoMonthsAgoTotalIncome * 100);

  const lastMonthTotalExpense = lastMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const twoMonthsAgoTotalExpense = twoMonthsAgoExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const expenseChangePercent = twoMonthsAgoTotalExpense === 0
    ? 0
    : Math.round((lastMonthTotalExpense - twoMonthsAgoTotalExpense) / twoMonthsAgoTotalExpense * 100);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Memuat data dashboard...</p>
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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard - {business?.name || businessId}</h1>
          <p className="text-gray-500">Selamat datang di dashboard keuangan Anda.</p>
        </header>

        <Tabs defaultValue="ringkasan" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
            <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="arus-kas">Arus Kas</TabsTrigger>
            <TabsTrigger value="laporan">Laporan</TabsTrigger>
          </TabsList>
          <TabsContent value="ringkasan" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Pendapatan</CardTitle>
                  <CardDescription>Ringkasan pendapatan keseluruhan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</div>
                  <div className="flex items-center text-sm mt-2">
                    {incomeChangePercent >= 0 ? (
                      <ArrowUpCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    <span className={incomeChangePercent >= 0 ? "text-green-500" : "text-red-500"}>
                      {incomeChangePercent}% dari bulan lalu
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Pengeluaran</CardTitle>
                  <CardDescription>Ringkasan pengeluaran keseluruhan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">Rp {totalExpense.toLocaleString('id-ID')}</div>
                  <div className="flex items-center text-sm mt-2">
                    {expenseChangePercent <= 0 ? (
                      <ArrowDownCircle className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    <span className={expenseChangePercent <= 0 ? "text-green-500" : "text-red-500"}>
                      {Math.abs(expenseChangePercent)}% {expenseChangePercent <= 0 ? "turun" : "naik"} dari bulan lalu
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Arus Kas Bersih</CardTitle>
                  <CardDescription>Ringkasan arus kas bersih</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netCash >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    Rp {netCash.toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {netCash >= 0 ? "Positif" : "Negatif"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Grafik Pendapatan</CardTitle>
                  <CardDescription>Analisis tren pendapatan dari waktu ke waktu</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={chartData.income} dataKey="value" stroke="#82ca9d" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grafik Pengeluaran</CardTitle>
                  <CardDescription>Analisis tren pengeluaran dari waktu ke waktu</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={chartData.expense} dataKey="value" fill="#e48080" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pendapatan">
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={chartData.income} dataKey="value" stroke="#82ca9d" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pengeluaran">
            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={chartData.expense} dataKey="value" fill="#e48080" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arus-kas">
            <Card>
              <CardHeader>
                <CardTitle>Arus Kas</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={chartData.cashFlow}
                  dataKey="income"
                  stroke="#82ca9d"
                  dataKey2="expense"
                  stroke2="#e48080"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="laporan">
            <Card>
              <CardHeader>
                <CardTitle>Laporan</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={chartData.summary} dataKey="value" nameKey="name" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
