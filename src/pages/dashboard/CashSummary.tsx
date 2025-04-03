
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "@/components/ui/charts";
import { useIncomeData } from "@/hooks/income/useIncomeData";
import { useExpenseData } from "@/hooks/expense/useExpenseData";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateFilterSelector from "@/components/filters/DateFilterSelector";

// Helper to create date handling functions
const createDateChangeHandler = (
  setDateRange: React.Dispatch<React.SetStateAction<{from: Date; to: Date}>>, 
  field: 'from' | 'to'
) => {
  return (date: Date | undefined) => {
    if (date) {
      setDateRange(prev => ({ ...prev, [field]: date }));
    }
  };
};

const CashSummary = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('yearly'); // Changed default to yearly
  const [viewType, setViewType] = useState<"summary" | "detailed">("summary");
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now);
    
    // For yearly view, set from to beginning of the year by default
    from.setMonth(0);
    from.setDate(1);
    
    return { from, to: now };
  });

  // Create date change handlers
  const handleFromDateChange = createDateChangeHandler(setDateRange, 'from');
  const handleToDateChange = createDateChangeHandler(setDateRange, 'to');

  // Get income and expense data
  const { 
    incomes, 
    isLoading: isLoadingIncome 
  } = useIncomeData(businessId);

  const { 
    expenses, 
    isLoading: isLoadingExpenses 
  } = useExpenseData(businessId);

  // Prepare chart data based on date range and active tab
  const [chartData, setChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });

  useEffect(() => {
    if (isLoadingIncome || isLoadingExpenses) return;

    // Filter data by date range
    const filteredIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= dateRange.from && incomeDate <= dateRange.to;
    });

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= dateRange.from && expenseDate <= dateRange.to;
    });

    // Calculate summary data
    const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;
    const transactionCount = filteredIncomes.length + filteredExpenses.length;

    setSummaryData({
      totalIncome,
      totalExpense,
      balance,
      transactionCount
    });

    // Prepare chart data
    if (activeTab === 'daily') {
      // Group by day for daily view
      const dataByDay = new Map<string, { income: number; expense: number }>();
      
      // Initialize all days in the range
      let currentDate = new Date(dateRange.from);
      while (currentDate <= dateRange.to) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        dataByDay.set(dateKey, { income: 0, expense: 0 });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Add incomes to their respective days
      filteredIncomes.forEach(income => {
        const dateKey = format(new Date(income.date), 'yyyy-MM-dd');
        const current = dataByDay.get(dateKey) || { income: 0, expense: 0 };
        dataByDay.set(dateKey, { 
          ...current, 
          income: current.income + income.amount 
        });
      });
      
      // Add expenses to their respective days
      filteredExpenses.forEach(expense => {
        const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
        const current = dataByDay.get(dateKey) || { income: 0, expense: 0 };
        dataByDay.set(dateKey, { 
          ...current, 
          expense: current.expense + expense.amount 
        });
      });
      
      // Convert to array for the chart
      const chartData = Array.from(dataByDay.entries())
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, data]) => ({
          name: format(new Date(date), 'dd/MM'),
          Pendapatan: data.income,
          Pengeluaran: data.expense,
          Saldo: data.income - data.expense
        }));
      
      setChartData(chartData);
    } else if (activeTab === 'monthly') {
      // Group by month for monthly view
      const dataByMonth = new Map<string, { income: number; expense: number }>();
      
      // Add incomes to their respective months
      filteredIncomes.forEach(income => {
        const monthKey = format(new Date(income.date), 'yyyy-MM');
        const current = dataByMonth.get(monthKey) || { income: 0, expense: 0 };
        dataByMonth.set(monthKey, { 
          ...current, 
          income: current.income + income.amount 
        });
      });
      
      // Add expenses to their respective months
      filteredExpenses.forEach(expense => {
        const monthKey = format(new Date(expense.date), 'yyyy-MM');
        const current = dataByMonth.get(monthKey) || { income: 0, expense: 0 };
        dataByMonth.set(monthKey, { 
          ...current, 
          expense: current.expense + expense.amount 
        });
      });
      
      // Convert to array for the chart
      const chartData = Array.from(dataByMonth.entries())
        .sort(([monthA], [monthB]) => new Date(monthA).getTime() - new Date(monthB).getTime())
        .map(([month, data]) => ({
          name: format(new Date(month), 'MMM yyyy'),
          Pendapatan: data.income,
          Pengeluaran: data.expense,
          Saldo: data.income - data.expense
        }));
      
      setChartData(chartData);
    } else {
      // Group by year for yearly view
      const dataByYear = new Map<string, { income: number; expense: number }>();
      
      // Add incomes to their respective years
      filteredIncomes.forEach(income => {
        const yearKey = format(new Date(income.date), 'yyyy');
        const current = dataByYear.get(yearKey) || { income: 0, expense: 0 };
        dataByYear.set(yearKey, { 
          ...current, 
          income: current.income + income.amount 
        });
      });
      
      // Add expenses to their respective years
      filteredExpenses.forEach(expense => {
        const yearKey = format(new Date(expense.date), 'yyyy');
        const current = dataByYear.get(yearKey) || { income: 0, expense: 0 };
        dataByYear.set(yearKey, { 
          ...current, 
          expense: current.expense + expense.amount 
        });
      });
      
      // Convert to array for the chart
      const chartData = Array.from(dataByYear.entries())
        .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
        .map(([year, data]) => ({
          name: year,
          Pendapatan: data.income,
          Pengeluaran: data.expense,
          Saldo: data.income - data.expense
        }));
      
      setChartData(chartData);
    }
  }, [incomes, expenses, dateRange, activeTab, isLoadingIncome, isLoadingExpenses]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ringkasan Keuangan</h1>
        <p className="text-gray-600">Pantau pendapatan dan pengeluaran usaha Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-800">Rp {summaryData.totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-800">Rp {summaryData.totalExpense.toLocaleString('id-ID')}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Saldo</p>
                <p className="text-2xl font-bold text-blue-800">Rp {summaryData.balance.toLocaleString('id-ID')}</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Jumlah Transaksi</p>
                <p className="text-2xl font-bold text-gray-800">{summaryData.transactionCount}</p>
              </div>
              <p className="text-sm text-gray-600">{format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="mb-8">
        <div className="p-6">
          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Grafik Aliran Kas</h2>
              <p className="text-gray-500">Visualisasi pendapatan dan pengeluaran</p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'daily' | 'monthly' | 'yearly')}>
                <TabsList>
                  <TabsTrigger value="daily">Harian</TabsTrigger>
                  <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                  <TabsTrigger value="yearly">Tahunan</TabsTrigger>
                </TabsList>
              </Tabs>

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

              <Select value={viewType} onValueChange={(value) => setViewType(value as "summary" | "detailed")}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipe Tampilan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Rangkuman</SelectItem>
                  <SelectItem value="detailed">Detail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-80 mb-4">
            {isLoadingIncome || isLoadingExpenses ? (
              <div className="flex justify-center items-center h-full">
                <p>Memuat data...</p>
              </div>
            ) : chartData.length > 0 ? (
              viewType === "summary" ? (
                <BarChart 
                  data={chartData} 
                  dataKeys={["Pendapatan", "Pengeluaran", "Saldo"]}
                  colors={["#10b981", "#ef4444", "#3b82f6"]} 
                />
              ) : (
                <LineChart 
                  data={chartData} 
                  dataKey="Pendapatan" 
                  stroke="#10b981" 
                  dataKey2="Pengeluaran" 
                  stroke2="#ef4444" 
                />
              )
            ) : (
              <div className="flex justify-center items-center h-full">
                <p>Tidak ada data dalam periode yang dipilih.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6">
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
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default CashSummary;
